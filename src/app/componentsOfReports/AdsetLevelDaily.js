"use client"
import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import moment from 'moment-timezone';
import React from 'react';
import { Input, Button, Row, Col, Typography, Result, Modal, message, Switch, Spin, Badge, Menu, Dropdown, Tooltip, Space } from 'antd';
import {
    NumberOutlined, GlobalOutlined, InfoCircleOutlined, DownloadOutlined, SmileOutlined, CopyOutlined, EditOutlined, MessageOutlined, PauseCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined, LinkOutlined, PushpinOutlined, FilterOutlined, DownOutlined, PlusOutlined, PictureOutlined, LikeOutlined,
    CommentOutlined,
    ShareAltOutlined
} from '@ant-design/icons';
import { RxSwitch } from "react-icons/rx";
import 'antd/dist/reset.css';
import '../globals.css';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useTokenContext } from '../components/parent';

// const CampaignLevelReports = React.lazy(() => import('./CampaignLevel'));
// const AdsetLevelReports = React.lazy(() => import('./AdsetLevel'));
// const AdLevelReports = React.lazy(() => import('./AdLevel'));

const contentStyle = {
    margin: "10px",
    // height: '800px',
    color: '#66fc03',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#fbfcfa',

};
const { Text } = Typography;
const newtworkCollections = {
    "FB_Mnet": "Facebook_Mnet_Daily",
    "FB_MnetBing": "Facebook_MnetBing_Daily",
    "FB_Enki": "Facebook_Enki",
    "FB_System1": 'Facebook_System1',
    "FB_Rsoc": 'Facebook_Rsoc',
    "FB_Tonic": 'Facebook_Tonic',
    "FB_DomainActive": "Facebook_DActive_Names",
    "FB_Bodies": "Facebook_Bodies",
    "FB_Bodies1": "Facebook_Bodies1",
    "Newsbreak_DA": "Newsbreak_DomainActive",
    "FB_Tonic1": "Facebook_Tonic1",
    "FB_Sedo": "Facebook_Sedo",
    "FB_Inmobi": "Facebook_Inmobi",
    "FB_TonicRsoc": "Facebook_TonicRsoc",
    "FB_InuvoPrism": "Facebook_InuvoPrism_Daily",
    "FB_CodeFuel": "Facebook_CodeFuel_Daily",
    "FB_Predicto": "Facebook_Mnet_AD",
    "FB_Affinity": "Facebook_Mnet_AD",
    "FB_Botup": "Facebook_Mnet_AD",
    "FB_MWG": "Facebook_Mwg_Daily",
    "FB_Media":"Facebook_Media_Daily"
}
const selectTimezone = {
    UTC: 'UTCDate',
    EEST: 'EESTDate',
    EDT: 'EDTDate',
    CST: 'CSTDate',
    PDT: 'PDTDate',
    IST: 'ISTDate',
    BST: 'BSTDate',
    GMT: 'GMTDate',
    MST: 'MSTDate',
    CDT: 'CDTDate',
    AST: 'ASTDate',
    DST: 'DSTDate',
    CEST: 'CESTDate'
};


const Daily = ({ functionCallForCommnets, context, taxDetails, activeTab, functionCallForCampaigns, startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, campaignComments, setCampaignComments, Camapignlevelstatus, setCamapignlevelstatus, changeRRefrst, debouncedHandleColumnMove, userdetails, refreshComments, refreshpage, getMainMenuItems, toggleStatus, handleChangeToggle, selectedAdsets, showAdsetLevel, removeSelectedAdsets, selectedCampaigns, moveToNextTab, accountsAccess, commentsMap }) => {
    const { theme, apiClient } = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

    const [dailyData, setdailyData] = useState([]);
    const newRowDataForFilter = useRef([]);

    const [campaignStatusFilter, setcampaignStatusLabel] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");

    const [insideInput, setInsideInput] = useState("");

    const [dailyFixedFooter, setDailyFixedFooter] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedCells, setSelectedCells] = useState([]);
    const [firstSelectedCell, setFirstSelectedCell] = useState(null);

    const [isLoading1, setLoading1] = useState(true);

    const timezone = useRef();

    const gridRef1 = useRef();

    const newDailyData = useRef();

    const oneTimeFetch = useRef(true);

    const [apiStatus, setApiStatus] = useState(false);

    const [selectedAdset, setSelectedAdset] = useState([]);

    const fbCron = useRef('-');
    const revenueCron = useRef('-');
    const cronStatus = useRef('-');
    const accountStatus = useRef('-');


    const memorizedColumnDef1 = useMemo(() => columnDefs.current, [columnDefs.current]);
    // const memorizedDailyData = useMemo(() => dailyData?.filter((each) => {
    //     const normalizedCampaign = each.campaignname.trim().toLowerCase();
    //     const normalizedInput = inputValue.trim().toLowerCase();
    //     return (
    //         normalizedCampaign.startsWith(normalizedInput) ||
    //         normalizedCampaign.includes(normalizedInput) ||
    //         normalizedCampaign.endsWith(normalizedInput)
    //     );
    // }
    // ), [dailyData, inputValue, theme]);

    const memorizedDailyData = useMemo(() => {
        let filtered = dailyData || [];

        const normalizedInput = inputValue.trim().toLowerCase();
        const normalizedInside = insideInput.trim().toLowerCase();

        // 1️⃣ FIRST FILTER → by inputValue (only adname)
        if (normalizedInput) {
            filtered = filtered.filter((each) => {
                const adsetname = (each?.adsetname || "").trim().toLowerCase();
                const accountNumber = (each?.accountNumber || "").toString().trim().toLowerCase();
                const campaignId = (each?.campaignid || "").toString().trim().toLowerCase();
                const adsetId = (each?.adsetid || "").toString().trim().toLowerCase();
                return (
                    adsetname.startsWith(normalizedInput) ||
                    adsetname.includes(normalizedInput) ||
                    adsetname.endsWith(normalizedInput) ||
                    accountNumber.includes(normalizedInput) ||
                    campaignId.includes(normalizedInput) ||
                    adsetId.includes(normalizedInput)
                );
            });
        }

        // 2️⃣ SECOND FILTER → by insideInput (all fields)
        if (normalizedInside) {
            filtered = filtered.filter((each) => {
                const adsetname = (each?.adsetname || "").trim().toLowerCase();
                const accountNumber = (each?.accountNumber || "").toString().trim().toLowerCase();
                const campaignId = (each?.campaignid || "").toString().trim().toLowerCase();
                const adsetId = (each?.adsetid || "").toString().trim().toLowerCase();

                return (
                    adsetname.includes(normalizedInside) ||
                    accountNumber.includes(normalizedInside) ||
                    campaignId.includes(normalizedInside) ||
                    adsetId.includes(normalizedInside)
                );
            });
        }

        return filtered;
    }, [dailyData, inputValue, insideInput]);

    const [leafCampaigns, setLeafCampaigns] = useState([]);
    const [isBulkCommentModalVisible, setIsBulkCommentModalVisible] = useState(false);
    const [comment, setComment] = useState("");
    const [isBulkStatusModalVisible, setIsBulkStatusModalVisible] = useState(false);
    const [bulkStatusAction, setBulkStatusAction] = useState(null);
    const [confirmBulkLoading, setConfirmBulkLoading] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulkCategory, setBulkCategory] = useState("");
    const [campaignIds, setCampaignIds] = useState([]);
    const [adLevelCreatives, setAdLevelCreatives] = useState([]);


    // useEffect to show selected campaigns after clearing search
    // useEffect(() => {
    //     const api = gridRef1.current?.api;
    //     if (!api) return;

    //     if (inputValue.trim() === '' && selectedAdset.length > 0) {
    //         const selectedIds = selectedAdset.map(item => item.adsetid);
    //         const selectedOnly = dailyData.filter(item => selectedIds.includes(item.adsetid));

    //         // ✅ Replace rows
    //         api.applyTransaction({ replace: true, data: selectedOnly });

    //         // ✅ Reselect those rows
    //         setTimeout(() => {
    //             api.forEachNode((node) => {
    //                 if (selectedIds.includes(node.data?.adsetid)) {
    //                     node.setSelected(true);
    //                 }
    //             });
    //         }, 0);
    //     } else if (inputValue.trim() === '' && selectedAdset.length === 0) {
    //         api.applyTransaction({ replace: true, data: dailyData });
    //     }
    // }, [inputValue, selectedAdset, dailyData]);

    useEffect(() => {
        const totalWithTax = memorizedDailyData?.reduce((acc, curr) => {
            const spend = Number(curr.spend) || 0;

            const accountTax = taxDetails?.find(
                item =>
                    String(item.accountNumber) ===
                    String(curr.accountNumber)
            );

            const taxRate =
                parseFloat(
                    String(accountTax?.tax || "0").replace("%", "")
                ) || 0;

            return acc + spend + (spend * taxRate) / 100;
        }, 0);
        setDailyFixedFooter(
            [
                {
                    campaignName: 'Total',
                    actions: '',
                    spend: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
                    revenue: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
                    profit: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
                    margin: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
                    rpc: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / memorizedDailyData?.length).toFixed(2)),
                    cpl: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / memorizedDailyData?.length).toFixed(2)),
                    ncpl: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / memorizedDailyData?.length).toFixed(2)),
                    fbleads: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
                    conversions: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
                    fmargin: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                    roi: parseFloat(((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                    cpc: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / memorizedDailyData?.length).toFixed(2)),
                    fbclicks: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
                    cpclinkclicks: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks), 0) / memorizedDailyData?.length).toFixed(2)),
                    fblinkclicks: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0).toFixed(2)),
                    impressions: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
                    tq: parseFloat(
                        memorizedDailyData?.reduce((acc, curr) => {
                            const tqValue = Number(curr?.tq);
                            return acc + (isNaN(tqValue) ? 0 : tqValue);
                        }, 0).toFixed(2)
                    ),
                    ctr: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)),
                    tax: Number(totalWithTax.toFixed(2)),
                }
            ]
        );
    }, [memorizedDailyData]);

    // const onBtExport = (gridRef, text) => {
    //     const Details = {
    //         network: newRevenuePratner,
    //         account: newaccount,
    //         dateRange: `From ${startDate} to ${endDate}`,
    //         type: text,
    //         email: userdetails?.email,
    //         time: moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A")
    //     }
    //     if (gridRef.current) {
    //         gridRef.current.api.exportDataAsCsv({
    //             processCellCallback: (params) => {
    //                 const node = params.node;
    //                 if (node.group) {
    //                     return null;
    //                 }
    //                 return params.value;
    //             },
    //             shouldRowBeSkipped: (params) => {
    //                 return params.node.group;
    //             },
    //         });
    //     } else {
    //         console.error("Grid reference is null");
    //     }
    //     const updateDetails = async () => {
    //         await apiClient.post('/UserExportActivities/', { Details });
    //     }
    //     updateDetails();
    // };

    // const onSelectionChanged = (event) => {
    //     const selectedNodes = event.api.getSelectedNodes();
    //     const selectedData = selectedNodes.map(node => node.data);
    //     console.log("Selected Adsets:", selectedData);
    //     showAdsetLevel(selectedData);
    // };

    const onBtExport = (gridRef, text) => {
        const Details = {
            network: newRevenuePratner,
            account: newaccount,
            dateRange: `From ${startDate} to ${endDate}`,
            type: text,
            email: userdetails?.email,
            time: moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A"),
        };

        if (!gridRef.current) {
            console.error("Grid reference is null");
            return;
        }


        const adsetIdNameMap = {};

        gridRef.current.api.forEachLeafNode(node => {
            const d = node.data;
            if (d?.adsetid && d?.adsetname) {
                adsetIdNameMap[String(d.adsetid)] = d.adsetname;
            }
        });

        gridRef.current.api.exportDataAsCsv({


            processRowGroupCallback: (params) => {
                const key = String(params.node.key); // adsetid
                return adsetIdNameMap[key] || key;
            },


            processCellCallback: (params) => {
                const colId = params.column.getColId();
                const d = params.data;

                if (!d) return params.value;
                if (colId === "adsetid") {
                    return d.adsetname || params.value;
                }

                return params.value;
            }
        });

        apiClient.post('/reports/commonapis/userexportactivities', { Details }).catch(console.error);
    };

    const uniqueByAdsetId = (arr) => {
        const map = new Map();
        arr.forEach(obj => {
            if (!map.has(obj.adsetid)) {
                map.set(obj.adsetid, obj);
            }
        });
        return Array.from(map.values());
    };


    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);

        // Store selection persistently
        setSelectedAdset(uniqueByAdsetId(selectedData));

        // Keep your existing functionality
        showAdsetLevel(selectedData);
        // console.log(selectedData, "selectedData")

        const leafCampaignsData = selectedNodes
            .filter(node => !node.group && node.data)
            .map(node => ({
                campaignid: node.data.campaignid,
                campaignname: node.data.campaignname,
                accountNumber: node.data.accountNumber,
                category: node.data.category,
                adsetid: node.data.adsetid,
                adsetname: node.data.adsetname,
                fbStatus: node.data.fbStatus,
                level: "adset",
            }))
            .filter(item => item.adsetid && item.adsetname);

        const uniqueLeafCampaigns = Array.from(
            new Map(
                leafCampaignsData.map(item => [`${item.adsetid}_${item.accountNumber}`, item])
            ).values()
        );


        setLeafCampaigns(uniqueLeafCampaigns);
        // console.log(" Selected unique Adsets:", uniqueLeafCampaigns);
    };
    const handleBulkSmartPinAdset = async (action) => {
        if (!leafCampaigns || leafCampaigns.length === 0) {
            message.warning("Select at least one adset");
            return;
        }

        const data = leafCampaigns.map(item => ({
            accountNumber: item.accountNumber,
            campaignid: item.campaignid,
            adsetid: item.adsetid,
            level: "adset",
            userPin: userdetails?.email,
            activity: {
                editType: "Pin",
                campaignid: item.campaignid,       // cents
                adsetid: item.adsetid,
                Account: item.accountNumber,    // ✅ update *this* row’s account
                campaignname: item.campaignname,
                adsetname: item.adsetname,
                updatedBy: userdetails?.userName,
                updatedUserEmail: userdetails?.email,
                updateType: "Adset pin updated",
                updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                updateDetail: `From "${action === "pin" ? "unpin" : "pin"}" to "${action === "pin" ? "pin" : "unpin"}"`,
            }
        }));

        message.loading(
            `${action === "pin" ? "Pinning" : "Unpinning"} selected adsets...`,
            0
        );

        const apiUrl =
            action === "pin"
                ? "/reports/bulkactions/pin"
                : "/reports/bulkactions/unpin";

        const res = await apiClient.post(apiUrl, { items: data });

        message.destroy();
        message.success(res.data.message);

        const timeStamp = moment()
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD hh:mm:ss A");

        setCampaignComments((prev) => {
            const arr = [...prev];

            data.forEach(item => {
                const index = arr.findIndex(
                    i =>
                        String(i.campaignid) === String(item.campaignid) &&
                        String(i.Account) === String(item.accountNumber) &&
                        String(i.adsetid) === String(item.adsetid) &&
                        i.level === "adset"
                );

                if (index >= 0) {
                    arr[index] = {
                        ...arr[index],
                        pinned: action === "pin",
                        userPin: userdetails?.email,
                        editedPinTime: timeStamp
                    };
                }
                else {
                    arr.push({
                        campaignid: item.campaignid,
                        Account: item.accountNumber,
                        adsetid: item.adsetid,
                        level: "adset",
                        pinned: action === "pin",
                        userPin: userdetails?.email,
                        editedPinTime: timeStamp
                    });
                }

            });

            return arr;
        });
    };
    const handleBulkDeleteComments = async () => {
        try {
            message.loading({
                content: 'Deleting comments for selected campaigns...',
                key: 'bulkDelete'
            });


            const items = leafCampaigns.map(item => ({
                campaignid: item.campaignid,
                adsetid: item.adsetid,
                activity: {
                    editType: "Comment",
                    campaignid: item.campaignid,       // cents
                    adsetid: item.adsetid,
                    Account: item.accountNumber,    // ✅ update *this* row’s account
                    campaignname: item.campaignname,
                    adsetname: item.adsetname,
                    updatedBy: userdetails?.userName,
                    updatedUserEmail: userdetails?.email,
                    updateType: "Adset comment cleared",
                    updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                    // updateDetail: `From ${updatedPinStatus ? "unpin" : "pin"} to ${updatedPinStatus ? "pin" : "unpin"}`,
                }
            }));

            const body = {
                accountNumber: leafCampaigns?.[0]?.accountNumber,
                level: 'adset',
                items
            };

            const resp = await apiClient.post(
                '/reports/bulkactions/comments/delete',
                body
            );

            if (resp.status === 200 || resp.status === 201) {
                const timeStamp = moment()
                    .tz('Asia/Kolkata')
                    .format('YYYY-MM-DD hh:mm:ss A');

                setCampaignComments(prev => {
                    const arr = [...prev];

                    leafCampaigns.forEach(item => {
                        const idx = arr.findIndex(
                            i =>
                                String(i.campaignid) === String(item.campaignid) &&
                                String(i.adsetid) === String(item.adsetid) &&
                                String(i.Account) === String(item.accountNumber) &&
                                i.level === 'adset'
                        );

                        if (idx >= 0) {
                            arr[idx] = {
                                ...arr[idx],
                                comment: "",
                                usercommit: userdetails?.email,
                                editedTime: timeStamp
                            };
                        }
                    });

                    return arr;
                });

                message.success({
                    content: `${leafCampaigns.length} comment(s) deleted successfully`,
                    key: 'bulkDelete',
                    duration: 3
                });

                setIsBulkCommentModalVisible(false);
            }
        } catch (error) {
            console.error('Bulk delete error:', error);
            message.error({
                content: 'Error while deleting comments for selected campaigns.',
                key: 'bulkDelete'
            });
        }
    };
    const handleSmartCommentSubmitAdset = async () => {
        try {
            message.loading({
                content: 'Saving comments for selected adsets...',
                key: 'bulkCommentAdset'
            });

            const items = leafCampaigns.map(item => ({
                accountNumber: item.accountNumber,
                campaignid: item.campaignid,
                adsetid: item.adsetid,
                campaignname: item.adsetname,
                comment,
                usercommit: userdetails?.email,
                level: "adset",
                activity: {
                    editType: "Comment",
                    campaignid: item.campaignid,       // cents
                    adsetid: item.adsetid,
                    Account: item.accountNumber,    // ✅ update *this* row’s account
                    campaignname: item.campaignname,
                    adsetname: item.adsetname,
                    updatedBy: userdetails?.userName,
                    updatedUserEmail: userdetails?.email,
                    updateType: "Adset pin updated",
                    updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                    // updateDetail: `From ${updatedPinStatus ? "unpin" : "pin"} to ${updatedPinStatus ? "pin" : "unpin"}`,
                }
            }));

            const resp = await apiClient.post(
                '/reports/bulkactions/comments',
                { items, usercommit: userdetails?.email }
            );

            if (resp.status === 200 || resp.status === 201) {
                const timeStamp = moment().tz('Asia/Kolkata')
                    .format('YYYY-MM-DD hh:mm:ss A');

                setCampaignComments(prev => {
                    const arr = [...prev];

                    leafCampaigns.forEach(item => {
                        const idx = arr.findIndex(
                            i =>
                                String(i.campaignid) === String(item.campaignid) &&
                                String(i.Account) === String(item.accountNumber) &&
                                String(i.adsetid) === String(item.adsetid) &&
                                i.level === 'adset'
                        );

                        if (idx >= 0) {
                            arr[idx] = {
                                ...arr[idx],
                                comment,
                                usercommit: userdetails?.email,
                                editedTime: timeStamp
                            };
                        } else {
                            arr.push({
                                campaignid: item.campaignid,
                                Account: item.accountNumber,
                                adsetid: item.adsetid,
                                campaignname: item.adsetname,
                                level: 'adset',
                                comment,
                                usercommit: userdetails?.email,
                                editedTime: timeStamp
                            });
                        }
                    });

                    return arr;
                });

                message.success({
                    content: `${leafCampaigns.length} comment(s) saved successfully`,
                    key: 'bulkCommentAdset',
                    duration: 3
                });

                setIsBulkCommentModalVisible(false);
            }

        } catch (error) {
            console.error('Bulk adset comment error:', error);
            message.error('Error while saving comments for selected adsets.');
        }
    };
    const handleBulkAdsetStatusSubmit = async () => {
        try {
            setConfirmBulkLoading(true);

            const token = localStorage.getItem("token");


            // const filteredItems = leafCampaigns.filter(item =>
            //     bulkStatusAction === "ACTIVE"
            //         ? item.fbStatus === "PAUSED"
            //         : item.fbStatus === "ACTIVE"
            // )
            //     .map(item => ({
            //         status: bulkStatusAction,
            //         campaign_id: item.campaignid,
            //         adset_id: item.adsetid,
            //         accountNumber: String(item.accountNumber),
            //         name: item.adsetname,
            //         email: userdetails?.email
            //     }));

            // Build adset status lookup
            const adsetStatusMap = new Map(
                Camapignlevelstatus.flatMap(campaign =>
                    (campaign.adsets || []).map(adset => [
                        String(adset.adset_id),
                        adset.status?.toUpperCase()
                    ])
                )
            );

            // Filter leaf adsets that actually need status change
            const filteredItems = leafCampaigns
                .filter(item => {
                    const adsetId = String(item.adsetid);
                    const currentStatus =
                        adsetStatusMap.get(adsetId) || "ACTIVE";

                    return bulkStatusAction === "ACTIVE"
                        ? currentStatus === "PAUSED"
                        : currentStatus === "ACTIVE";
                })
                .map(item => ({
                    status: bulkStatusAction,
                    campaign_id: item.campaignid,
                    adset_id: item.adsetid,
                    accountNumber: String(item.accountNumber),
                    name: item.adsetname,
                    email: userdetails?.email,
                    activity: {
                        editType: "Status",
                        campaignid: item.campaignid,       // cents
                        adsetid: item.adsetid,
                        Account: String(item.accountNumber),    // ✅ update *this* row’s account
                        campaignname: item.campaignname,
                        adsetname: item.adsetname,
                        updatedBy: userdetails?.userName,
                        updatedUserEmail: userdetails?.email,
                        updateType: "Adset status updated",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: `From ${bulkStatusAction === "ACTIVE" ? "Inactive" : "Active"} to ${bulkStatusAction === "ACTIVE" ? "Active" : "Inactive"}`,
                    }
                }));


            if (filteredItems.length === 0) {
                message.info("No adsets need updating.");
                setIsBulkStatusModalVisible(false);
                setConfirmBulkLoading(false);
                return;
            }

            const resp = await apiClient.post(
                "/reports/bulkactions/adsetstatus",
                { items: filteredItems },
                { headers: { Authorization: token } }
            );

            if (resp.status === 200 || resp.status === 201) {
                const updatedCampaignLevelStatus = (() => {
                    let arr = Array.isArray(Camapignlevelstatus)
                        ? [...Camapignlevelstatus]
                        : [];

                    filteredItems.forEach(update => {
                        const { campaign_id, adset_id, accountNumber, status } = update;

                        arr = arr.map(item =>
                            String(item.campaign_id) === String(campaign_id) &&
                                String(item.accountNumber) === String(accountNumber)
                                ? {
                                    ...item,
                                    adsets: (item.adsets || []).map(adset =>
                                        String(adset.adset_id) === String(adset_id)
                                            ? { ...adset, status }
                                            : adset
                                    )
                                }
                                : item
                        );
                    });

                    return arr;
                })();
                setCamapignlevelstatus(updatedCampaignLevelStatus);
                // if (campaignStatusFilter !== "All") {
                //     const adsetStatusMap = new Map(
                //         updatedCampaignLevelStatus.flatMap(campaign =>
                //             (campaign.adsets || []).map(adset => [
                //                 String(adset.adset_id),
                //                 adset.status?.toUpperCase()
                //             ])
                //         )
                //     );

                //     const filteredRowObjects = newRowDataForFilter.current.filter(row =>
                //         adsetStatusMap.get(String(row.adsetid)) ===
                //         campaignStatusFilter?.toUpperCase()
                //     );

                //     setdailyData(filteredRowObjects);
                // }
                // setCamapignlevelstatus(prev => {
                //     let arr = [...prev];

                //     filteredItems.forEach(update => {
                //         const { campaign_id, adset_id, accountNumber, status } = update;

                //         arr = arr.map(item =>
                //             String(item.campaign_id) === String(campaign_id) &&
                //                 String(item.accountNumber) === String(accountNumber)
                //                 ? {
                //                     ...item,
                //                     adsets: (item.adsets || []).map(adset =>
                //                         String(adset.adset_id) === String(adset_id)
                //                             ? { ...adset, status }
                //                             : adset
                //                     )
                //                 }
                //                 : item
                //         );
                //     });

                //     return arr;
                // });

                message.success(
                    `${filteredItems.length} adset(s) updated to ${bulkStatusAction.toLowerCase()}`
                );
            }

        } catch (e) {
            message.error("Bulk adset update failed.");
            console.error(e);
        } finally {
            setIsBulkStatusModalVisible(false);
            setConfirmBulkLoading(false);
        }
    };


    const openBulkCategoryModal = () => {
        setBulkOpen(true);
        setBulkCategory("");
    };
    // const saveBulkCategory = async () => {
    //     if (!bulkCategory.trim()) {
    //         message.warning("Enter category");
    //         return;
    //     }

    //     const token = localStorage.getItem("token");
    //     const items = leafCampaigns
    //         .filter(item => !item.category || item.category.trim() === "")
    //         .map(item => ({
    //             accountNumber: item.accountNumber,
    //             campaignid: item.campaignid,
    //             level: "campaign",
    //             campaignname: item.campaignname,
    //         }));

    //     if (items.length === 0) {
    //         message.info("All selected campaigns already have a category. Nothing to update.");
    //         setBulkOpen(false);
    //         return;
    //     }

    //     try {
    //         message.loading({ content: "Updating category...", key: "bulkCategory" });

    //         await apiClient.post(
    //             "/BulkUpdateCategory",
    //             { items, category: bulkCategory },
    //             { headers: { Authorization: token } }
    //         );
    //         setCampaignComments(prev => {
    //             const arr = [...prev];
    //             setLeafCampaigns(prev =>
    //                 prev.map(item =>
    //                     (!item.category || item.category.trim() === "")
    //                         ? { ...item, category: bulkCategory }
    //                         : item
    //                 )
    //             )
    //             items.forEach(item => {
    //                 const idx = arr.findIndex(
    //                     i =>
    //                         String(i.campaignid) === String(item.campaignid) &&
    //                         String(i.Account) === String(item.accountNumber) &&
    //                         i.level === "campaign"
    //                 );

    //                 if (idx >= 0) {
    //                     if (arr[idx] && arr[idx].category) {
    //                         arr[idx].category = arr[idx].category;
    //                     } else {
    //                         arr[idx].category = bulkCategory;
    //                     }

    //                 } else {
    //                     arr.push({
    //                         campaignid: item.campaignid,
    //                         Account: item.accountNumber,
    //                         level: "campaign",
    //                         category: bulkCategory
    //                     });
    //                 }
    //             });

    //             return arr;
    //         });
    //         leafCampaigns.forEach(item => {
    //             const key = `${item.campaignid}_${item.accountNumber}_campaign`;
    //             commentsMap.set(key, { category: bulkCategory });
    //         });

    //         message.success({ content: "Category updated!", key: "bulkCategory" });

    //     } catch (err) {
    //         console.error(err);
    //         message.error("Failed to update category");
    //     }

    //     setBulkOpen(false);
    // };
    const saveBulkCategory = async () => {
        if (!bulkCategory.trim()) {
            message.warning("Enter category");
            return;
        }

        const token = localStorage.getItem("token");


        const items = leafCampaigns.map(item => ({
            accountNumber: item.accountNumber,
            campaignid: item.campaignid,
            level: "campaign",
            campaignname: item.campaignname,
            activity: {
                editType: "Category",
                campaignid: item.campaignid,       // cents
                Account: item.accountNumber,    // ✅ update *this* row’s account
                campaignname: item.campaignname,
                updatedBy: userdetails?.userName,
                updatedUserEmail: userdetails?.email,
                updateType: "Category comment cleared",
                updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                // updateDetail: `From ${updatedPinStatus ? "unpin" : "pin"} to ${updatedPinStatus ? "pin" : "unpin"}`,
            }
        }));

        if (items.length === 0) {
            message.info("No campaigns selected.");
            setBulkOpen(false);
            return;
        }

        try {
            message.loading({ content: "Updating category...", key: "bulkCategory" });

            await apiClient.post(
                "/reports/bulkactions/category",
                { items, category: bulkCategory },
                { headers: { Authorization: token } }
            );


            setLeafCampaigns(prev =>
                prev.map(item => ({
                    ...item,
                    category: bulkCategory
                }))
            );


            setCampaignComments(prev => {
                const arr = [...prev];

                items.forEach(item => {
                    const idx = arr.findIndex(
                        i =>
                            String(i.campaignid) === String(item.campaignid) &&
                            String(i.Account) === String(item.accountNumber) &&
                            i.level === "campaign"
                    );

                    if (idx >= 0) {
                        arr[idx].category = bulkCategory;
                    } else {
                        arr.push({
                            campaignid: item.campaignid,
                            Account: item.accountNumber,
                            level: "campaign",
                            category: bulkCategory
                        });
                    }
                });

                return arr;
            });


            leafCampaigns.forEach(item => {
                const key = `${item.campaignid}_${item.accountNumber}_campaign`;
                commentsMap.set(key, { category: bulkCategory });
            });

            message.success({ content: "Category updated!", key: "bulkCategory" });
        } catch (err) {
            console.error(err);
            message.error("Failed to update category");
        }

        setBulkOpen(false);
    };
    const autoGroupColumnDef = {
        headerName: 'Adset name',
        minWidth: 450,
        pinned: 'left',
        sortable: true, // Enable sorting
        unSortIcon: true,
        headerClass: 'ag-center-header',
        valueFormatter: (params) => {
            // GROUP ROW
            if (params.node?.group) {
                const firstChild = params.node.childrenAfterGroup?.[0]?.data;
                return firstChild?.adsetname ?? params.node.key;
            }

            // LEAF ROW
            return params.value;
        },
        // filter: "agTextColumnFilter",
        // filterValueGetter: (params) => {
        //     if (params.node.group) {
        //         // Use the group key (campaign name)
        //         return params.node.key;
        //     }
        //     // For leaf rows, use the campaign_name or any field
        //     return params.data?.adsetname || '';
        // },

        // comparator: (campaignA, campaignB) => {
        //     if (!campaignA) return 1;
        //     if (!campaignB) return -1;

        //     // Function to get the 'pinned' status of a campaign
        //     const getPinStatusForCampaign = (campaignName) => {
        //         const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
        //         return relatedComment ? relatedComment.pinned : false;
        //     };

        //     // Prioritize pinned campaigns first (pinned campaigns should come to the top)
        //     const isPinnedA = getPinStatusForCampaign(campaignA);
        //     const isPinnedB = getPinStatusForCampaign(campaignB);

        //     if (isPinnedA !== isPinnedB) {
        //         return isPinnedA ? -1 : 1;  // Pinned campaigns should come first
        //     }

        //     // If both campaigns have the same pinned status, fallback to alphabetical sorting
        //     return campaignA.localeCompare(campaignB);
        // },

        // comparator: (a, b, nodeA, nodeB) => {
        //     const pickPinned = (node) => {
        //         const d = node?.group && node.childrenAfterGroup?.length
        //             ? node.childrenAfterGroup[0]?.data
        //             : node?.data;
        //         if (!d) return false;
        //         // prefer fast local cache set by the cell
        //         if (typeof d.__adsetPinned === 'boolean') return d.__adsetPinned;
        //         // optional fallback to backend record if present on row
        //         return !!d.pinned;
        //     };
        //     const pa = pickPinned(nodeA);
        //     const pb = pickPinned(nodeB);
        //     if (pa !== pb) return pa ? -1 : 1;
        //     return String(a || '').localeCompare(String(b || ''));
        // },

        comparator: (groupKeyA, groupKeyB, nodeA, nodeB) => {

            // get first leaf row of group A
            const leafA = nodeA.allLeafChildren?.[0]?.data;
            const leafB = nodeB.allLeafChildren?.[0]?.data;

            // safety
            if (!leafA) return 1;
            if (!leafB) return -1;

            const campaignidA = leafA.campaignid;
            const accountA = leafA.accountNumber;
            const adsetidA = leafA.adsetid;
            const campaignidB = leafB.campaignid;
            const accountB = leafB.accountNumber;
            const adsetidB = leafB.adsetid;

            // find pinned record for A
            const recA = campaignComments.find(c =>
                String(c.Account) === String(accountA) &&
                String(c.campaignid) === String(campaignidA) &&
                String(c.adsetid) === String(adsetidA) &&
                c.level === "adset"
            );

            const recB = campaignComments.find(c =>
                String(c.Account) === String(accountB) &&
                String(c.campaignid) === String(campaignidB) &&
                String(c.adsetid) === String(adsetidB) &&
                c.level === "adset"
            );

            const pinnedA = recA?.pinned ?? false;
            const pinnedB = recB?.pinned ?? false;

            // 1️⃣ PINNED FIRST when sorting ASC
            if (pinnedA !== pinnedB) return pinnedA ? -1 : 1;

            // 2️⃣ fallback: alphabetical by group key
            return String(groupKeyA).localeCompare(String(groupKeyB));
        },

        cellRendererParams: {
            checkbox: true,
            suppressCount: false,
            innerRenderer: (params) => {
                if (params.node.footer) {
                    return 'Total';
                }
                const adsetNameGroup = (() => {
                    if (params.node.childrenAfterGroup?.length > 0) {
                        return params.node.childrenAfterGroup[0]?.data?.adsetname || params.node.key;
                    }
                    return params.node.key; // fallback to campaignid
                })();
                const leafData = params.node.group
                    ? params.node.allLeafChildren?.[0]?.data
                    : params.data;

                const currentCampaignId = leafData?.campaignid;
                const currentAccount = leafData?.accountNumber;
                const currentAdsetId = leafData?.adsetid;

                const firstColumnValue = adsetNameGroup;  // campaign name
                const campaignName = adsetNameGroup;
                const adsetName = adsetNameGroup;

                let campaignid, adsetid;
                let accountNumberToPassHistoryPage;

                if (params.node.group && params.node.childrenAfterGroup && params.node.childrenAfterGroup.length > 0) {
                    const firstChild = params.node.childrenAfterGroup[0].data;
                    campaignid = firstChild.campaignid;
                    adsetid = firstChild.adsetid;
                    accountNumberToPassHistoryPage = firstChild.accountNumber ?? null;
                } else if (params.data) {
                    campaignid = params.data.campaignid;
                    adsetid = params.data.adsetid;
                    accountNumberToPassHistoryPage = params.data.accountNumber ?? null;
                } else {
                    console.error('Missing campaignid or adsetid for campaign:', campaignName);
                    // return (
                    //     <div style={{ color: 'red' }}>
                    //         Error: campaignid or adsetid missing for {campaignName}
                    //     </div>
                    // );
                }

                // selected accounts (multi)
                const accountsParam = Array.isArray(newaccount) ? newaccount.map(String) : [String(newaccount)];

                // ► the row’s accountNumber (critical for per-row actions)
                const rowAccount = (() => {
                    if (params.node.group && params.node.childrenAfterGroup?.length > 0) {
                        return params.node.childrenAfterGroup[0]?.data?.accountNumber ?? null;
                    }
                    return params.data?.accountNumber ?? null;
                })();

                // stable key per adset-row (account + campaign + adset)
                const statusKey = `${rowAccount}|${campaignid}|${adsetid}`;

                // grab the Maps from grid context
                const statusMap = params.context?.adsetStatusOverridesRef?.current;   // "ACTIVE" | "PAUSED"
                const pinMap = params.context?.adsetPinOverridesRef?.current;      // true | false
                const commentMap = params.context?.adsetCommentOverridesRef?.current;  // { text, editedBy, editedAt }



                // find the exact comment record for this (adsetName + account + ids)
                // const rec = campaignComments.find(c =>
                //     c.campaignname === adsetName &&
                //     String(c.Account) === String(rowAccount) &&
                //     (c.campaignid ? String(c.campaignid) === String(campaignid) : true) &&
                //     (c.adsetid ? String(c.adsetid) === String(adsetid) : true)
                // );
                const rec = campaignComments.find(c =>
                    // c.campaignname === adsetName &&                       // you store adsetName in campaignname at adset level
                    String(c.Account) === String(rowAccount) &&
                    (c.campaignid ? String(c.campaignid) === String(campaignid) : true) &&
                    (c.adsetid ? String(c.adsetid) === String(adsetid) : true) &&
                    (c.level === "adset")
                );

                // comment override first, then backend record
                const commentOverride = commentMap?.get(statusKey);
                const relatedComment = rec?.comment ?? null;
                const editedBy = rec?.usercommit ?? '';
                const editedPretty = rec?.editedTime
                    ? rec.editedTime
                    : (rec?.editedTime
                        ? moment(rec.editedTime, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A")
                        : '');

                // pin override first, then backend record
                const pinnedOverride = pinMap?.get(statusKey);
                const [pinned, setPinned] = useState(rec?.pinned ? rec?.pinned : false);

                // keep in sync if Map changes externally (optional)
                // useEffect(() => {
                //   if (typeof pinnedOverride === 'boolean') setPinned(pinnedOverride);
                // }, [pinnedOverride]);


                //   const relatedComment = rec?.comment ?? null;
                //   const editedRaw      = rec?.editedTime ?? rec?.editedPinTime ?? '';
                //   const editedBy       = rec?.usercommit ?? rec?.userPin ?? '';
                //   const editedPretty   = editedRaw
                //     ? moment(editedRaw, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A")
                //     : '';

                //     const [pinned, setPinned] = useState(!!rec?.pinned);
                const [pendingAccount, setPendingAccount] = useState(null);



                const getEditedUserAndTime = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    // console.log(relatedStatus, "relatedStatus");
                    const relatedStatusEditedTime = relatedStatus ? relatedStatus : null;
                    // console.log(relatedStatusTrue);
                    return relatedStatusEditedTime;
                }

                const getPinEditedUserAndTime = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    return relatedStatus ? relatedStatus : null;
                };

                const getStatusForCampaign = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    // console.log(relatedStatus, "relatedStatus");
                    const relatedStatusTrue = relatedStatus !== undefined && relatedStatus.status === true ? true : relatedStatus !== undefined ? false : null;
                    // console.log(relatedStatusTrue);
                    return relatedStatusTrue;
                }

                const getCommentForCampaign = (campaignName) => {
                    const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                    return relatedComment ? relatedComment.comment : null;
                };

                const getPinStatusForCampaign = (campaignName) => {
                    const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                    return relatedComment ? relatedComment.pinned : false;
                };

                const editUserANdTime = getEditedUserAndTime(campaignName, newaccount);
                const editPinUserANdTime = getPinEditedUserAndTime(campaignName, newaccount);
                const relatedStatus = getStatusForCampaign(campaignName, newaccount);
                // const relatedComment = getCommentForCampaign(campaignName);
                // const isStarred = getStarredForCampaign(campaignName);
                const valueWithCount = `${firstColumnValue}`;

                const [tooltipText, setTooltipText] = useState("Click to Copy");
                const [isModalVisibles, setIsModalVisibles] = useState(false);
                const [isAdsetModalVisibles, setIsAdsetModalVisibles] = useState(false);
                const [selectedAdset, setSelectedAdset] = useState(null); // store adid when switch clicked
                // const [switchOn, setSwitchOn] = useState(true); // default to ACTIVE
                const [nextChecked, setNextChecked] = useState(false); // what user clicked
                const [comment, setComment] = useState(relatedComment || '');
                const [universalOject, setUniversalObject] = React.useState(null)
                const [confirmLoading, setConfirmLoading] = React.useState(false);
                const [selectedCampaignCreatives, setSelectedCampaignCreatives] = useState([]);
                const [creativeModalOpen, setCreativeModalOpen] = useState(false);
                // const [starred, setStarred] = useState(isStarred);
                // const [pinned, setPinned] = useState(getPinStatusForCampaign(campaignName));

                // near other local states
                const [tick, setTick] = useState(0);
                const refreshThisCell = () => {
                    setTick(t => t + 1); // trigger React re-render of this renderer
                    // repaint only this row’s cell
                    params.api.refreshCells({
                        rowNodes: [params.node],
                        columns: [params.column.getColId()],
                        force: true,
                    });
                    // if pin affects sort order, re-run sort without data reload
                    params.api.refreshClientSideRowModel('sort');
                };



                // INIT: prefer override map; then row cache; finally derive from comments
                const [switchOn, setSwitchOn] = useState(() => {
                    // const over = statusMap?.get(statusKey); // "ACTIVE" | "PAUSED"
                    // if (over === "ACTIVE" || over === "PAUSED") return over === "ACTIVE";

                    // if (params.data?.__adsetStatus) return params.data.__adsetStatus === "ACTIVE";

                    // // fallback to comments structure
                    // const commentForCampaign = campaignComments.find(obj =>
                    //     String(obj.campaignid) === String(campaignid) &&
                    //     String(obj.Account) === String(rowAccount)
                    // );
                    // let matchedAdset = null;
                    // if (Array.isArray(commentForCampaign?.AdsetLevel)) {
                    //     matchedAdset = commentForCampaign.AdsetLevel.find(a => String(a.adset_id) === String(adsetid));
                    // } else if (commentForCampaign?.AdsetLevel?.adset_id &&
                    //     String(commentForCampaign.AdsetLevel.adset_id) === String(adsetid)) {
                    //     matchedAdset = commentForCampaign.AdsetLevel;
                    // }
                    // return matchedAdset ? matchedAdset.status === "ACTIVE" : true; // default ACTIVE
                    const campaignForAccount = Camapignlevelstatus?.find(obj =>
                        String(obj?.campaign_id) === String(campaignid) &&
                        String(obj?.accountNumber) === String(rowAccount)
                    );
                    const arrayOfAdsets = campaignForAccount?.adsets || [];
                    const matchedAdset = arrayOfAdsets?.find(a => String(a?.adset_id) === String(adsetid));
                    return matchedAdset ? matchedAdset.status === "ACTIVE" : true; // default ACTIVE
                });

                React.useEffect(() => {
                    setUniversalObject(campaignComments.find(d => d.level === "adset" && d.campaignid === campaignid && d.adsetid === adsetid && d.Account === rowAccount));
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [campaignComments]);

                // keep pin in sync
                // useEffect(() => { setPinned(!!rec?.pinned); }, [rec?.pinned]);

                // init switch from comments.AdsetLevel per account
                // useEffect(() => {
                //   const commentForCampaign = campaignComments.find(obj =>
                //     String(obj.campaignid) === String(campaignid) && String(obj.Account) === String(rowAccount)
                //   );

                //   let matchedAdset = null;
                //   if (Array.isArray(commentForCampaign?.AdsetLevel)) {
                //     matchedAdset = commentForCampaign.AdsetLevel.find(a => String(a.adset_id) === String(adsetid));
                //   } else if (commentForCampaign?.AdsetLevel?.adset_id &&
                //              String(commentForCampaign?.AdsetLevel?.adset_id) === String(adsetid)) {
                //     matchedAdset = commentForCampaign.AdsetLevel;
                //   }

                //   const isActive = matchedAdset?.status === "ACTIVE";
                //   setSwitchOn(matchedAdset ? isActive : true); // fallback ACTIVE
                // }, [campaignComments, campaignid, adsetid, rowAccount]);


                // Status toggle (per row’s account)
                const handlePauseClick = (checked) => {
                    setSelectedAdset(adsetid);
                    setNextChecked(checked);
                    setPendingAccount(rowAccount);
                    setIsAdsetModalVisibles(true);
                };

                //   const handlePauseOk = async () => {
                //     setSwitchOn(nextChecked); // optimistic
                //     try {
                //       const token = localStorage.getItem("token");
                //       const payload = {
                //         status: nextChecked ? "ACTIVE" : "PAUSED",
                //         name: adsetName,
                //         accountNumber: String(pendingAccount),   // ← per row account
                //         campaign_id: campaignid,
                //         adset_id: adsetid,
                //         email: userdetails?.email,
                //       };
                //       const resp = await apiClient.post(`/BulkAdsetStatusChange`, payload, {
                //         headers: { Authorization: token }
                //       });

                //       if (resp.status === 200 || resp.status === 201) {
                //         // refresh only that account’s comments/status
                //         functionCallForCommnets(pendingAccount);
                //         message.success(`Adset ${nextChecked ? "activated" : "paused"}`);
                //       } else {
                //         console.warn("Unexpected status:", resp.status);
                //       }
                //     } catch (e) {
                //       console.error(e?.response?.data || e.message);
                //       message.error("Failed to update adset status");
                //       setSwitchOn(prev => !prev); // revert
                //     } finally {
                //       setIsAdsetModalVisibles(false);
                //       setSelectedAdset(null);
                //       setPendingAccount(null);
                //     }
                //   };

                // const handlePauseOk = async () => {
                //     const desired = nextChecked; // true => ACTIVE
                //     setSwitchOn(desired);        // optimistic (cell only)
                //     try {
                //         const token = localStorage.getItem("token");
                //         const payload = {
                //             status: desired ? "ACTIVE" : "PAUSED",
                //             name: adsetName,
                //             accountNumber: String(pendingAccount),
                //             campaign_id: campaignid,
                //             adset_id: adsetid,
                //             email: userdetails?.email,
                //         };
                //         await apiClient.post(`/BulkAdsetStatusChange`, payload,
                //             { headers: { Authorization: token } }
                //         );

                //         const newStatus = desired ? "ACTIVE" : "PAUSED";

                //         // write to override map (stable across tabs)
                //         statusMap?.set(statusKey, newStatus);

                //         // also cache on the row so sort/comparator can see it without reading maps
                //         const updatedRow = { ...params.data, __adsetStatus: newStatus };
                //         if (params.api?.applyTransaction) {
                //             params.api.applyTransaction({ update: [updatedRow] });
                //         } else {
                //             params.node.updateData(updatedRow);
                //         }

                //         message.success(`Adset ${newStatus.toLowerCase()}`);
                //     } catch (e) {
                //         setSwitchOn(prev => !prev); // revert this cell only
                //         message.error("Failed to update adset status");
                //     } finally {
                //         setIsAdsetModalVisibles(false);
                //         setSelectedAdset(null);
                //         setPendingAccount(null);
                //     }
                // };

                const handlePauseOk = async () => {
                    const desired = nextChecked; // true => ACTIVE
                    setIsAdsetModalVisibles(true);
                    setConfirmLoading(true);
                    try {
                        const payloadForActivity = {
                            editType: "Status",
                            campaignid: campaignid,       // cents
                            adsetid: adsetid,
                            Account: rowAccount,    // ✅ update *this* row’s account
                            campaignname: campaignName,
                            adsetname: adsetName,
                            updatedBy: userdetails?.userName,
                            updatedUserEmail: userdetails?.email,
                            updateType: "Adset status updated",
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                            updateDetail: `From ${desired ? "Inactive" : "Active"} to ${desired ? "Active" : "Inactive"}`,
                        }
                        const token = localStorage.getItem("token");
                        const payload = {
                            status: desired ? "ACTIVE" : "PAUSED",
                            name: adsetName,
                            accountNumber: String(rowAccount),
                            campaign_id: campaignid,
                            adset_id: adsetid,
                            email: userdetails?.email,
                            activity: payloadForActivity
                        };
                        const response = await apiClient.post(`/reports/singleactions/adsetstatus`, payload,
                            { headers: { Authorization: token } }
                        );

                        const newStatus = desired ? "ACTIVE" : "PAUSED";

                        // write to override map (stable across tabs)
                        // statusMap?.set(statusKey, newStatus);
                        if (response.status === 200 || response.status === 201) {
                            setConfirmLoading(false);
                            setSwitchOn(desired);
                            const updatedCampaignLevelStatus = Camapignlevelstatus.map(item =>
                                String(item.campaign_id) === String(campaignid) &&
                                    String(item.accountNumber) === String(rowAccount)
                                    ? {
                                        ...item,
                                        adsets: (item.adsets || []).map(adset =>
                                            String(adset.adset_id) === String(adsetid)
                                                ? { ...adset, status: newStatus } // update only this adset
                                                : adset
                                        ),
                                    }
                                    : item
                            );
                            setCamapignlevelstatus(updatedCampaignLevelStatus);
                            // if (campaignStatusFilter !== "All") {
                            //     const adsetStatusMap = new Map(
                            //         updatedCampaignLevelStatus.flatMap(campaign =>
                            //             (campaign.adsets || []).map(adset => [
                            //                 String(adset.adset_id),
                            //                 adset.status?.toUpperCase()
                            //             ])
                            //         )
                            //     );

                            //     const filteredRowObjects = newRowDataForFilter.current.filter(row =>
                            //         adsetStatusMap.get(String(row.adsetid)) ===
                            //         campaignStatusFilter?.toUpperCase()
                            //     );

                            //     setdailyData(filteredRowObjects);
                            // }

                            // setCamapignlevelstatus(prevStatus =>
                            //     prevStatus.map(item =>
                            //         String(item.campaign_id) === String(campaignid) &&
                            //             String(item.accountNumber) === String(rowAccount)
                            //             ? {
                            //                 ...item,
                            //                 adsets: item.adsets.map(adset =>
                            //                     String(adset.adset_id) === String(adsetid)
                            //                         ? { ...adset, status: newStatus } // ✅ update only that adset's status
                            //                         : adset // keep others as is
                            //                 ),
                            //             }
                            //             : item // keep other campaigns as is
                            //     )
                            // );
                            setIsAdsetModalVisibles(false);
                        }

                        // // also cache on the row so sort/comparator can see it without reading maps
                        // const updatedRow = { ...params.data, __adsetStatus: newStatus };
                        // if (params.api?.applyTransaction) {
                        //     params.api.applyTransaction({ update: [updatedRow] });
                        // } else {
                        //     params.node.updateData(updatedRow);
                        // }

                        message.success(`Adset ${newStatus.toLowerCase()}`);
                    } catch (e) {
                        setConfirmLoading(false);
                        setSwitchOn(prev => !prev); // revert this cell only
                        message.error("Failed to update adset status");
                    } finally {
                        setIsAdsetModalVisibles(false);
                        setSelectedAdset(null);
                        setPendingAccount(null);
                    }
                };
                const handleSmartAdsetStatusClick = async (currentStatus) => {
                    const desired = nextChecked ? "ACTIVE" : "PAUSED";

                    // 🌟 If only ONE adset → fallback to your existing single function
                    if (!leafCampaigns || leafCampaigns.length <= 1) {
                        handlePauseOk();  // <-- SAME like pin fallback
                        return;
                    }

                    // 🌟 MULTIPLE adsets → do bulk update
                    const listToUpdate = leafCampaigns.filter(item =>
                        String(item.fbStatus).toUpperCase() !== desired
                    );

                    if (listToUpdate.length === 0) {
                        message.info("All selected adsets already have this status.");
                        return;
                    }

                    try {
                        message.loading({
                            content: desired === "ACTIVE"
                                ? "Activating selected adsets..."
                                : "Pausing selected adsets...",
                            key: "bulkStatus"
                        });

                        const results = await Promise.allSettled(
                            listToUpdate.map(item =>
                                apiClient.post("/NewBulkAdsetStatusChange", {
                                    status: desired,
                                    name: item.adsetname,
                                    campaign_id: item.campaignid,
                                    adset_id: item.adsetid,
                                    accountNumber: item.accountNumber,
                                    email: userdetails?.email
                                })
                            )
                        );

                        const successCount = results.filter(r => r.status === "fulfilled").length;
                        const failedCount = results.length - successCount;

                        // UI update
                        const newStatus = desired;
                        setCamapignlevelstatus(prev => {
                            const arr = [...prev];
                            listToUpdate.forEach(update => {
                                const idx = arr.findIndex(
                                    c =>
                                        String(c.campaign_id) === String(update.campaignid) &&
                                        String(c.accountNumber) === String(update.accountNumber)
                                );

                                if (idx !== -1) {
                                    arr[idx].adsets = arr[idx].adsets.map(a =>
                                        String(a.adset_id) === String(update.adsetid)
                                            ? { ...a, status: newStatus }
                                            : a
                                    );
                                }
                            });
                            return arr;
                        });

                        message.success({
                            content: `${successCount} updated, ${failedCount} failed`,
                            key: "bulkStatus",
                            duration: 3
                        });

                        setIsAdsetModalVisibles(false);

                    } catch (error) {
                        console.error("Bulk update error:", error);
                        message.error("Failed to update selected adsets.");
                    }
                };
                const handlePinClick = async (currentPinStatus) => {
                    const next = !currentPinStatus;
                    setPinned(next); // optimistic
                    try {
                        // const body = {
                        //     accountNumbers: Array.isArray(newaccount) ? newaccount.map(String) : [String(newaccount)],
                        //     campaignname: adsetName,
                        //     campaignid,
                        //     adsetid,
                        //     userPin: userdetails?.email,
                        //     comment: comment || ''
                        // };
                        const payloadForActivity = {
                            editType: "Pin",
                            campaignid: campaignid,       // cents
                            adsetid: adsetid,
                            Account: rowAccount,    // ✅ update *this* row’s account
                            campaignname: campaignName,
                            adsetname: adsetName,
                            updatedBy: userdetails?.userName,
                            updatedUserEmail: userdetails?.email,
                            updateType: "Adset pin updated",
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                            updateDetail: `From "${next ? "unpin" : "pin"}" to "${next ? "pin" : "unpin"}"`,
                        }
                        const body = {
                            accountNumber: rowAccount,
                            campaignname: campaignName,
                            campaignid,
                            adsetid,
                            userPin: userdetails?.email,
                            comment: comment || '',
                            level: "adset",
                            activity: payloadForActivity
                        };
                        const resp = next
                            ? await apiClient.post('/reports/singleactions/pin', body)
                            : await apiClient.post('/reports/singleactions/unpin', body);

                        if (resp.status === 200 || resp.status === 201) {
                            // persist in Map + row cache
                            // pinMap?.set(statusKey, next);
                            // const updatedRow = { ...params.data, __adsetPinned: next };
                            // if (params.api?.applyTransaction) {
                            //     params.api.applyTransaction({ update: [updatedRow] });
                            // } else {
                            //     params.node.updateData(updatedRow);
                            // }
                            // if (newResponse.status === 200 || newResponse.status === 201) {
                            setCampaignComments(prev => {
                                const arr = Array.isArray(prev) ? [...prev] : [];
                                const timeStamp = moment().tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm A');

                                const match = arr.findIndex(
                                    i =>
                                        String(i?.campaignid) === String(campaignid) &&
                                        String(i?.Account) === String(rowAccount) &&
                                        String(i?.adsetid) === String(adsetid) &&
                                        // String(i?.ad_id) === String(adid) &&
                                        String(i?.level) === 'adset'
                                );

                                if (match >= 0) {
                                    arr[match] = { ...arr[match], pinned: next, userPin: userdetails?.email, editedPinTime: timeStamp };
                                } else {
                                    arr.push({
                                        campaignid,
                                        Account: rowAccount,
                                        adsetid,
                                        // ad_id: adid,
                                        level: 'adset',
                                        pinned: next,
                                        userPin: userdetails?.email,
                                        editedPinTime: timeStamp
                                    });
                                }

                                return arr;
                            });
                            //   }
                            message.success(next ? "Pinned" : "Unpinned");
                            // refreshThisCell();
                        } else {
                            setPinned(!next); // revert
                            message.error("Failed to update pin");
                        }
                    } catch (e) {
                        setPinned(!next); // revert
                        message.error("Error while updating pin status");
                    }
                };
                const handleSmartAdsetPinClick = async (currentPinStatus) => {
                    const next = !currentPinStatus;

                    // If multiple adsets selected
                    if (leafCampaigns && leafCampaigns.length > 1) {
                        try {
                            message.loading({ content: next ? 'Pinning selected adsets...' : 'Unpinning selected adsets...', key: 'adsetPin' });

                            const endpoint = next ? '/NewPinBulk' : '/NewUnpinBulk';

                            // Bulk API calls
                            const results = await Promise.allSettled(
                                leafCampaigns.map(item =>
                                    apiClient.post(
                                        endpoint,
                                        {
                                            accountNumber: item.accountNumber,
                                            campaignname: item.adsetname,
                                            campaignid: item.campaignid,
                                            adsetid: item.adsetid,
                                            userPin: userdetails?.email,
                                            level: item.level,
                                        },

                                    )
                                )
                            );

                            const successCount = results.filter(r => r.status === 'fulfilled' && (r.value?.status === 200 || r.value?.status === 201)).length;
                            const failureCount = results.length - successCount;

                            // ✅ Update UI instantly (like your single version)
                            setCampaignComments(prev => {
                                const arr = Array.isArray(prev) ? [...prev] : [];
                                const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

                                leafCampaigns.forEach(item => {
                                    const match = arr.findIndex(
                                        i =>
                                            String(i?.campaignid) === String(item.campaignid) &&
                                            String(i?.Account) === String(item.accountNumber) &&
                                            String(i?.adsetid) === String(item.adsetid) &&
                                            String(i?.level) === 'adset'
                                    );

                                    if (match >= 0) {
                                        arr[match] = { ...arr[match], pinned: next, userPin: userdetails?.email, editedPinTime: timeStamp };
                                    } else {
                                        arr.push({
                                            campaignid: item.campaignid,
                                            Account: item.accountNumber,
                                            adsetid: item.adsetid,
                                            level: 'adset',
                                            pinned: next,
                                            userPin: userdetails?.email,
                                            editedPinTime: timeStamp,
                                        });
                                    }
                                });

                                return arr;
                            });

                            message.success({
                                content: `${successCount} adset(s) ${next ? 'pinned' : 'unpinned'}, ${failureCount} failed`,
                                key: 'adsetPin',
                                duration: 3,
                            });
                        } catch (error) {
                            console.error('❌ Adset Bulk Pin Error:', error);
                            message.error('Failed to update selected adsets.');
                        }
                        return;
                    }

                    // ✅ Fallback to single adset pin logic
                    handlePinClick(currentPinStatus);
                };
                const handleOks = async () => {
                    try {
                        // await apiClient.post('/Comments/bulk-upsert', {
                        //     accountNumbers: Array.isArray(newaccount) ? newaccount.map(String) : [String(newaccount)],
                        //     campaignname: adsetName,
                        //     campaignid,
                        //     adsetid,
                        //     comment,
                        //     usercommit: userdetails?.email,
                        // });
                        const payloadForActivity = {
                            editType: "Comment",
                            campaignid: campaignid,       // cents
                            adsetid: adsetid,
                            Account: rowAccount,    // ✅ update *this* row’s account
                            campaignname: campaignName,
                            adsetname: adsetName,
                            updatedBy: userdetails?.userName,
                            updatedUserEmail: userdetails?.email,
                            updateType: "Adset comment updated",
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                            // updateDetail: `From ${updatedPinStatus ? "unpin" : "pin"} to ${updatedPinStatus ? "pin" : "unpin"}`,
                        }
                        const newResponse = await apiClient.post('/reports/singleactions/comments', {
                            accountNumber: rowAccount,
                            campaignname: adsetName,
                            campaignid,
                            adsetid,
                            comment,
                            usercommit: userdetails?.email,
                            level: "adset",
                            activity: payloadForActivity
                        });
                        // persist in Map (stable across tabs)
                        // commentMap?.set(statusKey, {
                        //     text: comment,
                        //     editedBy: userdetails?.email,
                        //     editedAt: moment().format("DD-MM-YYYY hh:mm:ss A"),
                        // });
                        if (newResponse.status === 200 || newResponse.status === 201) {
                            setCampaignComments(prev => {
                                const arr = Array.isArray(prev) ? [...prev] : [];
                                const timeStamp = moment().tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm A');

                                const match = arr.findIndex(
                                    i =>
                                        String(i?.campaignid) === String(campaignid) &&
                                        String(i?.Account) === String(rowAccount) &&
                                        String(i?.adsetid) === String(adsetid) &&
                                        // String(i?.ad_id) === String(adid) &&
                                        String(i?.level) === 'adset'
                                );

                                if (match >= 0) {
                                    arr[match] = { ...arr[match], comment: comment, usercommit: userdetails?.email, editedTime: timeStamp };
                                } else {
                                    arr.push({
                                        campaignid,
                                        Account: rowAccount,
                                        adsetid,
                                        // ad_id: adid,
                                        level: 'adset',
                                        comment: comment,
                                        usercommit: userdetails?.email,
                                        editedTime: timeStamp
                                    });
                                }

                                return arr;
                            });
                        }
                        message.success("Comment saved");
                        setIsModalVisibles(false);
                        // refreshThisCell();
                    } catch (e) {
                        message.error('Failed to save comment');
                    }
                };
                const handleSmartAdsetCommentSubmit = async () => {

                    if (leafCampaigns && leafCampaigns.length > 1) {
                        try {
                            message.loading({ content: 'Saving comments for selected adsets...', key: 'bulkAdsetComment' });

                            // Prepare bulk data
                            const items = leafCampaigns.map(item => ({
                                accountNumber: item.accountNumber,
                                campaignname: item.adsetname,
                                campaignid: item.campaignid,
                                adsetid: item.adsetid,
                                comment,
                                usercommit: userdetails?.email,
                                level: "adset",
                            }));

                            // console.log('🟢 Sending adset items:', items);

                            // ✅ Call your bulk endpoint
                            const resp = await apiClient.post(
                                '/Comments/upsertBulk',
                                { items, usercommit: userdetails?.email },

                            );

                            if (resp.status === 200 || resp.status === 201) {
                                // ✅ Update state instantly
                                setCampaignComments(prev => {
                                    const arr = Array.isArray(prev) ? [...prev] : [];
                                    const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

                                    leafCampaigns.forEach(item => {
                                        const match = arr.findIndex(
                                            i =>
                                                String(i?.campaignid) === String(item.campaignid) &&
                                                String(i?.Account) === String(item.accountNumber) &&
                                                String(i?.adsetid) === String(item.adsetid) &&
                                                String(i?.level) === 'adset'
                                        );

                                        if (match >= 0) {
                                            arr[match] = { ...arr[match], comment, usercommit: userdetails?.email, editedTime: timeStamp };
                                        } else {
                                            arr.push({
                                                campaignid: item.campaignid,
                                                Account: item.accountNumber,
                                                adsetid: item.adsetid,
                                                level: 'adset',
                                                comment,
                                                usercommit: userdetails?.email,
                                                editedTime: timeStamp,
                                            });
                                        }
                                    });

                                    return arr;
                                });

                                message.success({
                                    content: `${leafCampaigns.length} adset comment(s) saved successfully`,
                                    key: 'bulkAdsetComment',
                                    duration: 3,
                                });

                                setIsModalVisibles(false);
                            }
                        } catch (error) {
                            console.error('❌ Bulk Adset Comment Error:', error);
                            message.error('Error while saving comments for selected adsets.');
                        }
                        return;
                    }

                    // ✅ If only one adset is selected → use your current single logic
                    handleOks();
                };
                const handleDelete = async () => {
                    try {
                        const payloadForActivity = {
                            editType: "Comment",
                            campaignid: campaignid,       // cents
                            adsetid: adsetid,
                            Account: rowAccount,    // ✅ update *this* row’s account
                            campaignname: campaignName,
                            adsetname: adsetName,
                            updatedBy: userdetails?.userName,
                            updatedUserEmail: userdetails?.email,
                            updateType: "Adset comment updated",
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                            // updateDetail: `From ${updatedPinStatus ? "unpin" : "pin"} to ${updatedPinStatus ? "pin" : "unpin"}`,
                        }
                        const newResponse = await apiClient.post('/reports/singleactions/comments/delete', {
                            accountNumber: rowAccount,
                            campaignname: adsetName,
                            campaignid,
                            adsetid,
                            // comment,
                            usercommit: userdetails?.email,
                            level: "adset",
                            activity: payloadForActivity
                        });
                        if (newResponse.status === 200 || newResponse.status === 201) {
                            setCampaignComments(prev => {
                                const arr = Array.isArray(prev) ? [...prev] : [];
                                const timeStamp = moment().tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm A');

                                const match = arr.findIndex(
                                    i =>
                                        String(i?.campaignid) === String(campaignid) &&
                                        String(i?.Account) === String(rowAccount) &&
                                        String(i?.adsetid) === String(adsetid) &&
                                        // String(i?.ad_id) === String(adid) &&
                                        String(i?.level) === 'adset'
                                );

                                if (match >= 0) {
                                    arr[match] = { ...arr[match], comment: "", usercommit: userdetails?.email, editedTime: timeStamp };
                                }
                                // else {
                                //     arr.push({
                                //         campaignid,
                                //         Account: rowAccount,
                                //         adsetid,
                                //         // ad_id: adid,
                                //         level: 'adset',
                                //         comment: comment,
                                //         usercommit: userdetails?.email,
                                //         editedTime: timeStamp
                                //     });
                                // }

                                return arr;
                            });
                            setComment('');
                            message.success('Comment deleted');
                            setIsModalVisibles(false);
                        } else {
                            message.error('Failed to delete comment');
                        }
                    } catch (e) {
                        message.error('Failed to delete comment');
                    }
                };

                const handlePauseCancel = () => {
                    setIsAdsetModalVisibles(false);
                    setSelectedAdset(null);
                    setPendingAccount(null);
                };

                // ► BULK comment upsert (multi accounts)
                //   const handleOks = async () => {
                //     try {
                //       const body = {
                //         accountNumbers: accountsParam,
                //         campaignname: adsetName,   // adset label saved under campaignname at adset level
                //         campaignid,
                //         adsetid,
                //         comment,
                //         usercommit: userdetails?.email,
                //       };
                //       await apiClient.post('/Comments/bulk-upsert', body);
                //       refreshComments(accountsParam);
                //       message.success("Comment saved for selected accounts");
                //       setIsModalVisibles(false);
                //     } catch (e) {
                //       console.error(e?.response?.data || e.message);
                //       message.error('Failed to save comment');
                //     }
                //   };

                //   // ► BULK comment delete
                //   const handleDelete = async () => {
                //     try {
                //       const body = { accountNumbers: accountsParam, campaignname: adsetName, campaignid, adsetid };
                //       const resp = await apiClient.post('/Comments/bulk-delete', body);
                //       if (resp.status === 200) {
                //         refreshComments(accountsParam);
                //         message.success('Comment deleted for selected accounts');
                //         setIsModalVisibles(false);
                //       }
                //     } catch (e) {
                //       console.error(e?.response?.data || e.message);
                //       message.error('Failed to delete comment');
                //     }
                //   };

                // ► BULK pin/unpin (multi accounts)
                //   const handlePinClick = async (currentPinStatus) => {
                //     const updated = !currentPinStatus;
                //     try {
                //       const body = {
                //         accountNumbers: accountsParam,
                //         campaignname: adsetName,
                //         campaignid,
                //         adsetid,
                //         userPin: userdetails?.email,
                //         comment: comment || ''
                //       };
                //       const resp = updated
                //         ? await apiClient.post('/PinBulk', body)
                //         : await apiClient.post('/UnpinBulk', { accountNumbers: accountsParam, campaignname: adsetName, campaignid, adsetid });

                //       if (resp.status === 200) {
                //         refreshComments(accountsParam);
                //         setPinned(updated);
                //         message.success(updated ? "Pinned for selected accounts" : "Unpinned for selected accounts");
                //       }
                //     } catch (e) {
                //       console.error(e?.response?.data || e.message);
                //       message.error("Error while updating pin status");
                //     }
                //   };

                const PinIcon = ({ universalOject, pinned }) => (
                    <Tooltip
                        key={`${statusKey}-${tick}-${pinned ? 1 : 0}`}
                        destroyTooltipOnHide
                        title={pinned
                            ? <div style={{ opacity: 0.85 }}>
                                <div>{universalOject?.userPin || 'N/A'}</div>
                                <div>{universalOject?.editedPinTime}</div>
                            </div>
                            : null
                        }
                        overlayInnerStyle={{
                            backgroundColor: theme === 'dark' ? '#111' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#000',
                            border: '1px solid #ccc',
                            borderRadius: 6,
                        }}
                    >
                        <button
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => handlePinClick(pinned)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}
                        >
                            {pinned ? "📌" : "📍"}
                        </button>
                    </Tooltip>
                );



                // useEffect(() => {
                // const commentForCampaign = campaignComments.find(obj => obj.campaignid === campaignid);

                // let matchedAdset = null;

                // if (Array.isArray(commentForCampaign?.AdsetLevel)) {
                //     matchedAdset = commentForCampaign.AdsetLevel.find(a => a.adset_id === adsetid);
                // } else if (commentForCampaign?.AdsetLevel?.adset_id === adsetid) {
                //     matchedAdset = commentForCampaign.AdsetLevel;
                // }

                // const isActive = matchedAdset?.status === "ACTIVE";

                // setSwitchOn(matchedAdset ? isActive : true); // fallback to ACTIVE
                // }, [campaignComments, campaignid, adsetid]);

                // const handlePauseClick = (adsetid, checked) => {
                //     setSelectedAdset(adsetid); 
                //     setNextChecked(checked); // user’s toggle intent
                //     setIsAdsetModalVisibles(true);
                // };

                // const handlePauseOk = async () => {
                //     setSwitchOn(nextChecked); // update visual switch state

                //     try {
                //       const token = localStorage.getItem("token");

                //       const response = await apiClient.post(`/adsetStatusChange`,
                //         {
                //             status: nextChecked ? "ACTIVE" : "PAUSED",
                //             id: params.data?.identifier,             // Used if needed
                //             // ad_id: adid,                              // Required
                //             name: campaignName,
                //             accountNumber: newaccount,
                //             revenuePartner: params.data?.revenuePartner || "",
                //             campaign_id: campaignid,
                //             adset_id: adsetid,
                //             email: userdetails?.email,
                //         },
                //         {
                //           headers: {
                //             Authorization: token
                //           }
                //         }
                //       );

                //       if (response.status === 200 || response.status === 201) {
                //         functionCallForCommnets(newaccount);
                //         console.log(" Status updated on Facebook:", response.data.status, "Adset ID:", response.data.adset_id);
                //       } else {
                //         console.warn(" Backend returned unexpected status:", response.status);
                //       }

                //     } catch (error) {
                //       console.error(" API call to /adStatusChange failed:", error?.response?.data || error.message);
                //     }

                //     setIsAdsetModalVisibles(false);
                //     setSelectedAdset(null);
                // };  

                // const handlePauseCancel = () => {
                //     setIsAdsetModalVisibles(false);
                //     setSelectedAdset(null);
                // };

                const copyToClipboard = () => {
                    navigator.clipboard.writeText(firstColumnValue)
                        .then(() => {
                            setTooltipText("Copied!");
                            setTimeout(() => setTooltipText("Click to Copy"), 2000);
                        })
                        .catch(() => {
                            console.error('Failed to copy to clipboard');
                        });
                };

                const handleEditClick = () => {
                    setIsModalVisibles(true);
                };

                const sendNewCommentToAPI = async (logData) => {
                    try {
                        const response = await apiClient.post('/Comments', {
                            commentsdatas: logData,
                        });
                        // console.log('Response from server:', response.data);
                    } catch (error) {
                        console.error('Error sending data to server:', error);
                    }
                };

                const sendEditedCommentToAPI = async (logData) => {
                    try {
                        const response = await apiClient.post('/Comments/edit', {
                            campaignname: logData.campaignname,
                            comment: logData.comment,
                            Account: logData.Account,
                            adsetid: logData.adsetid,
                            campaignid: logData.campaignid,
                            status: true
                        });
                        // console.log('Response from server (edited comment):', response.data);
                        return response.data;
                    } catch (error) {
                        console.error('Error sending edited comment to server:', error);
                        throw error;
                    }
                };

                // const handleDelete = async () => {
                //     try {
                //         // Prepare the payload for the API call
                //         const payload = {
                //             campaignname: firstColumnValue,
                //             Account: newaccount,
                //             adsetid: adsetid,
                //             campaignid: campaignid,
                //         };

                //         // Call the backend API to delete the comment
                //         const response = await apiClient.post('/Comments/delete', payload);

                //         if (response.status === 200 || response.status === 201) {
                //             // Remove the comment from the local state
                //             // const updatedComments = campaignComments.filter(
                //             //     (comment) => comment.campaignname !== firstColumnValue
                //             // );

                //             // // Update the state with the updated comments
                //             // setCampaignComments(updatedComments);
                //             refreshComments(newaccount);

                //             // Refresh the table or any other UI component
                //             // changeRRefrst();

                //             message.success('Comment deleted successfully!');
                //             setIsModalVisibles(false); // Close the popup
                //         } else {
                //             message.error('Failed to delete the comment. Please try again.');
                //         }
                //     } catch (error) {
                //         console.error('Error deleting the comment:', error);
                //         message.error('Failed to delete the comment. Please try again.');
                //     }
                // };

                // const handleOks = async () => {
                //     try {
                //         const logData = {
                //             Account: newaccount,
                //             usercommit: userdetails?.email,
                //             campaignname: firstColumnValue,
                //             comment: comment,
                //             campaignid: campaignid,
                //             adsetid: adsetid
                //         };

                //         if (relatedComment) {
                //             await sendEditedCommentToAPI(logData);
                //             refreshComments(newaccount);
                //             message.success("Comment updated successfully!");
                //         } else {
                //             await sendNewCommentToAPI(logData);
                //             refreshComments(newaccount);
                //             message.success("New comment added successfully!");
                //         }


                //         setIsModalVisibles(false);
                //     } catch (error) {
                //         console.error('Error while submitting comment:', error);
                //         message.error("Error while submitting the comment.");
                //     }
                // };

                const handleCancels = () => {
                    setIsModalVisibles(false);
                };

                const CustomTooltipContent = ({ editedTime, usercommit }) => (
                    <div style={{ padding: '5px', borderRadius: '5px' }}>
                        <p style={{ margin: 0, color: "#ffffff" }}>{usercommit}</p>
                        <p style={{ margin: 0, color: "#ffffff" }}>{editedTime}</p>
                    </div>
                );

                // const handlePinClick = async (campaignName, campaignid, adsetid, currentPinStatus) => {
                //     const updatedPinStatus = !currentPinStatus;

                //     try {
                //         let response;
                //         if (updatedPinStatus) {
                //             response = await apiClient.post('/Pin', {
                //                 campaignname: campaignName,
                //                 Account: newaccount,
                //                 campaignid: campaignid,
                //                 adsetid: adsetid,
                //                 userPin: userdetails?.email,
                //                 comment: comment || ''
                //             });
                //             // changeRRefrst();
                //             if(response.status ===200 || response.status === 201){
                //                 refreshComments(newaccount);
                //             }

                //             message.success("Campaign pinned!");
                //         } else {
                //             response = await apiClient.post('/Unpin', {
                //                 campaignname: campaignName,
                //                 Account: newaccount,
                //                 campaignid: campaignid,
                //                 adsetid: adsetid
                //             });
                //             // changeRRefrst();
                //             if(response.status ===200 || response.status === 201){
                //                 refreshComments(newaccount);
                //             }

                //             message.success("Campaign unpinned!");
                //         }

                //         // Update campaignComments with the new pinned status and edited user/time
                //         // const updatedComments = campaignComments.map(cmt =>
                //         //     cmt.campaignname === campaignName
                //         //         ? {
                //         //             ...cmt,
                //         //             pinned: updatedPinStatus,
                //         //             editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                //         //             userPin: userdetails?.email
                //         //         }
                //         //         : cmt
                //         // );

                //         // if (!campaignComments.some(cmt => cmt.campaignname === campaignName)) {
                //         //     updatedComments.push({
                //         //         campaignname: campaignName,
                //         //         pinned: updatedPinStatus,
                //         //         editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                //         //         userPin: userdetails?.email
                //         //     });
                //         // }
                //         // const sortedComments = updatedComments.sort((a, b) => b.pinned - a.pinned);
                //         // setCampaignComments(sortedComments);
                //         setPinned(updatedPinStatus);
                //     } catch (error) {
                //         console.error('Error toggling pin status', error);
                //         message.error('Error while updating pin status.');
                //     }
                // };

                // const PinIcon = ({ campaignName, campaignid, adsetid, pinned }) => {
                //     return (
                //         <Tooltip title={pinned ? <CustomTooltipContent editedTime={editPinUserANdTime?.editedPinTime} usercommit={editPinUserANdTime?.userPin} /> : null}>
                //             <button
                //                 onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}
                //                 style={{
                //                     border: "none",
                //                     background: "none",
                //                     cursor: "pointer",
                //                     fontSize: "16px",
                //                 }}
                //             >
                //                 {pinned ? "📌" : "📍"}
                //             </button>
                //         </Tooltip>
                //     );
                // };
                const adLevelCreatives = params.context?.adLevelCreatives || [];
                const campaignCreative = adLevelCreatives.find(
                    c =>
                        String(c.campaignId) === String(currentCampaignId) &&
                        String(c.accountNumber) === String(currentAccount)
                );

                const adsetCreative = campaignCreative?.adsets?.find(
                    a => String(a.adsetId) === String(currentAdsetId)
                );

                const creatives = adsetCreative?.ads || [];
                const CreativeMedia = ({ url, filetype, small = false }) => {
                    if (!url) return null;

                    const isVideo = filetype === "video";

                    const commonStyle = small
                        ? {
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid #ccc",
                            cursor: "pointer",
                        }
                        : {
                            width: "100%",
                            maxHeight: "250px",
                            display: "block",
                            objectFit: "contain",
                        };

                    return isVideo ? (
                        <video
                            src={url}
                            style={commonStyle}
                            controls={!small}
                            muted={small}
                            autoPlay={small}
                            loop={small}
                            playsInline
                        />
                    ) : (
                        <img
                            src={url}
                            alt="creative"
                            style={{
                                ...commonStyle,
                                objectFit: small ? "cover" : "cover",
                            }}
                        />
                    );
                };
                const CreativeAvatar = ({ url, filetype }) => {
                    if (!url) return null;

                    const isVideo = filetype === "video";

                    const style = {
                        width: 35,
                        height: 35,
                        borderRadius: "50%",
                        objectFit: "cover",
                    };

                    return isVideo ? (
                        <video
                            src={url}
                            muted
                            autoPlay
                            loop
                            playsInline
                            style={style}
                        />
                    ) : (
                        <img
                            src={url}
                            alt="page"
                            style={style}
                        />
                    );
                };
                const CreativeTooltip = () => {
                    if (!adLevelCreatives.length) {
                        return <div style={{ color: theme === "dark" ? "#e4e6eb" : "#050505" }}>Loading creatives…</div>;
                    }

                    if (!creatives.length) {
                        return <div style={{ color: theme === "dark" ? "#e4e6eb" : "#050505" }}>No creatives for this adset</div>;
                    }

                    return (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: 5,
                                maxWidth: 280
                            }}
                        >
                            {/* {creatives.map((ad, i) => (
                                <img
                                    key={i}
                                    src={ad.image}
                                    alt={ad.headline || "Creative"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCampaignCreatives(creatives);
                                        setCreativeModalOpen(true);
                                    }}
                                    style={{
                                        width: 50,
                                        height: 50,
                                        objectFit: "cover",
                                        borderRadius: 2,
                                        border: "1px solid #ccc",
                                        cursor: "pointer",
                                    }}
                                />

                            ))} */}
                            {creatives.map((ad, i) => (
                                <div
                                    key={i}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCampaignCreatives(creatives);
                                        setCreativeModalOpen(true);
                                    }}
                                >
                                    <CreativeMedia
                                        url={ad.image}
                                        filetype={ad.filetype}
                                        small
                                    />

                                </div>
                            ))}
                        </div>
                    );
                };
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Switch
                            checked={switchOn}
                            // onClick={(checked) => handlePauseClick(adsetid, checked)} 
                            // onChange={handlePauseClick}   // ← use onChange for reliability
                            onChange={(checked, e) => {
                                e?.stopPropagation?.();
                                handlePauseClick(checked);
                            }}
                            size="small"
                            style={{
                                backgroundColor: switchOn ? '#5B8CFF' : '#d9d9d9',
                            }}
                        />
                        <Modal
                            title="Confirm Action"
                            open={isAdsetModalVisibles}
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            onOk={handlePauseOk}
                            onCancel={handlePauseCancel}
                        >
                            {confirmLoading && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: "rgba(255,255,255,0.7)", // dim background
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        zIndex: 1000,
                                        borderRadius: "8px",
                                    }}
                                >
                                    <Spin size="large" tip="Saving..." />
                                </div>
                            )}
                            <div>
                                <p>
                                    Are you sure you want to turn {nextChecked ? "ON" : "OFF"} this adset?
                                </p>
                                <p>Adset ID: {selectedAdset}</p>
                                <p>Adset Name: {adsetName}</p>
                            </div>
                        </Modal>
                        {/* <PinIcon
                            campaignName={campaignName}
                            campaignid={campaignid}
                            adsetid={adsetid}
                            // pinned={getPinStatusForCampaign(campaignName)}
                            pinned={pinned}
                        /> */}
                        <PinIcon universalOject={universalOject} pinned={pinned} />
                        {/* <div style={{ marginLeft: '2px' }}>
                            {(() => {
                                // Find the matching campaign in the Camapignlevelstatus array
                                const campaignStatus = Camapignlevelstatus.find(statusObj => statusObj.name === campaignName);

                                if (campaignStatus) {
                                    const { status, start, end } = campaignStatus;

                                    // Tooltip content with start and end dates
                                    const tooltipContent = (
                                        <div>
                                            <p style={{ margin: 0 }}>Start: {start || 'N/A'}</p>
                                            <p style={{ margin: 0 }}>End: {end || 'N/A'}</p>
                                        </div>
                                    );

                                    if (status === 'PAUSED') {
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <PauseCircleOutlined style={{ color: 'orange', fontSize: '18px' }} className='black-icon-pause' />
                                            </Tooltip>
                                        );
                                    } else if (status === 'ACTIVE') {
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <CheckCircleOutlined style={{ color: 'green', fontSize: '18px' }} className='black-icon-active'/>
                                            </Tooltip>
                                        );
                                    } else {
                                        // Default for unknown status
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
                                            </Tooltip>
                                        );
                                    }
                                } else {
                                    // Fallback if no matching campaign is found
                                    return (
                                        <Tooltip title="No campaign data available">
                                            <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
                                        </Tooltip>
                                    );
                                }
                            })()}
                        </div> */}
                        {universalOject?.comment ? (
                            <Tooltip
                                // title={relatedComment || 'No comment available'}
                                // title={
                                //     <div>
                                //       <div>{relatedComment || 'No comment available'}</div>
                                //       <div>
                                //         {editUserANdTime
                                //           ? moment(editUserANdTime?.editedTime, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A")
                                //           : ""}
                                //       </div>
                                //     </div>
                                // }
                                title={
                                    <div>
                                        <div>{universalOject?.comment}</div>
                                        <div style={{ opacity: .85 }}>{universalOject?.editedTime || 'N/A'}{universalOject?.usercommit ? ` • ${universalOject?.usercommit}` : ''}</div>
                                    </div>
                                }
                                overlayInnerStyle={{
                                    backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    border: '1px solid #ccc',
                                    borderRadius: 6,
                                    // fontWeight: 500,
                                }}
                            >
                                <MessageOutlined
                                    className={theme === "dark" ? "black-icon-comment" : 'Message'}
                                    style={{
                                        cursor: 'pointer',
                                        marginLeft: '10px',
                                        marginRight: '10px',
                                        color: '#4CAF50'
                                    }}
                                    onClick={handleEditClick} // Open modal directly on click
                                />
                            </Tooltip>
                        ) : (
                            <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '8px', marginRight: '10px' }} />
                        )}
                        <Tooltip
                            title={tooltipText}
                            overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                // fontWeight: 500,
                            }}
                        >
                            <CopyOutlined
                                onClick={copyToClipboard}
                                style={{ cursor: 'pointer', marginLeft: '0px', color: "#1e1e1f", marginRight: '10px' }}
                            />
                        </Tooltip>
                        <Tooltip
                            title={<CreativeTooltip />}
                            placement="right"
                            overlayInnerStyle={{
                                backgroundColor: theme === "dark" ? "#111" : "#fff",
                                border: "1px solid #ccc",
                                borderRadius: 8,
                                padding: 10
                            }}
                        >
                            <PictureOutlined
                                className={
                                    theme === "dark"
                                        ? creatives.length > 0
                                            ? "black-icon-creatives"
                                            : "black-icon-creatives1"
                                        : ""
                                }

                                style={{
                                    cursor: "pointer",
                                    color: creatives.length ? "#1890ff" : "#aaa",
                                    fontSize: 12,
                                    marginRight: '5px'
                                }}
                            />
                        </Tooltip>
                        <Modal
                            className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                            open={creativeModalOpen}
                            onCancel={() => {
                                setCreativeModalOpen(false);
                                setSelectedCampaignCreatives([]);
                            }}
                            footer={null}
                            width={350}
                            closable
                            bodyStyle={{
                                padding: 0,
                                background: theme === "dark" ? "#18191a" : "#fff",
                                overflowY: "auto",
                                maxHeight: "85vh",
                            }}
                            style={{ top: 15 }}
                        >
                            {selectedCampaignCreatives.map((selectedCreative, idx) => (
                                <div key={idx}>


                                    <div style={{ padding: "8px 10px" }}>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            {/* <img
                                                src={selectedCreative.image}
                                                alt="page"
                                                style={{
                                                    width: 35,
                                                    height: 35,
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                }}
                                            /> */}
                                            <CreativeAvatar
                                                url={selectedCreative.image}
                                                filetype={selectedCreative.filetype}
                                            />
                                            <div style={{ flex: 1, marginLeft: 6 }}>
                                                <div style={{ display: "flex" }}>
                                                    <div
                                                        style={{
                                                            fontWeight: 600,
                                                            fontSize: 10,
                                                            color: theme === "dark" ? "#e4e6eb" : "#050505",
                                                        }}
                                                    >
                                                        {selectedCreative.adName || "-"}
                                                    </div>
                                                    <div>
                                                        {idx === 0 && adLevelCreatives.length > 0 && (
                                                            <EditOutlined
                                                                style={{ cursor: "pointer", marginLeft: 8 }}
                                                                onClick={() => {
                                                                    const campaign = adLevelCreatives[0];

                                                                    const href = `/Campaigns?campaignId=${currentCampaignId}&account=${currentAccount}&network=${newRevenuePratner}`;
                                                                    window.open(href, "_blank", "noopener,noreferrer");
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        color: theme === "dark" ? "#b0b3b8" : "#65676b",
                                                    }}
                                                >
                                                    Sponsored <GlobalOutlined />
                                                </div>
                                            </div>
                                        </div>

                                        {selectedCreative.message && (
                                            <div
                                                style={{
                                                    marginTop: 2,
                                                    fontSize: 8,
                                                    color: theme === "dark" ? "#e4e6eb" : "#050505",
                                                }}
                                            >
                                                {selectedCreative.message}
                                            </div>
                                        )}
                                    </div>
                                    {/* <img
                                        src={selectedCreative.image}
                                        alt="creative"
                                        style={{
                                            width: "100%",
                                            height: "auto",
                                            objectFit: "cover",
                                            display: "block",
                                        }}
                                    /> */}
                                    <CreativeMedia
                                        url={selectedCreative.image}
                                        filetype={selectedCreative.filetype}
                                    />
                                    <div style={{ padding: "8px 10px" }}>
                                        {selectedCreative.headline && (
                                            <div
                                                style={{
                                                    fontSize: 8,
                                                    fontWeight: 600,
                                                    color: theme === "dark" ? "#e4e6eb" : "#050505",
                                                    marginBottom: 2,
                                                }}
                                            >
                                                {selectedCreative.headline}
                                            </div>
                                        )}

                                        {selectedCreative.description && (
                                            <div
                                                style={{
                                                    fontSize: 8,
                                                    color: theme === "dark" ? "#b0b3b8" : "#65676b",
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {selectedCreative.description}
                                            </div>
                                        )}

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: 6,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 8,
                                                    color: theme === "dark" ? "#b0b3b8" : "#525456",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {selectedCreative.websiteUrl
                                                    ? new URL(selectedCreative.websiteUrl).hostname
                                                    : "-"}
                                            </div>

                                            {selectedCreative.websiteUrl && (
                                                <a
                                                    href={selectedCreative.websiteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ textDecoration: "none" }}
                                                >
                                                    <div
                                                        style={{
                                                            padding: "5px 12px",
                                                            background: "#5B8CFF",
                                                            color: "#000",
                                                            borderRadius: 18,
                                                            fontSize: 8,
                                                            fontWeight: 600,
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        Learn more
                                                    </div>
                                                </a>
                                            )}
                                        </div>

                                        {selectedCreative.websiteUrl && (
                                            <div
                                                style={{
                                                    marginTop: 2,
                                                    fontSize: 8,
                                                    color: theme === "dark" ? "#2e89ff" : "#1877f2",
                                                    wordBreak: "break-all",
                                                }}
                                            >
                                                <a
                                                    href={selectedCreative.websiteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        color: theme === "dark" ? "#2e89ff" : "#1877f2",
                                                        textDecoration: "none",
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {selectedCreative.websiteUrl}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            borderTop: theme === "dark"
                                                ? "1px solid #3a3b3c"
                                                : "1px solid #ddd",
                                            display: "flex",
                                            justifyContent: "space-around",
                                            padding: "8px 0",
                                            fontSize: 10,
                                            color: theme === "dark" ? "#b0b3b8" : "#65676b",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                            <LikeOutlined style={{ marginRight: 5, fontSize: 12 }} />
                                            Like
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                            <CommentOutlined style={{ marginRight: 5, fontSize: 12 }} />
                                            Comment
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                            <ShareAltOutlined style={{ marginRight: 5, fontSize: 12 }} />
                                            Share
                                        </div>
                                    </div>

                                    {idx < selectedCampaignCreatives.length - 1 && (
                                        <div
                                            style={{
                                                height: 8,
                                                background: theme === "dark" ? "#303031ff" : "#e0e2e3ff",
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </Modal>
                        <LinkOutlined
                            onClick={() => {
                                const url = `/DailyAndCampaignHistory/AdsetHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${accountNumberToPassHistoryPage}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                                window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                            style={{ cursor: 'pointer', marginLeft: '0px', color: "#1e1e1f", marginRight: '5px' }}
                        />
                        <Tooltip
                            title={valueWithCount}
                            overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                // fontWeight: 500,
                            }}
                        >
                            <span
                                onClick={() => {
                                    const rowData = params.node.group
                                        ? params.node.childrenAfterGroup?.[0]?.data
                                        : params.node.data;

                                    const rowNode = params.api.getRowNode(params.node.id);

                                    // Clear existing selections (for single-select mode)
                                    params.api.deselectAll();

                                    // Set this row as selected
                                    if (rowNode) {
                                        rowNode.setSelected(true);
                                    }


                                    showAdsetLevel([rowData]);
                                    moveToNextTab("3");

                                    // console.log("Clicked row data:", [rowData]);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                {valueWithCount}
                            </span>
                        </Tooltip>
                        <Modal
                            title={firstColumnValue}
                            visible={isModalVisibles}
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            onOk={handleOks} // Default Ok button functionality
                            onCancel={handleCancels} // Default Cancel button functionality
                            footer={[
                                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                    <div style={{ display: 'flex', flexDirection: "column" }}>
                                        <span key="info" style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black", }}>
                                            Last Edited Time:
                                        </span>
                                        <span key="info1" style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black", }}>
                                            {/* {editUserANdTime ? moment(editUserANdTime?.editedTime, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A") : ""} */}
                                            {/* {editedPretty || ""} */}
                                            {universalOject?.editedTime || ""}
                                        </span>

                                    </div>
                                    <div>
                                        <Button
                                            key="delete"
                                            type="danger"
                                            onClick={handleDelete}
                                            style={{ marginRight: 'auto', border: "1px solid #e3e3da" }} // Push Delete button to the far left
                                        >
                                            Delete
                                        </Button>
                                        <Button key="cancel" onClick={handleCancels} style={{ marginLeft: "4px" }}>
                                            Cancel
                                        </Button>
                                        <Button key="ok" onClick={handleOks} style={{ marginLeft: "4px", backgroundColor: "#5B8CFF" }}>
                                            Ok
                                        </Button>
                                    </div>
                                </div>
                            ]}
                        >
                            <Input.TextArea
                                placeholder="Enter your comments here"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </Modal>
                    </div>
                );
            }
        }
    };

    const adsetStatusMap = useMemo(() => {
        const map = new Map();

        campaignComments.forEach(doc => {
            if (!doc?.campaignid) return;

            const push = (entry) => {
                if (!entry?.adset_id) return;
                const key = `${doc.campaignid}_${entry.adset_id}`;
                map.set(key, (entry.status || '').toUpperCase());
            };

            if (Array.isArray(doc.AdsetLevel)) {
                doc.AdsetLevel.forEach(push);
            } else if (doc.AdsetLevel && typeof doc.AdsetLevel === 'object') {
                push(doc.AdsetLevel); // legacy single object
            }
        });

        return map;
    }, [campaignComments]);

    const getAdsetStatus = (campaignId, adsetId) => {
        const key = `${campaignId}_${adsetId}`;
        return adsetStatusMap.get(key); // returns "ACTIVE" | "PAUSED" | undefined
    };

    const functionCall2 = async () => {
        try {
            setLoading1(true);
            const campaigns = selectedCampaigns.length > 0
                ? [...new Set(selectedCampaigns.map(adset => adset.campaignid))]
                : [];
            // console.log(campaigns, "campaigns");
            const api = newRevenuePratner === "FB_DomainActive" ? "Daily/CampaignName" : "Daily";
            const collectionName = newRevenuePratner === "FB_DomainActive" ? "Facebook_DActive_Names" : newRevenuePratner === "FB_InuvoPrism" ? "Facebook_InuvoPrism_Daily" : newtworkCollections[newRevenuePratner];
            // const fetchData = await apiClient.get(`/${api}?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=${newtworkCollections[newRevenuePratner]}`);
            // const fetchData = await apiClient.post(`/AdsetLevel?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&status=Daily&network=${collectionName}`, { campaignids: campaigns });
            // const mainData = fetchData.data;

            // ✅ multi-account param
            const accountsParam = Array.isArray(newaccount)
                ? newaccount.map(String)
                : [String(newaccount)];

            // ✅ call multi-account endpoint (Daily)
            const resp = await apiClient.post("/reports/data/adset", {
                dateStart: startDate,
                dateEnd: endDate,
                timezone: newtime,
                status: "Daily",              // ← force Daily on the Daily screen
                network: collectionName,
                accountNumbers: accountsParam,
                campaignids: campaigns,
            });


            // You had a filter to skip rows where ad_clicks > 0
            const mainData = resp.data.data || [];

            const campaignsByAccount = {};
            mainData.forEach(item => {
                const account = String(item.accountNumber);
                const campaignId = String(item.campaign_id);

                if (!account || !campaignId) return;

                if (!campaignsByAccount[account]) {
                    campaignsByAccount[account] = [];
                }

                if (!campaignsByAccount[account].includes(campaignId)) {
                    campaignsByAccount[account].push(campaignId);
                }
            });
            setCampaignIds(campaignsByAccount);

            const getValidField = (field) => {
                for (const item of mainData) {
                    if (item[field] && item[field].toLowerCase() !== 'failed') {
                        return item[field];
                    }
                }
                return '-';
            };

            fbCron.current = getValidField('fbCron');
            revenueCron.current = getValidField('revenueCron');
            cronStatus.current = getValidField('cronStatus');
            accountStatus.current = getValidField('accountStatus');

            console.log(mainData,"main")


            timezone.current = mainData.length > 0 ? mainData[0].accountTimezone : "";
            let totalSpend = 0;
            let totalRevenue = 0;
            let totalProfit = 0;
            let totalCpc = 0;
            let totalFbleads = 0;
            let totalFbclicks = 0;
            let totalFblinkclicks = 0;
            let totalImpressions = 0;
            let totalConversions = 0;
            const specifiedTimeZone = selectTimezone[newtime];
            // console.log(mainData[0], "one");
            const totalRow = mainData && mainData.length > 0 ?
                mainData.map((eachData) => {
                    const Revenue = eachData.estimated_revenue !== undefined ? (eachData.estimated_revenue) : 0;
                    const profit = (Revenue - eachData.spend);
                    const conversions = eachData.conversions !== undefined ? eachData.conversions : 0;
                    totalRevenue += Revenue;
                    totalSpend += parseFloat(eachData.spend);
                    totalProfit += profit;
                    totalConversions += conversions;
                    totalCpc += eachData.cpc;
                    totalFbclicks += eachData.fbClicks;
                    totalFblinkclicks += eachData.fbLinkClicks;
                    totalFbleads += eachData.fbLeads;
                    totalImpressions += eachData.impressions;
                }) : null;
            const filteredData = mainData && mainData.length > 0 ?
                mainData.map((eachData) => {
                    // console.log('TQ in row:', eachData.tq, typeof eachData.tq);
                    const Revenue = eachData.estimated_revenue !== undefined ? (eachData.estimated_revenue) : 0;
                    const profit = Math.round((Revenue - eachData.spend) * 100) / 100;
                    const margin = Revenue !== 0 ? `${Math.round((((Revenue - eachData.spend) / eachData.estimated_revenue) * 100) * 100) / 100}%` : '0%'
                    let rpc = newRevenuePratner === "FB_Mnet" && newtime === "UTC" ? eachData.ad_clicks !== 0 ? (Math.round((Revenue / eachData.ad_clicks) * 100) / 100) : 0 : eachData.conversions !== 0 ? (Math.round((Revenue / eachData.conversions) * 100) / 100) : 0;
                    const revenue = ((eachData.estimated_revenue - eachData.spend) / (eachData.fbLeads * rpc)) * 100;
                    let fMargin = revenue !== 0 ? Math.round(((profit / revenue) * 100) * 100) / 100 : 0;
                    const cpl = eachData.fbLeads !== 0 ? Math.round((eachData.spend / eachData.fbLeads) * 100) / 100 : 0;
                    let ncpl = newRevenuePratner === "FB_Mnet" && newtime === "UTC" ? eachData.ad_clicks !== 0 ? Math.round((eachData.spend / eachData.ad_clicks) * 100) / 100 : 0 : eachData.conversions !== 0 ? Math.round((eachData.spend / eachData.conversions) * 100) / 100 : 0;
                    const roi = eachData.spend !== 0 ? `${Math.round((((Revenue - eachData.spend) / eachData.spend) * 100) * 100) / 100}%` : '0%';
                    const ctr = eachData.impressions !== 0 ? `${Math.round(((eachData.fbClicks / eachData.impressions) * 100) * 100) / 100}%` : '0%';
                    const mainRvenue = ((Math.round(Revenue * 100) / 100)).toString();
                    const conversions = newRevenuePratner === "FB_Mnet" && newtime === "UTC"
                        ? eachData.ad_clicks !== undefined
                            ? eachData.ad_clicks
                            : '0'
                        : eachData.conversions !== undefined
                            ? eachData.conversions
                            : '0';
                    rpc = !isNaN(rpc) ? rpc : 0;
                    ncpl = !isNaN(ncpl) ? ncpl : 0;
                    fMargin = !isNaN(fMargin) ? `${fMargin}%` : '0%';
                    const fbLClicks = parseInt(eachData.fbLinkClicks, 10);
                    const spend = parseFloat(eachData.spend);
                    const cpcLinkClicks = isNaN(fbLClicks) || fbLClicks === 0 ? 0 : Math.round((spend / fbLClicks) * 100) / 100;
                    const category = campaignComments.find(campaign => campaign.campaignid === eachData.campaign_id && campaign.Account === eachData.accountNumber && campaign.level === "campaign");
                    const campaign_date = Camapignlevelstatus.find(campaign => campaign.campaign_id === eachData.campaign_id && campaign.accountNumber === eachData.accountNumber);
                    const adsetObjectStatus = Camapignlevelstatus
                        ?.find(item =>
                            String(item?.campaign_id) === String(eachData?.campaign_id) &&
                            String(item?.accountNumber) === String(eachData?.accountNumber)
                        )?.adsets?.find(adset =>
                            String(adset?.adset_id) === String(eachData?.adset_id)
                        );
                    // console.log(eachData.campaign_name, "campaign_name");
                    return (
                        {
                            accountNumber: String(eachData.accountNumber),
                            campaignname: eachData.campaign_name,
                            adsetname: eachData.adsetName,
                            date: eachData[specifiedTimeZone],
                            'fb-hour': eachData.campaign_id,
                            'mnet-hour': eachData.campaign_id,
                            spend: parseFloat(eachData.spend).toFixed(2),
                            revenue: parseFloat(mainRvenue).toFixed(2),
                            profit: parseFloat(profit),
                            // margin: margin,
                            fbleads: parseInt(eachData.fbLeads),
                            conversions: parseInt(eachData.conversions),
                            cpc: parseFloat(eachData.cpc),
                            cpclinkclicks: cpcLinkClicks,
                            fbclicks: parseInt(eachData.fbClicks),
                            fblinkclicks: parseInt(eachData.fbLinkClicks),
                            impressions: parseInt(eachData.impressions),
                            ctr: ctr,
                            rpc: parseFloat(rpc),
                            cpl: parseFloat(cpl),
                            ncpl: parseFloat(cpl),
                            roi: roi,
                            fmargin: fMargin,
                            campaignid: eachData.campaign_id,
                            adsetid: eachData.adset_id,
                            timezone: 'UTC',
                            adid: "",
                            adname: "",
                            actions: '...',
                            from: campaign_date?.start ? campaign_date?.start : "",
                            to: campaign_date?.end ? campaign_date?.end : "",
                            profitloss: "",
                            M_tq: "",
                            D_tq: "",
                            // compaignid: eachData.campaign_id,
                            fbCron: eachData.fbCron,
                            revenueCron: eachData.revenueCron,
                            cronStatus: eachData.cronStatus,
                            accountStatus: eachData.accountStatus,
                            category: category?.category || "",
                            fbStatus: adsetObjectStatus?.status || "ACTIVE",
                        }
                    )
                }) : null;

            const fullData = filteredData?.length > 0 ? [...filteredData] : [];

            console.log(filteredData,"filteredData")

            let newFilterData;
            if (campaignStatusFilter !== "All") {
                newFilterData = fullData.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
            }
            else {
                newFilterData = fullData;
            }

            // setRowData(newFilterData);
            newRowDataForFilter.current = filteredData;

            // const filteredByStatus =
            //     !campaignStatusFilter || campaignStatusFilter.toUpperCase() === 'ALL'
            //         ? fullData
            //         : fullData.filter(item => {
            //             const raw = getAdsetStatus(item.campaignid, item.adsetid);
            //             // Default to ACTIVE when we never toggled that adset yet
            //             const status = (raw || 'ACTIVE').toUpperCase();
            //             return status === campaignStatusFilter.toUpperCase();
            //         });

            setdailyData(newFilterData);

            setDailyFixedFooter(
                [
                    {
                        campaignName: 'Total',
                        actions: '',
                        spend: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
                        revenue: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
                        profit: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
                        margin: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
                        rpc: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / newFilterData?.length).toFixed(2)),
                        cpl: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / newFilterData?.length).toFixed(2)),
                        ncpl: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / newFilterData?.length).toFixed(2)),
                        fbleads: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
                        conversions: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
                        fmargin: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                        roi: parseFloat(((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                        cpc: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / newFilterData?.length).toFixed(2)),
                        cpclinkclicks: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks), 0) / newFilterData?.length).toFixed(2)),
                        fbclicks: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
                        fblinkclicks: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0).toFixed(2)),
                        impressions: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
                        // tq: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.tq), 0).toFixed(2)),
                        ctr: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)),
                        tq: newFilterData?.length
                            ? Math.round(
                                newFilterData.reduce((acc, curr) =>
                                    acc + (curr.tq !== undefined && !isNaN(curr.tq) ? Number(curr.tq) : 0), 0
                                ) * 100) / 100
                            : 0,
                    }
                ]
            );

            // setDailyFixedFooter(
            //     [
            //         {
            //             campaignName: 'Total',
            //             actions: '',
            //             spend: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
            //             revenue: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
            //             profit: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
            //             margin: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
            //             rpc: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / fullData?.length).toFixed(2)),
            //             cpl: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / fullData?.length).toFixed(2)),
            //             ncpl: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / fullData?.length).toFixed(2)),
            //             fbleads: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
            //             conversions: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
            //             fmargin: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
            //             roi: parseFloat(((fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
            //             cpc: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / fullData?.length).toFixed(2)),
            //             cpclinkclicks: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks), 0) / fullData?.length).toFixed(2)),
            //             fbclicks: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
            //             fblinkclicks: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0).toFixed(2)),
            //             impressions: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
            //             // tq: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.tq), 0).toFixed(2)),
            //             ctr: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)),
            //             tq: fullData?.length
            //             ? Math.round(
            //                 fullData.reduce((acc, curr) =>
            //                     acc + (curr.tq !== undefined && !isNaN(curr.tq) ? Number(curr.tq) : 0), 0
            //             ) * 100) / 100
            //             : 0,
            //         }
            //     ]
            // );

            // setdailyData(fullData);

            newDailyData.current = fullData;
            fetchData.status === 200 && setApiStatus(false);
            // fetchData.status === 200 && console.log("Success");
            // setTrue(false);
            setLoading1(false);
        } catch (error) {
            console.log(error);
            // if(error.response.status === 500){
            //     apiStatus.current = true;
            // }
            // console.log(error);
            setApiStatus(false);
            setLoading1(false);
        }
    }
    // useEffect(() => {
    //     console.log(campaignIds, "campaignIds updated");
    // }, [campaignIds]);
    useEffect(() => {
        if (!campaignIds || Object.keys(campaignIds).length === 0) return;

        const fetchCreatives = async () => {
            const token = localStorage.getItem("token");
            try {
                const creativesData = await sendCreativesRequest(
                    campaignIds,
                    token
                );

                // console.log('Final creatives data:', creativesData);
                setAdLevelCreatives(creativesData)

            } catch (err) {
                console.error('Creatives fetch failed', err);
            }
        };

        fetchCreatives();
    }, [campaignIds]);
    const sendCreativesRequest = async (campaignIdsByAccount, token) => {
        if (!campaignIdsByAccount || typeof campaignIdsByAccount !== "object") return [];


        const items = Object.entries(campaignIdsByAccount).map(
            ([accountNumber, campaignIds]) => ({
                accountNumber: String(accountNumber),
                campaignIds: campaignIds.map(String)
            })
        );

        const resp = await apiClient.post(
            "/reports/data/creatives",
            { items },
            {
                headers: {
                    Authorization: token
                }
            }
        );

        return resp.data?.data || [];
    };

    const defaultColDef = {
        comparator: (valueA, valueB) => {
            // Default comparator for handling null or undefined values
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        },
        sortable: true,  // Enable sorting for all columns by default
        // filter: true,    // Enable filtering for all columns by default
        resizable: true,
        flex: 1,
        minWidth: 150,
        filter: true, // Enable default filtering
        suppressHeaderMenuButton: false, // Ensure filter menu button is visible
        suppressHeaderContextMenu: false,
    };
    const onCellClicked = (event) => {

        if (event.colDef.field === 'adsetname') {
            const value = event.value;
            if (value !== undefined) {
                const url = `/DailyAndCampaignHistory/AdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        }
        // // ✅ Ensure first selected cell gets highlighted
        // if (event.event.shiftKey || event.event.ctrlKey) {
        //     // Add to selection when Shift/Ctrl is pressed
        //     setSelectedCells((prev) => [...prev, { rowIndex: event.node.rowIndex, colId: event.column.getId() }]);
        // } else {
        //     // Single click selects only one cell
        //     setFirstSelectedCell({ rowIndex: event.node.rowIndex, colId: event.column.getId() });
        //     setSelectedCells([{ rowIndex: event.node.rowIndex, colId: event.column.getId() }]);
        // }

    };
    // const onGridReady = (params, gridId) => {
    //     gridRef1.current = params;

    //     params.api.applyColumnState({ 
    //         state: columnDefs || [], 
    //         applyOrder: true 
    //     });
    // };

    // // Effect to handle event listener based on toggleStatus
    // useEffect(() => {
    //     if (!gridRef1.current) return; // Ensure gridRef exists

    //     const gridApi = gridRef1.current.api;
    //     const handleDragStopped = (e) => debouncedHandleColumnMove(e, 'grid2');

    //     if (toggleStatus) {
    //         gridApi.addEventListener('dragStopped', handleDragStopped);
    //     } else {
    //         gridApi.removeEventListener('dragStopped', handleDragStopped);
    //     }

    //     return () => {
    //         gridApi.removeEventListener('dragStopped', handleDragStopped); // Cleanup on unmount
    //     };
    // }, [toggleStatus]); 

    const onGridReady = (params, gridId, gridRef) => {
        gridRef.current = params;
        params.api.applyColumnState({ state: columnDefs, applyOrder: true });
        params.api.addEventListener('dragStopped', (e) => debouncedHandleColumnMove(e, gridId));
    };
    const GroupCellRenderer = (props) => {
        const [tooltipText, setTooltipText] = useState("Copy to clipboard");

        const copyToClipboard = () => {
            navigator.clipboard.writeText(props.node.key).then(() => {
                setTooltipText("Copied!");
                setTimeout(() => setTooltipText("Copy to clipboard"), 2000);
            }).catch(() => {
                alert('Failed to copy!');
            });
        };
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                    {props.node.key} {/* Grouped cell value */}
                </span>
                <Tooltip title={tooltipText}>
                    <CopyOutlined
                        onClick={copyToClipboard}
                        style={{ cursor: 'pointer', marginLeft: '8px', color: '#1e1e1f' }}
                    />
                </Tooltip>
            </div>
        );
    };
    const showModal = () => {
        setIsModalOpen(true);
    };
    // const getMainMenuItems = (params) => {
    //     const defaultItems = params.defaultItems.slice();

    //     // Find and override the "Reset Columns" option
    //     const resetColumnsItemIndex = defaultItems.findIndex(item => item === 'resetColumns');
    //     if (resetColumnsItemIndex > -1) {
    //         defaultItems[resetColumnsItemIndex] = {
    //             name: 'Reset Columns (Custom)',
    //             action: () => {
    //                 changeRRefrst();
    //             },
    //             cssClasses: ['custom-reset-columns-item']
    //         };
    //         defaultItems.splice(resetColumnsItemIndex + 1, 0, {
    //             name: 'Add New Column',
    //             action: showModal,
    //             cssClasses: ['custom-new-item'], // Assign a custom class for skyblue background
    //         });
    //     }

    //     return defaultItems;
    // };
    const gridOptions1 = useMemo(() => ({
        onColumnMoved: (params) => {
            // if (toggleStatus) {
            debouncedHandleColumnMove(params, 'grid2');
            // }
        },
        defaultColDef: {
            suppressMenu: true,
            headerClass: "custom-header" // Apply to all columns by default
        },
        ensureDomOrder: false
    }), []);
    const restoreGridState = (gridApi) => {
        const filterModel = JSON.parse(localStorage.getItem('gridFilterModel'));
        const sortModel = JSON.parse(localStorage.getItem('gridSortModel'));

        if (gridApi) {
            if (filterModel) gridApi.setFilterModel(filterModel);
            if (sortModel) gridApi.setSortModel(sortModel);
        }
    };

    // const onRangeSelectionChanged = (params) => {
    //     // Capture all selected cell positions when range is selected
    //     const selected = [];
    //     const rangeSelections = params.api.getCellRanges();

    //     if (rangeSelections) {
    //         rangeSelections.forEach((range) => {
    //             const startRow = Math.min(range.startRow.rowIndex, range.endRow.rowIndex);
    //             const endRow = Math.max(range.startRow.rowIndex, range.endRow.rowIndex);
    //             const columns = range.columns.map((col) => col.getColId());

    //             for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
    //                 selected.push({ rowIndex, columns });
    //             }
    //         });
    //     }

    //     setSelectedCells(selected);
    // };

    const onCellKeyDown = (params) => {
        if (params.event.ctrlKey && params.event.key === "c") {
            params.event.preventDefault(); // Prevent default copy behavior

            // ✅ Ensure `selectedCells` is not empty
            if (!selectedCells.length) return;

            // ✅ Prepare data to copy: Rows separated by \n, Columns by \t
            const copiedText = selectedCells
                .map(({ rowIndex, columns }) => {
                    if (!columns || !Array.isArray(columns)) {
                        // ✅ Handle case where only one cell is selected
                        const singleColId = selectedCells[0]?.colId;
                        const row = params.api.getDisplayedRowAtIndex(rowIndex);
                        return row && singleColId ? params.api.getValue(singleColId, row) : "";
                    }

                    // ✅ Multi-cell copying logic
                    return columns
                        .map((colId) => {
                            const row = params.api.getDisplayedRowAtIndex(rowIndex);
                            return row ? params.api.getValue(colId, row) : "";
                        })
                        .join("\t");
                })
                .join("\n"); // Each row on a new line

            // ✅ Copy text to clipboard
            navigator.clipboard.writeText(copiedText).then(() => {
                // console.log("Copied to clipboard:", copiedText);
            }).catch((err) => {
                console.error("Clipboard copy failed:", err);
            });

            // ✅ Trigger AG Grid’s built-in copy effect (blinking dark blue selection)
            params.api.copySelectedRangeToClipboard();
        }
    };



    const handleReFetchData = () => {
        functionCall2();
        setApiStatus(false);
    }

    // useEffect(() => {
    //     if (selectedCampaigns) {
    //         functionCall2();
    //         oneTimeFetch.current = false;
    //     }
    // }, [selectedCampaigns]);

    const hasRunOnce2 = useRef(false);
    const prevCampaigns2 = useRef(null);

    useEffect(() => {
        if (activeTab !== "2") return;

        const campsStr = JSON.stringify(selectedCampaigns);

        const changed =
            !hasRunOnce2.current || prevCampaigns2.current !== campsStr;

        if (changed) {
            functionCall2();
            hasRunOnce2.current = true;
            prevCampaigns2.current = campsStr;
        }
    }, [activeTab, selectedCampaigns]);

    useEffect(() => {
        // functionCall1();
        // console.log(campaignStatusFilter, "campaignStatusFilter");
        if (campaignStatusFilter !== "All") {
            // Filter grid rows by adset status
            const adsetStatusMap = new Map(
                Camapignlevelstatus.flatMap(campaign =>
                    (campaign.adsets || []).map(adset => [
                        String(adset.adset_id),
                        adset.status?.toUpperCase()
                    ])
                )
            );

            const filteredRowObjects = newRowDataForFilter.current.filter(row =>
                adsetStatusMap.get(String(row.adsetid)) ===
                campaignStatusFilter?.toUpperCase()
            );

            setdailyData(filteredRowObjects)
            if (typeFilter !== "All") {

                const campaignBudgetMap = new Map(
                    Camapignlevelstatus.map(item => {
                        const id = String(item.campaign_id);

                        const hasDaily =
                            Number(item.campaign_budget?.daily_budget || 0) > 0 ||
                            item.adsets?.some(ad => Number(ad.budget?.daily_budget || 0) > 0);

                        const hasLifetime =
                            Number(item.campaign_budget?.lifetime_budget || 0) > 0 ||
                            item.adsets?.some(ad => Number(ad.budget?.lifetime_budget || 0) > 0);

                        return [id, { daily: hasDaily, lifetime: hasLifetime }];
                    })
                );

                const filteredByType = filteredRowObjects.filter(row => {
                    const budget = campaignBudgetMap.get(String(row.campaignid));

                    if (typeFilter === "Daily") return budget?.daily;
                    if (typeFilter === "Lifetime") return budget?.lifetime;

                    return true;
                });

                setdailyData(filteredByType);
            }

            // filteredRowObjects is the final adset-filtered grid data

            // const filteredByStatus = newRowDataForFilter.current.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
            // setdailyData(filteredByStatus);
        } else {
            let data = newRowDataForFilter.current;

            if (typeFilter !== "All") {
                const campaignBudgetMap = new Map(
                    Camapignlevelstatus.map(item => {
                        const id = String(item.campaign_id);

                        const hasDaily =
                            Number(item.campaign_budget?.daily_budget || 0) > 0 ||
                            item.adsets?.some(ad => Number(ad.budget?.daily_budget || 0) > 0);

                        const hasLifetime =
                            Number(item.campaign_budget?.lifetime_budget || 0) > 0 ||
                            item.adsets?.some(ad => Number(ad.budget?.lifetime_budget || 0) > 0);

                        return [id, { daily: hasDaily, lifetime: hasLifetime }];
                    })
                );

                data = data.filter(row => {
                    const budget = campaignBudgetMap.get(String(row.campaignid));

                    if (typeFilter === "Daily") return budget?.daily;
                    if (typeFilter === "Lifetime") return budget?.lifetime;

                    return true;
                });
            }

            setdailyData(data);
            // setdailyData(newRowDataForFilter.current);
        }
    }, [campaignStatusFilter, typeFilter, Camapignlevelstatus]);

    // useEffect(() => {
    //     // console.log(campaignComments, "campaignComments");
    //     const mainData = newRowDataForFilter.current;
    //     const filterData = mainData && mainData.length > 0 ?
    //         mainData.map((eachData) => {
    //             const adsetObjectStatus = Camapignlevelstatus
    //                 .find(item =>
    //                     String(item.campaign_id) === String(eachData.campaignid) &&
    //                     String(item.accountNumber) === String(eachData.accountNumber)
    //                 )?.adsets.find(adset =>
    //                     String(adset.adset_id) === String(eachData.adsetid)
    //                 );
    //             return (
    //                 {
    //                     ...eachData,
    //                     fbStatus: adsetObjectStatus?.status || "ACTIVE",
    //                 }
    //             )
    //         }) : null;
    //     newRowDataForFilter.current = filterData;
    //     let newFilterData;
    //     if (campaignStatusFilter !== "All") {
    //         console.log("testing 4444");
    //         newFilterData = filterData?.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
    //     }
    //     else {
    //         newFilterData = filterData;
    //     }

    //     setdailyData(newFilterData);
    //     // newRowDataForFilter.current = filteredData;
    //     console.log("testing 4444");
    // }
    //     , [Camapignlevelstatus]);

    // useEffect(() => {
    //     // if (selectedCampaigns.length > 0) {
    //         functionCall2();
    //     // }
    // }, [selectedCampaigns]);


    useEffect(() => {
        if (refreshpage === "Refresh22") {
            handleReFetchData();
            showAdsetLevel([]);
        }
    }
        , [refreshpage]);

    useEffect(() => {
        if (gridRef1.current && gridRef1.current.api) {
            setTimeout(() => {
                gridRef1.current.api.refreshCells({ force: true });
                gridRef1.current.api.redrawRows();
                gridRef1.current.api.sizeColumnsToFit();
            }, 200);
        }
    }, [memorizedDailyData]);

    useEffect(() => {
        if (removeSelectedAdsets === "Remove") {
            if (gridRef1.current) {
                gridRef1.current.api.deselectAll(); // ✅ clears selection in grid
                // showCampaignLevel([]);             // ✅ manually clears selection data
            }
        }
    }, [removeSelectedAdsets]);

    // normalize to array
    const ids = Array.isArray(newaccount)
        ? newaccount
        : (newaccount ? [newaccount] : []);

    return (
        <div style={{ height: "100%", marginBottom: '20px' }}>
            <div style={contentStyle}>
                {isLoading1 === true ?
                    (
                        <div className="loader-container ag-container" style={{ backgroundColor: theme === "dark" ? "#333" : "white" }}>
                            <div className="ag-grid-Loader">
                                <Audio
                                    height="80"
                                    width="80"
                                    radius="9"
                                    color="green"
                                    ariaLabel="loading"
                                    wrapperStyle
                                    wrapperClass
                                />
                            </div>
                        </div>
                    ) : newRowDataForFilter.current?.length > 0 ? (
                        <div>
                            <Row className="header-row" style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap', backgroundColor: theme === "dark" && "#4d4d4d", }}>
                                <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                                    <Space align="center" className='daily-contaier'>
                                        <div className="blinking-circle"></div>
                                        <Text style={{ paddingLeft: '3px', fontSize: '15px', color: theme === "dark" && "white" }}>Daily</Text>
                                    </Space>
                                </Col>
                                {leafCampaigns?.length > 1 && (
                                    <Col>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "5px",
                                                padding: "6px 0",
                                            }}
                                        >
                                            {/* active & pause */}
                                            <Tooltip
                                                title={
                                                    <div style={{ display: "flex", gap: "14px" }}>
                                                        <span
                                                            style={{ cursor: "pointer", fontSize: "18px", color: "green" }}
                                                            onClick={() => {
                                                                setBulkStatusAction("ACTIVE");
                                                                setIsBulkStatusModalVisible(true);
                                                            }}
                                                        >
                                                            ▶️
                                                        </span>
                                                        <span
                                                            style={{ cursor: "pointer", fontSize: "18px", color: "red" }}
                                                            onClick={() => {
                                                                setBulkStatusAction("PAUSED");
                                                                setIsBulkStatusModalVisible(true);
                                                            }}
                                                        >
                                                            ⏸️
                                                        </span>
                                                    </div>
                                                }
                                                overlayInnerStyle={{
                                                    backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                                                    color: theme === "dark" ? "#ffffff" : "#000000",
                                                    borderRadius: 6,
                                                    padding: "6px 10px",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                <RxSwitch size={20} style={{ color: theme === "dark" ? "white" : "black" }} />

                                            </Tooltip>
                                            <Modal
                                                title="Confirm Bulk Status Change"
                                                open={isBulkStatusModalVisible}
                                                onCancel={() => setIsBulkStatusModalVisible(false)}
                                                confirmLoading={confirmBulkLoading}
                                                onOk={handleBulkAdsetStatusSubmit}
                                                className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                                            >
                                                {confirmBulkLoading && (
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            background: "rgba(255,255,255,0.7)",
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            zIndex: 1000,
                                                            borderRadius: "8px",
                                                        }}
                                                    >
                                                        <Spin size="large" tip="Saving..." />
                                                    </div>
                                                )}

                                                <p>
                                                    Are you sure you want to set status to{" "}
                                                    <b style={{ color: bulkStatusAction === "ACTIVE" ? "green" : "red" }}>
                                                        {bulkStatusAction}
                                                    </b>{" "}
                                                    for <b>{leafCampaigns.length}</b> campaigns?
                                                </p>
                                            </Modal>

                                            {/* pin & unpin */}
                                            <Tooltip
                                                title={
                                                    <div style={{ display: "flex", gap: "14px" }}>
                                                        <span
                                                            style={{ cursor: "pointer", fontSize: "18px" }}
                                                            onClick={() => handleBulkSmartPinAdset("pin")}
                                                        >
                                                            📌
                                                        </span>
                                                        <span
                                                            style={{ cursor: "pointer", fontSize: "18px" }}
                                                            onClick={() => handleBulkSmartPinAdset("unpin")}
                                                        >
                                                            📍
                                                        </span>
                                                    </div>
                                                }
                                                overlayInnerStyle={{
                                                    backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                                                    color: theme === "dark" ? "#ffffff" : "#000000",
                                                    borderRadius: 6,
                                                    padding: "6px 10px",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                <button
                                                    style={{
                                                        border: "none",
                                                        background: "none",
                                                        cursor: "pointer",
                                                        fontSize: "18px",
                                                    }}
                                                >
                                                    <PushpinOutlined size={20} style={{ color: theme === "dark" ? "white" : "black" }} />
                                                </button>
                                            </Tooltip>
                                            {/*  comment */}
                                            <Tooltip title="Bulk Comment" overlayInnerStyle={{
                                                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                                                color: theme === "dark" ? "#ffffff" : "#000000",
                                                borderRadius: 6,
                                                padding: "6px 10px",
                                                fontSize: "14px",
                                            }}>
                                                <EditOutlined
                                                    onClick={() => setIsBulkCommentModalVisible(true)}
                                                    style={{
                                                        fontSize: "15px",
                                                        cursor: "pointer",
                                                        color: theme === "dark" ? "white" : "black"
                                                    }}
                                                />
                                            </Tooltip>
                                            <Modal
                                                title="Bulk Comment"
                                                open={isBulkCommentModalVisible}
                                                className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                                                onCancel={() => setIsBulkCommentModalVisible(false)}
                                                footer={[
                                                    <Button key="Delete" onClick={handleBulkDeleteComments}>
                                                        Delete
                                                    </Button>,
                                                    <Button key="cancel" onClick={() => setIsBulkCommentModalVisible(false)}>
                                                        Cancel
                                                    </Button>,
                                                    <Button
                                                        key="ok"
                                                        style={{ backgroundColor: "#5B8CFF" }}
                                                        onClick={() => {
                                                            handleSmartCommentSubmitAdset();
                                                            setIsBulkCommentModalVisible(false);
                                                        }}
                                                    >
                                                        Ok
                                                    </Button>
                                                ]}
                                            >
                                                <Input.TextArea
                                                    placeholder="Enter comments"
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    rows={4}
                                                />
                                            </Modal>

                                            {/* Category */}
                                            <Tooltip title="Bulk Add category" overlayInnerStyle={{
                                                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                                                color: theme === "dark" ? "#ffffff" : "#000000",
                                                borderRadius: 6,
                                                padding: "6px 10px",
                                                fontSize: "14px",
                                            }}>
                                                <PlusOutlined
                                                    onClick={openBulkCategoryModal}
                                                    style={{
                                                        fontSize: "15px",
                                                        cursor: "pointer",
                                                        marginLeft: '5px',
                                                        color: theme === "dark" ? "white" : "black"
                                                    }}
                                                />
                                            </Tooltip>
                                            <Modal
                                                open={bulkOpen}
                                                title="Edit Category"
                                                className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                                                onOk={saveBulkCategory}
                                                onCancel={() => setBulkOpen(false)}
                                            >
                                                <Input
                                                    placeholder="Enter category"
                                                    value={bulkCategory}
                                                    onChange={e => setBulkCategory(e.target.value)}
                                                />
                                            </Modal>
                                        </div>
                                    </Col>
                                )}

                                {/* <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ color: theme === "dark" && "white" }}>Id: {newaccount}</Text>
                                        </Col> */}
                                <Col xs={24} sm={24} md={8} style={{ flex: "1 1 auto" }}>
                                    {ids.length <= 1 ? (
                                        // Single (or none) → plain text
                                        <Text style={{ color: theme === "dark" ? "white" : undefined }}>
                                            Id: {ids[0] ?? "-"}
                                        </Text>
                                    ) : (
                                        // Multiple → only an icon; hover shows selected accounts
                                        <Tooltip
                                            title={
                                                <div style={{ maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
                                                    {ids.map((id, i) => {
                                                        const getAccountObject = accountsAccess.find(item => item.accountNumber === id)
                                                        return (<div
                                                            key={`${id}-${i}`}
                                                            style={{
                                                                padding: "4px 6px",
                                                                borderBottom: "1px solid rgba(0,0,0,0.06)",
                                                                fontSize: 12,
                                                                color: theme === "dark" ? "#ddd" : "#333"
                                                            }}
                                                        >
                                                            <div>{id}</div>
                                                            <div>{getAccountObject?.accountName}</div>
                                                        </div>)
                                                    })}
                                                </div>
                                            }
                                            overlayInnerStyle={{
                                                maxWidth: 320,
                                                background: theme === "dark" ? "#1f1f1f" : '#fff',
                                                color: theme === "dark" ? "#fff" : '#000'
                                            }}
                                        >
                                            <Badge count={ids.length} size="small" offset={[0, 2]}>
                                                <NumberOutlined
                                                    style={{
                                                        fontSize: 18,
                                                        cursor: "pointer",
                                                        color: theme === "dark" ? "#9ad" : "grey"
                                                    }}
                                                />
                                            </Badge>
                                        </Tooltip>
                                    )}
                                </Col>

                                <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                    {ids.length <= 1 && (
                                        <Text style={{ color: theme === "dark" ? "white" : undefined }}>
                                            Name: {newAccountName ?? "-"}
                                        </Text>
                                    )
                                    }
                                </Col>

                                <Col xs={24} sm={24} md={8} style={{ flex: "1 1 auto" }}>
                                    {ids.length <= 1 ? (
                                        // Single → plain text
                                        <Text style={{ color: theme === "dark" ? "white" : undefined }}>
                                            Time zone: {ids[0] ? `${timezone.current ?? "-"}` : "-"}
                                        </Text>
                                    ) : (
                                        // Multiple → icon with tooltip of selected account ids + timezones
                                        <Tooltip
                                            title={
                                                <div style={{ maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
                                                    {ids.map((id, i) => {
                                                        const acc = accountsAccess.find(a => a.accountNumber === id);
                                                        // console.log("timezones:", accountsAccess);
                                                        const tz = acc?.timeZone ?? "-";
                                                        return (
                                                            <div
                                                                key={`${id}-${i}`}
                                                                style={{
                                                                    padding: "4px 6px",
                                                                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                                                                    fontSize: 12,
                                                                    color: theme === "dark" ? "#ddd" : "#333"
                                                                }}
                                                            >
                                                                {id} - {tz}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            }
                                            overlayInnerStyle={{
                                                maxWidth: 320,
                                                background: theme === "dark" ? "#1f1f1f" : "#fff",
                                                color: theme === "dark" ? "#fff" : "#000"
                                            }}
                                        >
                                            <Badge count={ids.length} size="small" offset={[0, 2]}>
                                                <GlobalOutlined
                                                    style={{
                                                        fontSize: 18,
                                                        cursor: "pointer",
                                                        color: theme === "dark" ? "#9ad" : "grey"
                                                    }}
                                                />
                                            </Badge>
                                        </Tooltip>
                                    )}
                                </Col>
                                {/* <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ color: theme === "dark" && "white" }}>Name: {newAccountName}</Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ color: theme === "dark" && "white" }}>Time zone: {timezone.current}</Text>
                                        </Col> */}

                                <Col>
                                    <Input
                                        placeholder="Search..."
                                        // prefix={<SearchOutlined />}
                                        onChange={(value) => setInsideInput(value.target.value)}
                                        // onBlur={handleBlur}
                                        value={insideInput}
                                        allowClear
                                        className={theme === 'dark' ? 'inputatInsideTable custom-input-dark' : 'inputatInsideTable custom-input-light'}
                                        style={{
                                            borderRadius: 8,
                                            border: '1px solid #5B8CFF',
                                            // background: theme === 'dark' ? '#2a2a2a' : '#fff',
                                            // border: `1px solid ${theme === 'dark' ? '#444' : '#d9d9d9'}`,
                                            color: theme === 'dark' ? '#fff' : '#000',
                                            fontWeight: 500,
                                            width: 120,
                                            marginRight: '8px'
                                        }}
                                    />
                                </Col>
                                <Col>
                                    <Dropdown
                                        overlay={
                                            <Menu
                                                onClick={({ key }) =>
                                                    // onStatusFilterChange && 
                                                    // onStatusFilterChange(key)
                                                    setcampaignStatusLabel(key)
                                                } // <-- Add this line
                                                items={[
                                                    {
                                                        key: 'All',
                                                        label: (
                                                            <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                                                                <span
                                                                    style={{
                                                                        width: '6px',
                                                                        height: '6px',
                                                                        borderRadius: '50%',
                                                                        backgroundColor: '#122F6E',
                                                                        marginRight: '6px',
                                                                    }}
                                                                ></span>
                                                                All
                                                            </span>
                                                        ),
                                                    },
                                                    {
                                                        key: 'Active',
                                                        label: <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                                                            <span
                                                                style={{
                                                                    width: '6px',
                                                                    height: '6px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: 'green',
                                                                    marginRight: '6px',
                                                                }}
                                                            ></span>
                                                            Active

                                                        </span>
                                                    },
                                                    {
                                                        key: 'Paused', label: <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                                                            <span
                                                                style={{
                                                                    width: '6px',
                                                                    height: '6px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: 'red',
                                                                    marginRight: '6px',
                                                                }}
                                                            ></span>
                                                            Paused

                                                        </span>
                                                    },
                                                    {
                                                        key: 'Archived', label: <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                                                            <span
                                                                style={{
                                                                    width: '6px',
                                                                    height: '6px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: 'orange',
                                                                    marginRight: '6px',
                                                                }}
                                                            ></span>
                                                            Archived

                                                        </span>
                                                    },
                                                ]}
                                            />
                                        }
                                        trigger={['click']}
                                    >
                                        <Button
                                            type="default"
                                            style={{
                                                borderRadius: 8,
                                                background: theme === 'dark' ? 'rgba(82,196,26,0.12)' : '#f6ffed',
                                                border: '1px solid #4CAF50',
                                                color: theme === 'dark' ? '#95de64' : '#389e0d',
                                                fontWeight: 500,
                                                marginRight: '5px'
                                            }}
                                        >
                                            <Space size={2}>
                                                <FilterOutlined />
                                                {campaignStatusFilter}
                                                <DownOutlined style={{ fontSize: 10 }} />
                                            </Space>
                                        </Button>
                                    </Dropdown>
                                </Col>
                                <Col>
                                    <Dropdown
                                        overlay={
                                            <Menu
                                                onClick={({ key }) => setTypeFilter(key)}
                                                items={[
                                                    { key: 'All', label: 'All' },
                                                    { key: 'Daily', label: 'Daily' },
                                                    { key: 'Lifetime', label: 'Lifetime' },
                                                ]}
                                            />
                                        }
                                        trigger={['click']}
                                    >
                                        <Button
                                            style={{
                                                borderRadius: 8,
                                                background: theme === 'dark' ? 'rgba(24,144,255,0.06)' : '#e6f7ff',
                                                border: '1px solid #91d5ff',
                                                color: theme === 'dark' ? '#69c0ff' : '#1d39c4',
                                                fontWeight: 500,
                                                marginRight: '5px'
                                            }}
                                        >
                                            {typeFilter} <DownOutlined />
                                        </Button>
                                    </Dropdown>

                                </Col>
                                <Col xs={24} sm={24} md={4} lg={2} style={{ flex: "0.2 0 auto" }}>
                                    <Tooltip
                                        title={
                                            <div style={{ fontSize: '13px' }}>
                                                {fbCron.current !== '-' && <div>Fb status: {fbCron.current?.toLowerCase()}</div>}
                                                {revenueCron.current !== '-' && <div>Rev status: {revenueCron.current?.toLowerCase()}</div>}
                                                {(cronStatus.current !== '-' || accountStatus.current !== '-') && (
                                                    <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                                                        Cron status: {cronStatus.current?.toLowerCase()}
                                                    </Text>
                                                )}
                                                {accountStatus.current && <div>
                                                    Account:  <span
                                                        style={{
                                                            marginLeft: '3px',
                                                            color:
                                                                accountStatus.current === 'Active'
                                                                    ? '#5B8CFF'
                                                                    : accountStatus.current === 'Inactive'
                                                                        ? '#EC7117'
                                                                        : 'gray',
                                                            // fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {accountStatus.current}
                                                    </span>
                                                </div>}
                                            </div>
                                        }
                                        overlayInnerStyle={{
                                            backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                            color: theme === 'dark' ? '#fff' : '#000',
                                            border: '1px solid #ccc',
                                            borderRadius: 6,
                                            // fontWeight: 500,
                                        }}
                                    >

                                        <InfoCircleOutlined
                                            style={{
                                                fontSize: '18px',
                                                cursor: 'pointer',
                                                marginRight: '10px',
                                                color: "#5B8CFF",
                                            }}
                                            className="black-icon-info"
                                        />
                                    </Tooltip>
                                </Col>

                                {/* <Col>
                                            <Tooltip 
                                                title={ !toggleStatus ? "Turn on toggle to column re-arrangement" : "Turn off to stop column re-arrangement"} 
                                                mouseEnterDelay={0} // Tooltip appears after 1 second
                                            >
                                                <Switch checked={toggleStatus} onChange={() => handleChangeToggle()} style={{marginLeft:'10px', marginRight:'10px', backgroundColor: toggleStatus && "#5B8CFF" }}/>
                                            </Tooltip>
                                        </Col> */}
                                <Col xs={24} sm={24} md={4} lg={2} style={{ flex: '0.2 0 auto' }}>
                                    {/* <Tooltip title="Export to CSV"> */}
                                    <Button type="primary" style={{ backgroundColor: '#5B8CFF', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined className="black-icon" />} onClick={() => onBtExport(gridRef1, "Daily")} />
                                    {/* </Tooltip> */}
                                </Col>
                            </Row>
                            {dailyData.length > 0 ?
                                (
                                    <div
                                        className={`ag-theme-alpine ag-container ${gridThemeClass}`}
                                    >
                                        <div className='table-container'>
                                            <AgGridReact
                                                ref={gridRef1}
                                                className='custom-grid'
                                                rowHeight={30}
                                                // context={context}

                                                context={{
                                                    ...context,
                                                    adLevelCreatives,
                                                }}
                                                rowData={memorizedDailyData}
                                                useValueFormatterForExport={true}
                                                // immutableData={true}
                                                // getRowId={params => params.data.id}
                                                columnDefs={memorizedColumnDef1}
                                                onCellClicked={onCellClicked}
                                                groupSelectsChildren={true} // ✅ Selects all children when a group is selected
                                                suppressRowClickSelection={true} // ✅ Prevents selection on row click, only via checkbox
                                                rowSelection="multiple"
                                                pagination={true}
                                                paginationPageSize={200}
                                                paginationPageSizeSelector={[20, 40, 60, 80, 100, 150, 200]}
                                                groupDisplayType='multipleColumns'
                                                suppressAggFuncInHeader={true}
                                                groupSuppressBlankHeader={true}
                                                defaultColDef={defaultColDef}
                                                // groupIncludeFooter={true}
                                                // groupIncludeTotalFooter={true}
                                                autoGroupColumnDef={autoGroupColumnDef}
                                                onSelectionChanged={onSelectionChanged}
                                                onGridReady={(params) => {
                                                    gridRef1.current = params.api; // Store grid API
                                                    restoreGridState(gridRef1.current); // Restore state when grid is ready
                                                    onGridReady(params, 'grid2', gridRef1);
                                                    if (params.columnApi) {
                                                        params.columnApi.autoSizeAllColumns();
                                                    }
                                                }}
                                                gridOptions={{
                                                    ...gridOptions1,
                                                    ensureDomOrder: false,
                                                    enableCharts: true,
                                                    suppressRowClickSelection: true,
                                                    suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                    enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                                }}
                                                getMainMenuItems={getMainMenuItems}
                                                pinnedBottomRowData={dailyFixedFooter}

                                                // onRangeSelectionChanged={onRangeSelectionChanged} // ✅ Captures range selection
                                                onCellKeyDown={onCellKeyDown}
                                                getRowStyle={params => {
                                                    if (params.node.rowPinned) {
                                                        return {
                                                            // fontWeight: 'bold',
                                                            backgroundColor: theme === "dark" ? '#000' : '#fff', // Dark mode background should be dark, light mode should be light
                                                            color: theme === "dark" ? '#fff' : '#000',           // Text color should contrast with the background
                                                            height: '30px'
                                                        };
                                                    }

                                                    return null;
                                                }}
                                                getCellStyle={(params) => {
                                                    const isSelected = selectedCells.some(
                                                        (cell) => cell.rowIndex === params.node.rowIndex && cell.columns.includes(params.column.getId())
                                                    );

                                                    // ✅ Ensure first cell inside a group is highlighted
                                                    const isFirstSelected = firstSelectedCell &&
                                                        firstSelectedCell.rowIndex === params.node.rowIndex &&
                                                        firstSelectedCell.colId === params.column.getId();

                                                    return isSelected || isFirstSelected ? { backgroundColor: "#007bff", color: "#fff" } : {};
                                                }}
                                                onFilterChanged={(params) => {
                                                    const api = params.api;
                                                    const filteredData = [];
                                                    // api.forEachNodeAfterFilterAndSort((node) => {
                                                    //     if (!node.rowPinned) {
                                                    //         filteredData.push(node.data);
                                                    //     }
                                                    // });
                                                    const normalizedInput = inputValue.trim().toLowerCase();

                                                    api.forEachNodeAfterFilterAndSort((node) => {
                                                        // Check if node.data exists and has a valid campaignname
                                                        if (node.data && node.data.campaignname) {
                                                            const normalizedCampaign = node.data.campaignname.trim().toLowerCase();

                                                            // Apply both search and AG-Grid filters
                                                            if (
                                                                normalizedCampaign.startsWith(normalizedInput) ||
                                                                normalizedCampaign.includes(normalizedInput) ||
                                                                normalizedCampaign.endsWith(normalizedInput)
                                                            ) {
                                                                filteredData.push(node.data);
                                                            }
                                                        }
                                                    });
                                                    const totalWithTax = filteredData?.reduce((acc, curr) => {
                                                        const spend = Number(curr.spend) || 0;

                                                        const accountTax = taxDetails?.find(
                                                            item =>
                                                                String(item.accountNumber) ===
                                                                String(curr.accountNumber)
                                                        );

                                                        const taxRate =
                                                            parseFloat(
                                                                String(accountTax?.tax || "0").replace("%", "")
                                                            ) || 0;

                                                        return acc + spend + (spend * taxRate) / 100;
                                                    }, 0);

                                                    const updatedFooter = [
                                                        {
                                                            // [`${newtime}Date`]: 'Totals',
                                                            campaignName: 'Total',
                                                            spend: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend || 0), 0).toFixed(2)),
                                                            revenue: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.revenue || 0), 0).toFixed(2)),
                                                            profit: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.profit || 0), 0).toFixed(2)),
                                                            margin: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.revenue), 0) * 100).toFixed(2)),
                                                            rpc: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.rpc), 0) / filteredData.length).toFixed(2)),
                                                            cpl: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpl), 0) / filteredData.length).toFixed(2)),
                                                            ncpl: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.ncpl), 0) / filteredData.length).toFixed(2)),
                                                            fbleads: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbleads), 0).toFixed(2)),
                                                            conversions: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.conversions), 0).toFixed(2)),
                                                            fmargin: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0) * 100).toFixed(2)),
                                                            roi: parseFloat(((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.revenue), 0) - filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0)) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0) * 100).toFixed(2)),
                                                            cpc: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpc), 0) / filteredData.length).toFixed(2)),
                                                            cpclinkclicks: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpclinkclicks), 0) / filteredData.length).toFixed(2)),
                                                            fbclicks: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0).toFixed(2)),
                                                            fblinkclicks: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fblinkclicks), 0).toFixed(2)),
                                                            impressions: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0).toFixed(2)),
                                                            tq: parseFloat(
                                                                filteredData.reduce((acc, curr) => {
                                                                    const tqValue = Number(curr?.tq);
                                                                    return acc + (isNaN(tqValue) ? 0 : tqValue);
                                                                }, 0).toFixed(2)
                                                            ),
                                                            ctr: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0) * 100).toFixed(2)),
                                                            tax: Number(totalWithTax.toFixed(2)),
                                                        },
                                                    ];

                                                    setDailyFixedFooter(updatedFooter);
                                                }}
                                            />
                                        </div>

                                    </div>
                                ) :
                                <div
                                    className={`ag-theme-alpine ag-container ${gridThemeClass}`}
                                >
                                    <div className='table-container'>
                                        <AgGridReact
                                            ref={gridRef1}
                                            className='custom-grid'
                                            rowHeight={30}
                                            // context={context}
                                            context={{
                                                ...context,
                                                adLevelCreatives,
                                            }}
                                            rowData={[]}
                                            columnDefs={memorizedColumnDef1}
                                            onCellClicked={onCellClicked}
                                            groupSelectsChildren={true} // ✅ Selects all children when a group is selected
                                            suppressRowClickSelection={true} // ✅ Prevents selection on row click, only via checkbox
                                            rowSelection="multiple"
                                            pagination={true}
                                            paginationPageSize={200}
                                            paginationPageSizeSelector={[20, 40, 60, 80, 100, 150, 200]}
                                            groupDisplayType='multipleColumns'
                                            suppressAggFuncInHeader={true}
                                            groupSuppressBlankHeader={true}
                                            defaultColDef={defaultColDef}
                                            // groupIncludeFooter={true}
                                            // groupIncludeTotalFooter={true}
                                            autoGroupColumnDef={autoGroupColumnDef}
                                            onSelectionChanged={onSelectionChanged}
                                            onGridReady={(params) => {
                                                gridRef1.current = params.api; // Store grid API
                                                restoreGridState(gridRef1.current); // Restore state when grid is ready
                                                onGridReady(params, 'grid2', gridRef1);
                                                if (params.columnApi) {
                                                    params.columnApi.autoSizeAllColumns();
                                                }
                                            }}
                                            gridOptions={{
                                                ...gridOptions1,
                                                ensureDomOrder: false,
                                                enableCharts: true,
                                                suppressRowClickSelection: true,
                                                suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                            }}
                                            getMainMenuItems={getMainMenuItems}
                                            pinnedBottomRowData={dailyFixedFooter}

                                            // onRangeSelectionChanged={onRangeSelectionChanged} // ✅ Captures range selection
                                            onCellKeyDown={onCellKeyDown}
                                            getRowStyle={params => {
                                                if (params.node.rowPinned) {
                                                    return {
                                                        // fontWeight: 'bold',
                                                        backgroundColor: theme === "dark" ? '#000' : '#fff', // Dark mode background should be dark, light mode should be light
                                                        color: theme === "dark" ? '#fff' : '#000',           // Text color should contrast with the background
                                                        height: '30px'
                                                    };
                                                }

                                                return null;
                                            }}
                                            getCellStyle={(params) => {
                                                const isSelected = selectedCells.some(
                                                    (cell) => cell.rowIndex === params.node.rowIndex && cell.columns.includes(params.column.getId())
                                                );

                                                // ✅ Ensure first cell inside a group is highlighted
                                                const isFirstSelected = firstSelectedCell &&
                                                    firstSelectedCell.rowIndex === params.node.rowIndex &&
                                                    firstSelectedCell.colId === params.column.getId();

                                                return isSelected || isFirstSelected ? { backgroundColor: "#007bff", color: "#fff" } : {};
                                            }}
                                            onFilterChanged={(params) => {
                                                const api = params.api;
                                                const filteredData = [];
                                                // api.forEachNodeAfterFilterAndSort((node) => {
                                                //     if (!node.rowPinned) {
                                                //         filteredData.push(node.data);
                                                //     }
                                                // });
                                                const normalizedInput = inputValue.trim().toLowerCase();

                                                api.forEachNodeAfterFilterAndSort((node) => {
                                                    // Check if node.data exists and has a valid campaignname
                                                    if (node.data && node.data.campaignname) {
                                                        const normalizedCampaign = node.data.campaignname.trim().toLowerCase();

                                                        // Apply both search and AG-Grid filters
                                                        if (
                                                            normalizedCampaign.startsWith(normalizedInput) ||
                                                            normalizedCampaign.includes(normalizedInput) ||
                                                            normalizedCampaign.endsWith(normalizedInput)
                                                        ) {
                                                            filteredData.push(node.data);
                                                        }
                                                    }
                                                });
                                                const totalWithTax = filteredData?.reduce((acc, curr) => {
                                                    const spend = Number(curr.spend) || 0;

                                                    const accountTax = taxDetails?.find(
                                                        item =>
                                                            String(item.accountNumber) ===
                                                            String(curr.accountNumber)
                                                    );

                                                    const taxRate =
                                                        parseFloat(
                                                            String(accountTax?.tax || "0").replace("%", "")
                                                        ) || 0;

                                                    return acc + spend + (spend * taxRate) / 100;
                                                }, 0);

                                                const updatedFooter = [
                                                    {
                                                        // [`${newtime}Date`]: 'Totals',
                                                        campaignName: 'Total',
                                                        spend: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend || 0), 0).toFixed(2)),
                                                        revenue: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.revenue || 0), 0).toFixed(2)),
                                                        profit: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.profit || 0), 0).toFixed(2)),
                                                        margin: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.revenue), 0) * 100).toFixed(2)),
                                                        rpc: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.rpc), 0) / filteredData.length).toFixed(2)),
                                                        cpl: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpl), 0) / filteredData.length).toFixed(2)),
                                                        ncpl: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.ncpl), 0) / filteredData.length).toFixed(2)),
                                                        fbleads: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbleads), 0).toFixed(2)),
                                                        conversions: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.conversions), 0).toFixed(2)),
                                                        fmargin: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0) * 100).toFixed(2)),
                                                        roi: parseFloat(((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.revenue), 0) - filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0)) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0) * 100).toFixed(2)),
                                                        cpc: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpc), 0) / filteredData.length).toFixed(2)),
                                                        cpclinkclicks: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpclinkclicks), 0) / filteredData.length).toFixed(2)),
                                                        fbclicks: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0).toFixed(2)),
                                                        fblinkclicks: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fblinkclicks), 0).toFixed(2)),
                                                        impressions: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0).toFixed(2)),
                                                        tq: parseFloat(
                                                            filteredData.reduce((acc, curr) => {
                                                                const tqValue = Number(curr?.tq);
                                                                return acc + (isNaN(tqValue) ? 0 : tqValue);
                                                            }, 0).toFixed(2)
                                                        ),
                                                        ctr: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0) * 100).toFixed(2)),
                                                        tax: Number(totalWithTax.toFixed(2)),
                                                    },
                                                ];

                                                setDailyFixedFooter(updatedFooter);
                                            }}
                                        />
                                    </div>

                                </div>
                            }
                        </div>

                    ) : <div style={{ backgroundColor: theme === "dark" && "#333" }}>
                        {apiStatus === true ?
                            <Result
                                className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                // icon={<SmileOutlined />}
                                title={`API failed to fetch the data. Please click retry button to fetch the data`}
                                extra={<Button type="primary" onClick={handleReFetchData}>Retry</Button>}
                            /> :
                            (startDate !== endDate ? <Result
                                className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                icon={<SmileOutlined />}
                                title={`No DailyData for ${newaccount} from ${startDate} to ${endDate}`}
                            // extra={<Button type="primary">Next</Button>}
                            /> : <Result
                                className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                icon={<SmileOutlined />}
                                title={`No DailyData for ${newaccount} to ${startDate}`}
                            // extra={<Button type="primary">Next</Button>}
                            />)}
                    </div>}
            </div>
        </div>
    );
};

export default Daily;