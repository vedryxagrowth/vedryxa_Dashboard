"use client"
import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import moment from 'moment-timezone';
import React from 'react';
import { Input, Button, Row, Col, Typography, Result, Modal, message, Switch, Spin, Badge, Tooltip, Space, Menu, Dropdown } from 'antd';
import {
    NumberOutlined, GlobalOutlined, InfoCircleOutlined, DownloadOutlined, SmileOutlined, CopyOutlined, EditOutlined, MessageOutlined, PauseCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined, LinkOutlined, PushpinOutlined, FilterOutlined, DownOutlined, PlusOutlined, PictureOutlined, LikeOutlined,
    CommentOutlined,
    ShareAltOutlined,
} from '@ant-design/icons';
import { RxSwitch } from "react-icons/rx";
import 'antd/dist/reset.css';
import '../globals.css';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useTokenContext } from '../components/parent';

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
    "FB_Mnet": "Facebook_AD_Daily",
    "FB_MnetBing": "Facebook_AD_Daily",
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
    "FB_InuvoPrism": "Facebook_InuvoPrism",
    "FB_CodeFuel": "Facebook_AD_Daily",
    "Outbrain_TonicRsoc": "Outbrain_TonicRsoc"
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


const Daily = ({ context, functionCallForCommnets, functionCallForCampaigns, activeTab, startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, campaignComments, setCampaignComments, Camapignlevelstatus, setCamapignlevelstatus, changeRRefrst, debouncedHandleColumnMove, userdetails, refreshComments, refreshpage, getMainMenuItems, toggleStatus, handleChangeToggle, selectedCampaigns, selectedAdsets, accountsAccess, commentsMap, showAdLevel, removeSelectedAds }) => {
    const { theme, apiClient } = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

    const [dailyData, setdailyData] = useState([]);

    const newRowDataForFilter = useRef([]);

    const [campaignStatusFilter, setcampaignStatusLabel] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");

    const [insideInput, setInsideInput] = useState("");

    // console.log(insideInput);

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

    const fbCron = useRef('-');
    const revenueCron = useRef('-');
    const cronStatus = useRef('-');
    const accountStatus = useRef('-');

    // const memorizedColumnDef1 = useMemo(() => columnDefs.current, [columnDefs.current]);
    const memorizedColumnDef1 = useMemo(() => [...columnDefs.current.map(col => {

        if (col.field === "adsetid") {
            return {
                ...col,
                hide: true,
            };
        }

        if (col.field === "adsetname") {
            return {
                ...col,
                hide: true
            };
        }

        return col;
    })
    ], [columnDefs.current]);
    // const memorizedDailyData = useMemo(() => dailyData?.filter((each) => {
    //   const normalizedCampaign = (each?.adname || "").trim().toLowerCase();
    //   const normalizedInput = inputValue.trim().toLowerCase();
    //   return (
    //     normalizedCampaign.startsWith(normalizedInput) ||
    //     normalizedCampaign.includes(normalizedInput) ||
    //     normalizedCampaign.endsWith(normalizedInput)
    //   );
    // }
    // ), [dailyData, inputValue, theme]);
    const memorizedDailyData = useMemo(() => {
        let filtered = dailyData || [];

        const normalizedInput = inputValue.trim().toLowerCase();
        const normalizedInside = insideInput.trim().toLowerCase();

        // 1️⃣ FIRST FILTER → by inputValue (only adname)
        if (normalizedInput) {
            filtered = filtered.filter((each) => {
                const adname = (each?.adname || "").trim().toLowerCase();
                const accountNumber = (each?.accountNumber || "").toString().trim().toLowerCase();
                const campaignId = (each?.campaignid || "").toString().trim().toLowerCase();
                const adsetId = (each?.adsetid || "").toString().trim().toLowerCase();
                const adId = (each?.adid || "").toString().trim().toLowerCase();
                return (
                    adname.startsWith(normalizedInput) ||
                    adname.includes(normalizedInput) ||
                    adname.endsWith(normalizedInput) ||
                    accountNumber.includes(normalizedInput) ||
                    campaignId.includes(normalizedInput) ||
                    adsetId.includes(normalizedInput) ||
                    adId.includes(normalizedInput)
                );
            });
        }

        // 2️⃣ SECOND FILTER → by insideInput (all fields)
        if (normalizedInside) {
            filtered = filtered.filter((each) => {
                const adname = (each?.adname || "").trim().toLowerCase();
                const accountNumber = (each?.accountNumber || "").toString().trim().toLowerCase();
                const campaignId = (each?.campaignid || "").toString().trim().toLowerCase();
                const adsetId = (each?.adsetid || "").toString().trim().toLowerCase();
                const adId = (each?.adid || "").toString().trim().toLowerCase();

                return (
                    adname.includes(normalizedInside) ||
                    accountNumber.includes(normalizedInside) ||
                    campaignId.includes(normalizedInside) ||
                    adsetId.includes(normalizedInside) ||
                    adId.includes(normalizedInside)
                );
            });
        }

        return filtered;
    }, [dailyData, inputValue, insideInput]);
    const [selectedAd, setSelectedAd] = useState([]);
    const [leafCampaigns, setLeafCampaigns] = useState([])
    const [isBulkCommentModalVisible, setIsBulkCommentModalVisible] = useState(false);
    const [comment, setComment] = useState("");
    const [isBulkStatusModalVisible, setIsBulkStatusModalVisible] = useState(false);
    const [bulkStatusAction, setBulkStatusAction] = useState(null);
    const [confirmBulkLoading, setConfirmBulkLoading] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulkCategory, setBulkCategory] = useState("");
    const [campaignIds, setCampaignIds] = useState([]);
    const [adLevelCreatives, setAdLevelCreatives] = useState([]);


    useEffect(() => {
        // const groupedTQMap = new Map();
        // memorizedDailyData.forEach((row) => {
        //     if (!groupedTQMap.has(row.adname)) {
        //         groupedTQMap.set(row.adname, 0);
        //     }
        //     const currSum = groupedTQMap.get(row.adname);
        //     groupedTQMap.set(row.adname, currSum + (isNaN(row.tq) ? 0 : Number(row.tq)));
        // });

        // // ✅ Compute average of grouped TQ sums
        // const totalGroupedSum = Array.from(groupedTQMap.values()).reduce((acc, val) => acc + val, 0);
        // const tqAvgPerAdname = groupedTQMap.size > 0 ? parseFloat((totalGroupedSum / groupedTQMap.size).toFixed(2)) : 0;    

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
                    ctr: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)),
                    // tq: tqAvgPerAdname,
                    M_tq: (() => {
                        const nonZeroM = memorizedDailyData?.filter(d => parseFloat(d?.M_tq) > 0);
                        const totalM = nonZeroM?.reduce((acc, curr) => acc + parseFloat(curr?.M_tq || 0), 0);
                        return parseFloat((totalM / (nonZeroM?.length || 1)).toFixed(2));
                    })(),

                    // ✅ Added average of non-zero D_TQ
                    D_tq: (() => {
                        const nonZeroD = memorizedDailyData?.filter(d => parseFloat(d?.D_tq) > 0);
                        const totalD = nonZeroD?.reduce((acc, curr) => acc + parseFloat(curr?.D_tq || 0), 0);
                        return parseFloat((totalD / (nonZeroD?.length || 1)).toFixed(2));
                    })(),
                }
            ]
        );
    }, [memorizedDailyData]);

    // const onBtExport = (gridRef, text) => {
    //   const Details = {
    //     network: newRevenuePratner,
    //     account: newaccount,
    //     dateRange: `From ${startDate} to ${endDate}`,
    //     type: text,
    //     email: userdetails?.email,
    //     time: moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A")
    //   }
    //   if (gridRef.current) {
    //     gridRef.current.api.exportDataAsCsv({
    //       processCellCallback: (params) => {
    //         const node = params.node;
    //         if (node.group) {
    //           return null;
    //         }
    //         return params.value;
    //       },
    //       shouldRowBeSkipped: (params) => {
    //         return params.node.group;
    //       },
    //     });
    //   } else {
    //     console.error("Grid reference is null");
    //   }
    //   const updateDetails = async () => {
    //     await apiClient.post('/UserExportActivities/', { Details });
    //   }
    //   updateDetails();
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
        const adIdNameMap = {};

        gridRef.current.api.forEachLeafNode(node => {
            const d = node.data;
            if (d?.adid && d?.adname) {
                adIdNameMap[String(d.adid)] = d.adname;
            }
        });

        gridRef.current.api.exportDataAsCsv({
            processRowGroupCallback: (params) => {
                const key = String(params.node.key); // adid
                return adIdNameMap[key] || key;
            },
            processCellCallback: (params) => {
                const d = params.data;
                const colId = params.column.getColId();

                if (!d) return params.value;
                if (colId === "adid") {
                    return d.adname || params.value;
                }

                return params.value;
            }
        });

        apiClient.post('/UserExportActivities/', { Details }).catch(console.error);
    };

    useEffect(() => {
        if (removeSelectedAds === "Remove") {
            // if (gridRef.current) {
            //   gridRef.current.api.deselectAll();


            // }
            const api = gridRef1.current.api;
            api.deselectAll();
            api.forEachNode((node) => {
                node.selectThisNode(false);
            });

        }
    }, [removeSelectedAds]);
    const uniqueByAdId = (arr) => {
        const map = new Map();
        arr.forEach(obj => {
            if (!map.has(obj.adid)) {
                map.set(obj.adid, obj);
            }
        });
        return Array.from(map.values());
    };
    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);

        // Store selection persistently
        setSelectedAd(selectedData);
        showAdLevel(uniqueByAdId(selectedData));
        const leafCampaignsData = selectedNodes
            .filter(node => !node.group && node.data)
            .map(node => ({
                campaignid: node.data.campaignid,
                campaignname: node.data.campaignname,
                accountNumber: node.data.accountNumber,
                category: node.data.category,
                adsetid: node.data.adsetid,
                adsetname: node.data.adsetname,
                adid: node.data.adid,
                adName: node.data.adname,
                fbStatus: node.data.fbStatus,
                level: "ad",
            }))
            .filter(item => item.adid && item.adName);

        // ✅ Remove duplicates by campaignid + accountNumber
        const uniqueLeafCampaigns = Array.from(
            new Map(
                leafCampaignsData.map(item => [`${item.adid}_${item.accountNumber}`, item])
            ).values()
        );

        // ✅ Store clean, unique campaigns
        setLeafCampaigns(uniqueLeafCampaigns);
        // console.log("Selected unique Ads:", uniqueLeafCampaigns);
    };

    const handleBulkSmartPinAd = async (action) => {
        if (!leafCampaigns || leafCampaigns.length === 0) {
            message.warning("Select at least one ad");
            return;
        }

        // Convert adid → ad_id for backend
        const data = leafCampaigns.map(item => ({
            accountNumber: item.accountNumber,
            campaignid: item.campaignid,
            adsetid: item.adsetid,
            ad_id: item.adid,
            level: "ad",
            userPin: userdetails?.email,
            activity: {
                editType: "Pin",
                campaignid: item.campaignid,       // cents
                adsetid: item.adsetid,
                ad_id: item.adid,
                Account: item.accountNumber,    // ✅ update *this* row’s account
                campaignname: item.campaignname,
                adsetname: item.adsetname,
                adname: item.adName || item.adname,
                updatedBy: userdetails?.userName,
                updatedUserEmail: userdetails?.email,
                updateType: "Ad pin updated",
                updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                updateDetail: `From "${action === "pin" ? "unpin" : "pin"}" to "${action === "pin" ? "pin" : "unpin"}"`,
            }
        }));

        message.loading(
            `${action === "pin" ? "Pinning" : "Unpinning"} selected ads...`,
            0
        );

        const apiUrl =
            action === "pin"
                ? "http://localhost:4000/reports/bulkactions/pin"
                : "http://localhost:4000/reports/bulkactions/unpin";

        const res = await apiClient.post(apiUrl, { items: data });

        message.destroy();
        message.success(res.data.message);

        const timeStamp = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");

        setCampaignComments(prev => {
            const arr = Array.isArray(prev) ? [...prev] : [];

            data.forEach(item => {
                const idx = arr.findIndex(
                    i =>
                        String(i.campaignid) === String(item.campaignid) &&
                        String(i.Account) === String(item.accountNumber) &&
                        String(i.adsetid) === String(item.adsetid) &&
                        String(i.ad_id) === String(item.ad_id) &&   // 👈 MUST MATCH ad_id
                        i.level === "ad"
                );

                if (idx >= 0) {
                    arr[idx] = {
                        ...arr[idx],
                        pinned: action === "pin",
                        userPin: userdetails?.email,
                        editedPinTime: timeStamp
                    };
                } else {
                    arr.push({
                        campaignid: item.campaignid,
                        Account: item.accountNumber,
                        adsetid: item.adsetid,
                        ad_id: item.ad_id,
                        level: "ad",
                        pinned: action === "pin",
                        userPin: userdetails?.email,
                        editedPinTime: timeStamp
                    });

                }
            });

            return arr;
        });
    };

    // const handleBulkCommentSubmitAd = async () => {
    //   try {
    //     message.loading({ content: "Saving comments for ads...", key: "bulkCommentAd" });
    //     const items = leafCampaigns.map(item => ({
    //       accountNumber: item.accountNumber,
    //       campaignid: item.campaignid,
    //       adsetid: item.adsetid,
    //       ad_id: item.adid,
    //       comment,
    //       usercommit: userdetails?.email,
    //       level: "ad"
    //     }));

    //     const resp = await apiClient.post(
    //       "/Comments/upsertBulk",
    //       { items }
    //     );

    //     if (resp.status === 200 || resp.status === 201) {
    //       const timeStamp = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");

    //       setCampaignComments(prev => {
    //         const arr = [...prev];

    //         items.forEach(item => {
    //           const idx = arr.findIndex(
    //             i =>
    //               String(i.campaignid) === String(item.campaignid) &&
    //               String(i.Account) === String(item.accountNumber) &&
    //               String(i.adsetid) === String(item.adsetid) &&
    //               String(i.ad_id) === String(item.ad_id) &&
    //               i.level === "ad"
    //           );

    //           if (idx >= 0) {
    //             arr[idx] = {
    //               ...arr[idx],
    //               comment,
    //               usercommit: userdetails?.email,
    //               editedTime: timeStamp
    //             };
    //           } else {
    //             arr.push({
    //               ...item,
    //               editedTime: timeStamp
    //             });
    //           }
    //         });

    //         return arr;
    //       });

    //       message.success({
    //         content: `${items.length} ads updated`,
    //         key: "bulkCommentAd",
    //         duration: 3
    //       });

    //       setIsBulkCommentModalVisible(false);
    //     }

    //   } catch (err) {
    //     console.error(err);
    //     message.error("Bulk ad comment failed");
    //   }
    // };
    const handleBulkDeleteComments = async () => {
        try {
            message.loading({
                content: 'Deleting comments for selected campaigns...',
                key: 'bulkDelete'
            });


            const items = leafCampaigns.map(item => ({
                campaignid: item.campaignid,
                adsetid: item.adsetid,
                ad_id: item.adid,
                activity: {
                    editType: "Comment",
                    campaignid: item.campaignid,       // cents
                    adsetid: item.adsetid,
                    ad_id: item.adid,
                    Account: item.accountNumber,    // ✅ update *this* row’s account
                    campaignname: item.campaignname,
                    adsetname: item.adsetname,
                    adname: item.adName,
                    updatedBy: userdetails?.userName,
                    updatedUserEmail: userdetails?.email,
                    updateType: "Ad comment cleared",
                    updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                    // updateDetail: `From ${updatedPinStatus ? "unpin" : "pin"} to ${updatedPinStatus ? "pin" : "unpin"}`,
                }
            }));

            const body = {
                accountNumber: leafCampaigns?.[0]?.accountNumber,
                level: 'ad',
                items
            };

            const resp = await apiClient.post(
                'http://localhost:4000/reports/bulkactions/comments/delete',
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
                                String(i.ad_id) === String(item.adid) &&
                                String(i.Account) === String(item.accountNumber) &&
                                i.level === 'ad'
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
    const handleBulkCommentSubmitAd = async () => {
        try {
            message.loading({
                content: 'Saving comments for selected adsets...',
                key: 'bulkCommentAdset'
            });



            const items = leafCampaigns.map(item => ({
                accountNumber: item.accountNumber,
                campaignid: item.campaignid,
                adsetid: item.adsetid,
                ad_id: item.adid,
                comment,
                campaignname: item.adName,
                usercommit: userdetails?.email,
                level: "ad",
                activity: {
                    editType: "Comment",
                    campaignid: item.campaignid,       // cents
                    adsetid: item.adsetid,
                    ad_id: item.adid,
                    Account: item.accountNumber,    // ✅ update *this* row’s account
                    campaignname: item.campaignname,
                    adsetname: item.adsetname,
                    adname: item.adName,
                    updatedBy: userdetails?.userName,
                    updatedUserEmail: userdetails?.email,
                    updateType: "Ad comment cleared",
                    updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                    // updateDetail: `From ${updatedPinStatus ? "unpin" : "pin"} to ${updatedPinStatus ? "pin" : "unpin"}`,
                }
            }));

            const resp = await apiClient.post(
                'http://localhost:4000/reports/bulkactions/comments',
                { items, usercommit: userdetails?.email, }
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
                                String(i.ad_id) === String(item.adid) &&
                                i.level === 'ad'
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
                                ad_id: item.adid,
                                campaignname: item.adName,
                                level: 'ad',
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

    const handleBulkAdStatusSubmit = async () => {
        try {
            setConfirmBulkLoading(true);

            const token = localStorage.getItem("token");

            // const filteredItems = leafCampaigns
            //   .filter(item =>
            //     bulkStatusAction === "ACTIVE"
            //       ? item.fbStatus === "PAUSED"
            //       : item.fbStatus === "ACTIVE"
            //   )
            //   .map(item => ({
            //     status: bulkStatusAction,
            //     campaign_id: item.campaignid,
            //     adset_id: item.adsetid,
            //     ad_id: item.adid,
            //     accountNumber: String(item.accountNumber),
            //     name: item.adName,
            //     email: userdetails?.email
            //   }));

            // Build ad-level status lookup WITHOUT fallback
            // const adStatusMap = new Map(
            //     campaignComments
            //         .filter(item => item.level === "ad" && item.ad_id)
            //         .map(item => [
            //             String(item.ad_id),
            //             item.fbStatus ? String(item.fbStatus).toUpperCase() : "ACTIVE"
            //         ])
            // );

            // // Filter leaf ads that actually need status change
            // const filteredItems = leafCampaigns
            //     .filter(item => {
            //         const adId = String(item.adid);

            //         // Fallback ONLY if ad does not exist in campaignComments
            //         const currentStatus = adStatusMap.has(adId)
            //             ? adStatusMap.get(adId)
            //             : "ACTIVE";

            //         return bulkStatusAction === "ACTIVE"
            //             ? currentStatus === "PAUSED"
            //             : currentStatus === "ACTIVE";
            //     })
            //     .map(item => ({
            //         status: bulkStatusAction,
            //         campaign_id: item.campaignid,
            //         adset_id: item.adsetid,
            //         ad_id: item.adid,
            //         accountNumber: String(item.accountNumber),
            //         name: item.adName,
            //         email: userdetails?.email,
            //         activity: {
            //             editType: "Status",
            //             campaignid: item.campaignid,       // cents
            //             adsetid: item.adsetid,
            //             Account: String(item.accountNumber),    // ✅ update *this* row’s account
            //             campaignname: item.campaignname,
            //             ad_id: item.adid,
            //             adname: item.adName,
            //             adsetname: item.adsetname,
            //             updatedBy: userdetails?.userName,
            //             updatedUserEmail: userdetails?.email,
            //             updateType: "Ad status updated",
            //             updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
            //             updateDetail: `From ${bulkStatusAction === "ACTIVE" ? "Inactive" : "Active"} to ${bulkStatusAction === "ACTIVE" ? "Active" : "Inactive"}`,
            //         }
            //     }));


            // if (filteredItems.length === 0) {
            //     message.info("No ads need updating.");
            //     setIsBulkStatusModalVisible(false);
            //     setConfirmBulkLoading(false);
            //     return;
            // }

            // const resp = await apiClient.post(
            //     "/BulkAdStatusChangeManyWithHistory",
            //     { items: filteredItems },
            //     { headers: { Authorization: token } }
            // );

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
                    ad_id: item.adid,
                    accountNumber: String(item.accountNumber),
                    name: item.adsetname,
                    email: userdetails?.email,
                    activity: {
                        editType: "Status",
                        campaignid: item.campaignid,       // cents
                        adsetid: item.adsetid,
                        ad_id: item.adid,
                        Account: String(item.accountNumber),    // ✅ update *this* row’s account
                        campaignname: item.campaignname,
                        adsetname: item.adsetname,
                        adname: item.adname,
                        updatedBy: userdetails?.userName,
                        updatedUserEmail: userdetails?.email,
                        updateType: "Ad status updated",
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
                "http://localhost:4000/reports/bulkactions/outbrain/adstatus",
                { items: filteredItems },
                { headers: { Authorization: token } }
            );

            if (resp.status === 200 || resp.status === 201) {

                // const now = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");
                const updatedCampaignLevelStatus = (() => {
                    let arr = Array.isArray(Camapignlevelstatus)
                        ? [...Camapignlevelstatus]
                        : [];

                    filteredItems.forEach(update => {
                        const { campaign_id, adset_id, ad_id, accountNumber, status } = update;

                        arr = arr.map(item =>
                            String(item.campaign_id) === String(campaign_id) &&
                                String(item.accountNumber) === String(accountNumber)
                                ? {
                                    ...item,
                                    adsets: (item.adsets || []).map(adset =>
                                        String(adset.adset_id) === String(ad_id)
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

                // const updatedCampaignComments = (() => {
                //     const arr = Array.isArray(campaignComments)
                //         ? [...campaignComments]
                //         : [];

                //     filteredItems.forEach(update => {
                //         const { campaign_id, adset_id, ad_id, accountNumber, status } = update;

                //         const idx = arr.findIndex(i =>
                //             String(i.campaignid) === String(campaign_id) &&
                //             String(i.Account) === String(accountNumber) &&
                //             String(i.adsetid) === String(adset_id) &&
                //             String(i.ad_id) === String(ad_id) &&
                //             i.level === "ad"
                //         );

                //         if (idx >= 0) {
                //             arr[idx] = {
                //                 ...arr[idx],
                //                 fbStatus: status,
                //                 editedTime: now
                //             };
                //         } else {
                //             arr.push({
                //                 campaignid: campaign_id,
                //                 Account: accountNumber,
                //                 adsetid: adset_id,
                //                 ad_id,
                //                 level: "ad",
                //                 fbStatus: status,
                //                 comment: "",
                //                 usercommit: userdetails?.email,
                //                 editedTime: now
                //             });
                //         }
                //     });

                //     return arr;
                // })();

                // // 2️⃣ Update campaignComments state
                // setCampaignComments(updatedCampaignComments);

                // 3️⃣ Update rowData using the SAME computed data
                // if (campaignStatusFilter !== "All") {
                //   const adStatusMap = new Map(
                //     updatedCampaignComments
                //       .filter(item => item.level === "ad" && item.ad_id)
                //       .map(item => [
                //         String(item.ad_id),
                //         item.fbStatus
                //           ? String(item.fbStatus).toUpperCase()
                //           : "ACTIVE"
                //       ])
                //   );
                //   const newRowData = newRowDataForFilter.current;

                //   // Attach fbStatus to each row using adStatusMap
                //   const newRowDataWithFbStatus = newRowData.map(each => {
                //     const adKey = String(each.adid);

                //     return {
                //       ...each,
                //       fbStatus: adStatusMap.get(adKey) || "ACTIVE"
                //     };
                //   });

                //   // Final filter by selected status
                //   const filteredRowDataWithStatus = newRowDataWithFbStatus.filter(
                //     item =>
                //       item.fbStatus.toUpperCase() ===
                //       campaignStatusFilter?.toUpperCase()
                //   );

                //   setdailyData(filteredRowDataWithStatus);

                // }

                // 🔥 UPDATE UI — SAME AS SINGLE UPDATE
                // setCampaignComments(prev => {
                //   let arr = Array.isArray(prev) ? [...prev] : [];

                //   filteredItems.forEach(update => {
                //     const { campaign_id, adset_id, ad_id, accountNumber, status } = update;

                //     const idx = arr.findIndex(i =>
                //       String(i.campaignid) === String(campaign_id) &&
                //       String(i.Account) === String(accountNumber) &&
                //       String(i.adsetid) === String(adset_id) &&
                //       String(i.ad_id) === String(ad_id) &&
                //       i.level === "ad"
                //     );

                //     if (idx >= 0) {
                //       arr[idx] = {
                //         ...arr[idx],
                //         fbStatus: status,
                //         editedTime: now
                //       };
                //     } else {
                //       arr.push({
                //         campaignid: campaign_id,
                //         Account: accountNumber,
                //         adsetid: adset_id,
                //         ad_id: ad_id,
                //         level: "ad",
                //         fbStatus: status,
                //         comment: "",
                //         usercommit: userdetails?.email,
                //         editedTime: now
                //       });
                //     }
                //   });

                //   return arr;
                // });

                message.success(`${filteredItems.length} ad(s) updated.`);
            }

        } catch (err) {
            console.error(err);
            message.error("Bulk ad update failed");
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
    //   if (!bulkCategory.trim()) {
    //     message.warning("Enter category");
    //     return;
    //   }

    //   const token = localStorage.getItem("token");
    //   const items = leafCampaigns
    //     .filter(item => !item.category || item.category.trim() === "")
    //     .map(item => ({
    //       accountNumber: item.accountNumber,
    //       campaignid: item.campaignid,
    //       level: "campaign",
    //       campaignname: item.campaignname,
    //     }));

    //   if (items.length === 0) {
    //     message.info("All selected campaigns already have a category. Nothing to update.");
    //     setBulkOpen(false);
    //     return;
    //   }

    //   try {
    //     message.loading({ content: "Updating category...", key: "bulkCategory" });

    //     await apiClient.post(
    //       "/BulkUpdateCategory",
    //       { items, category: bulkCategory },
    //       { headers: { Authorization: token } }
    //     );
    //     setCampaignComments(prev => {
    //       const arr = [...prev];
    //       setLeafCampaigns(prev =>
    //         prev.map(item =>
    //           (!item.category || item.category.trim() === "")
    //             ? { ...item, category: bulkCategory }
    //             : item
    //         )
    //       )
    //       items.forEach(item => {
    //         const idx = arr.findIndex(
    //           i =>
    //             String(i.campaignid) === String(item.campaignid) &&
    //             String(i.Account) === String(item.accountNumber) &&
    //             i.level === "campaign"
    //         );

    //         if (idx >= 0) {
    //           if (arr[idx] && arr[idx].category) {
    //             arr[idx].category = arr[idx].category;
    //           } else {
    //             arr[idx].category = bulkCategory;
    //           }

    //         } else {
    //           arr.push({
    //             campaignid: item.campaignid,
    //             Account: item.accountNumber,
    //             level: "campaign",
    //             category: bulkCategory
    //           });
    //         }
    //       });

    //       return arr;
    //     });
    //     leafCampaigns.forEach(item => {
    //       const key = `${item.campaignid}_${item.accountNumber}_campaign`;
    //       commentsMap.set(key, { category: bulkCategory });
    //     });

    //     message.success({ content: "Category updated!", key: "bulkCategory" });

    //   } catch (err) {
    //     console.error(err);
    //     message.error("Failed to update category");
    //   }

    //   setBulkOpen(false);
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
                "http://localhost:4000/reports/bulkactions/category",
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
        headerName: 'Ad name',
        minWidth: 450,
        pinned: 'left',

        sortable: true,
        unSortIcon: true,
        headerClass: 'ag-center-header',
        valueFormatter: (params) => {
            // GROUP ROW
            if (params.node?.group) {
                const firstChild = params.node.childrenAfterGroup?.[0]?.data;
                return firstChild?.adname ?? params.node.key;
            }

            // LEAF ROW
            return params.value;
        },
        // filter: "agTextColumnFilter",
        // filterValueGetter: (params) => {
        //   if (params.node.group) {
        //     // Use the group key (campaign name)
        //     return params.node.key;
        //   }
        //   // For leaf rows, use the campaign_name or any field
        //   return params.data?.adname || '';
        // },

        // comparator: (campaignA, campaignB) => {
        //   if (!campaignA) return 1;
        //   if (!campaignB) return -1;

        //   const getPinStatusForCampaign = (campaignName) => {
        //     const relatedComment = campaignComments.find(c => c.campaignname === campaignName);
        //     return relatedComment ? relatedComment.pinned : false;
        //   };

        //   const isPinnedA = getPinStatusForCampaign(campaignA);
        //   const isPinnedB = getPinStatusForCampaign(campaignB);
        //   if (isPinnedA !== isPinnedB) return isPinnedA ? -1 : 1;

        //   return campaignA.localeCompare(campaignB);
        // },

        // comparator: (a, b, nodeA, nodeB) => {
        //   const pickPinned = (node) => {
        //     const d = node?.group && node.childrenAfterGroup?.length
        //       ? node.childrenAfterGroup[0]?.data
        //       : node?.data;
        //     if (!d) return false;
        //     if (typeof d.__adPinned === 'boolean') return d.__adPinned; // local cache
        //     return !!d.pinned; // initial fallback if your rowData has `pinned`
        //   };
        //   const pa = pickPinned(nodeA);
        //   const pb = pickPinned(nodeB);
        //   if (pa !== pb) return pa ? -1 : 1;
        //   return String(a || '').localeCompare(String(b || ''));
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
            const adidA = leafA.adid;
            const adidB = leafB.adid;
            const campaignidB = leafB.campaignid;
            const accountB = leafB.accountNumber;
            const adsetidB = leafB.adsetid;

            // find pinned record for A
            const recA = campaignComments.find(c =>
                String(c.Account) === String(accountA) &&
                String(c.campaignid) === String(campaignidA) &&
                String(c.adsetid) === String(adsetidA) &&
                String(c.ad_id) === String(adidA) &&
                c.level === "ad"
            );

            const recB = campaignComments.find(c =>
                String(c.Account) === String(accountB) &&
                String(c.campaignid) === String(campaignidB) &&
                String(c.adsetid) === String(adsetidB) &&
                String(c.ad_id) === String(adidB) &&
                c.level === "ad"
            );

            const pinnedA = recA?.pinned ?? false;
            const pinnedB = recB?.pinned ?? false;

            // 1️⃣ PINNED FIRST when sorting ASC
            if (pinnedA !== pinnedB) return pinnedA ? -1 : 1;

            // 2️⃣ fallback: alphabetical by group key
            return String(groupKeyA).localeCompare(String(groupKeyB));
        },
        // ✅ use AG Grid group renderer (like Adlevel.js)
        cellRenderer: "agGroupCellRenderer",
        cellRendererParams: {
            checkbox: true,
            suppressCount: false,
            innerRenderer: (params) => {
                if (params.node.footer) return 'Total';

                const leafData = params.node.group
                    ? params.node.allLeafChildren?.[0]?.data
                    : params.data;
                const rowCampaignId = leafData?.campaignid;
                const rowAdsetId = leafData?.adsetid;
                const rowAdId = leafData?.adid;
                const rowAccountNumber = leafData?.accountNumber;

                const firstColumnValue = params.node.allLeafChildren?.[0]?.data?.adname || ""; // group key (Ad name)
                const campaignName = params.node.allLeafChildren?.[0]?.data?.campaignname || "";
                const adsetName = params.node.allLeafChildren?.[0]?.data?.adsetname || "";
                const adName = params.node.allLeafChildren?.[0]?.data?.adname || "";

                let campaignid, adsetid, adid, rowAccount;

                if (params.node.group && Array.isArray(params.node.childrenAfterGroup) && params.node.childrenAfterGroup.length > 0) {
                    const firstChild = params.node.childrenAfterGroup[0]?.data;
                    if (firstChild) {
                        campaignid = firstChild.campaignid ?? null;
                        adsetid = firstChild.adsetid ?? null;
                        adid = firstChild.adid ?? null;
                        rowAccount = firstChild.accountNumber ?? null; // prefer row account if present
                    }
                } else if (params.data) {
                    campaignid = params.data.campaignid ?? null;
                    adsetid = params.data.adsetid ?? null;
                    adid = params.data.adid ?? null;
                    rowAccount = params.data.accountNumber ?? null;  // prefer row account if present
                } else {
                    console.error('Missing campaignid or adsetid for campaign:', campaignName);
                    // return (
                    //   <div style={{ color: 'red' }}>
                    //     Error: campaignid or adsetid missing for {campaignName}
                    //   </div>
                    // );
                }

                // prefer ad name for ad-level comment docs; fallback on campaign name
                const nameKeyForComments = adName || campaignName;

                // ✅ build accountNumbers for bulk endpoints
                // const accountsParam = rowAccount
                //   ? [String(rowAccount)]
                //   : (Array.isArray(newaccount) ? newaccount.map(String) : [String(newaccount)]);

                const authHeaders = { headers: { Authorization: localStorage.getItem("token") } };

                // ---- helpers aware of account + ad_id ----
                const getEditedUserAndTime = (cName, acc) =>
                    campaignComments.find(d => d.level === "ad" && d.campaignid === campaignid && d.adsetid === adsetid && d.ad_id === adid && d.Account === rowAccount) || null;

                const getPinEditedUserAndTime = (cName, acc) =>
                    campaignComments.find(d => d.level === "ad" && d.campaignid === campaignid && d.adsetid === adsetid && d.ad_id === adid && d.Account === rowAccount) || null;

                // const getStatusForCampaign = (cName, acc) => {
                //   const relatedStatus = campaignComments.find(c => c.campaignname === cName && c.Account === acc && (!adid || c.ad_id === adid));
                //   return relatedStatus !== undefined && relatedStatus?.status === true ? true : relatedStatus !== undefined ? false : null;
                // };
                const getStatusForCampaign = () => {
                    const relatedStatus = campaignComments.find(d => d.level === "ad" && d.campaignid === campaignid && d.adsetid === adsetid && d.ad_id === adid && d.Account === rowAccount);
                    return relatedStatus?.fbStatus
                };

                const getCommentForCampaign = (name, acc) => {
                    const c = campaignComments.find(d => d.level === "ad" && d.campaignid === campaignid && d.adsetid === adsetid && d.ad_id === adid && d.Account === rowAccount);
                    return c ? c.comment : null;
                };

                const getPinStatusForCampaignAcc = (name, acc) => {
                    const c = campaignComments.find(d => d.level === "ad" && d.campaignid === campaignid && d.adsetid === adsetid && d.ad_id === adid && d.Account === rowAccount);
                    return c ? !!c.pinned : false;
                };

                // const editUserANdTime = getEditedUserAndTime(nameKeyForComments, rowAccount || newaccount);
                // const editPinUserANdTime = getPinEditedUserAndTime(nameKeyForComments, rowAccount || newaccount);
                // const relatedStatus = getStatusForCampaign(nameKeyForComments, rowAccount || newaccount);
                // const relatedComment = getCommentForCampaign(nameKeyForComments, rowAccount || newaccount);
                const valueWithCount = `${firstColumnValue}`;

                const [tooltipText, setTooltipText] = React.useState("Click to Copy");
                const [isModalVisibles, setIsModalVisibles] = React.useState(false);

                const [isAdidModalVisibles, setIsAdidModalVisibles] = React.useState(false);
                const [selectedAdid, setSelectedAdid] = React.useState(null);
                const [switchStates, setSwitchStates] = React.useState({});
                const [nextChecked, setNextChecked] = React.useState(false);
                const [universalOject, setUniversalObject] = React.useState(null)
                const [confirmLoading, setConfirmLoading] = React.useState(false);
                const [selectedCampaignCreatives, setSelectedCampaignCreatives] = useState([]);
                const [creativeModalOpen, setCreativeModalOpen] = useState(false);

                React.useEffect(() => {
                    setUniversalObject(campaignComments.find(d => d.level === "ad" && d.campaignid === campaignid && d.adsetid === adsetid && d.ad_id === adid && d.Account === rowAccount));
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [campaignComments]);
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
                    const campaignForAccount = Camapignlevelstatus.find(obj =>
                        String(obj.campaign_id) === String(campaignid) &&
                        String(obj.accountNumber) === String(rowAccount)
                    );
                    const arrayOfAdsets = campaignForAccount?.adsets || [];
                    const matchedAdset = arrayOfAdsets.find(a => String(a.adset_id) === String(adid));
                    return matchedAdset ? matchedAdset.status === "ACTIVE" : false; // default ACTIVE
                });

                // const [comment, setComment] = React.useState(relatedComment || '');
                // const [pinned, setPinned] = React.useState(getPinStatusForCampaignAcc(nameKeyForComments, rowAccount || newaccount));

                //  const accKey = String(
                //        rowAccount ?? (Array.isArray(newaccount) ? newaccount[0] : newaccount) ?? ''
                //     );
                const accKey = String(rowAccount ?? (Array.isArray(newaccount) ? newaccount[0] : newaccount) ?? '');
                const accountsParam = [accKey]; // always a single normalized string for this row

                const editUserANdTime = getEditedUserAndTime(nameKeyForComments, accKey);
                const editPinUserANdTime = getPinEditedUserAndTime(nameKeyForComments, accKey);
                const relatedStatus = getStatusForCampaign();

                // helper: patch only the leaf data (no whole table refresh)
                const leafNode = params.node.group ? params.node.childrenAfterGroup?.[0] : params.node;
                const updateLeaf = (patch) => {
                    if (!leafNode?.data) return;
                    const nextData = { ...leafNode.data, ...patch };
                    if (leafNode.updateData) leafNode.updateData(nextData);
                    else params.api.applyTransaction({ update: [nextData] });
                };

                // per-ad stable key
                const statusKey = `${accKey}|${campaignid}|${adsetid}|${adid}`;

                // maps from context
                const statusMap = params.context?.adStatusOverridesRef?.current;   // "ACTIVE" | "PAUSED"
                const pinMap = params.context?.adPinOverridesRef?.current;      // boolean
                const commentMap = params.context?.adCommentOverridesRef?.current;  // { text, editedBy, editedAt }

                // local tick for targeted cell refresh
                const [tick, setTick] = React.useState(0);
                const refreshThisCell = () => {
                    setTick(t => t + 1);
                    params.api.refreshCells({ rowNodes: [params.node], columns: [params.column.getColId()], force: true });
                    params.api.refreshClientSideRowModel('sort');
                };

                // derive UI state from maps (fall back to server data)
                const commentOverride = commentMap?.get(statusKey);
                const relatedComment = (commentOverride?.text ?? getCommentForCampaign(nameKeyForComments, accKey)) || '';
                const hasComment = relatedComment.trim().length > 0;

                const [comment, setComment] = React.useState(relatedComment || '');
                React.useEffect(() => setComment(relatedComment || ''), [relatedComment]);

                const pinnedOverride = pinMap?.get(statusKey);
                const [pinned, setPinned] = React.useState(
                    typeof pinnedOverride === 'boolean'
                        ? pinnedOverride
                        : getPinStatusForCampaignAcc(nameKeyForComments, accKey)
                );

                // const [switchOn, setSwitchOn] = React.useState(() => {
                //     const fromMap = statusMap?.get(statusKey);
                //     if (fromMap === 'ACTIVE' || fromMap === 'PAUSED') return fromMap === 'ACTIVE';
                //     if (params.data?.__adStatus) return params.data.__adStatus === 'ACTIVE';
                //     const matched = campaignComments.find(it =>
                //         String(it.campaignid) === String(campaignid) &&
                //         String(it.Account) === String(rowAccount) &&
                //         Array.isArray(it.AdLevel) &&
                //         it.AdLevel.some(a => String(a.ad_id) === String(adid))
                //     );
                //     const adEntry = matched?.AdLevel?.find(a => String(a.ad_id) === String(adid));
                //     return adEntry ? adEntry.status === 'ACTIVE' : true;
                // });

                // apply cached overrides to the row on mount (so comparator sees them)
                React.useEffect(() => {
                    if (statusMap?.has(statusKey)) updateLeaf({ __adStatus: statusMap.get(statusKey) });
                    if (typeof pinnedOverride === 'boolean') updateLeaf({ __adPinned: pinnedOverride });
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                }, []);

                // ====== ACTION HANDLERS (all optimistic + local patch) ======

                const handlePauseOk = async () => {
                    // if (!selectedAdid) return;
                    const desired = nextChecked; // true => ACTIVE
                    setIsAdidModalVisibles(true);
                    setConfirmLoading(true);
                    try {
                        const payloadForActivity = {
                            editType: "Status",
                            campaignid: campaignid,       // cents
                            adsetid: adsetid,
                            Account: rowAccount,    // ✅ update *this* row’s account
                            campaignname: campaignName,
                            ad_id: adid,
                            adname: adName,
                            adsetname: adsetName,
                            updatedBy: userdetails?.userName,
                            updatedUserEmail: userdetails?.email,
                            updateType: "Ad status updated",
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                            updateDetail: `From ${desired ? "Inactive" : "Active"} to ${desired ? "Active" : "Inactive"}`,
                        }
                        const newResponse = await apiClient.post(
                            `http://localhost:4000/reports/singleactions/outbrain/adstatus`,
                            {
                                status: desired,
                                ad_id: adid,
                                name: adName,
                                accountNumber: rowAccount,
                                campaign_id: campaignid,
                                adset_id: adsetid,
                                email: userdetails?.email,
                                level: "ad",
                                activity: payloadForActivity
                            },
                            authHeaders
                        );

                        const newStatus = desired ? 'ACTIVE' : 'PAUSED';

                        if (newResponse.status === 200 || newResponse.status === 201) {
                            // setCampaignComments(prevStatus =>
                            //   prevStatus.map(item =>
                            //     String(item.campaignid) === String(campaignid) &&
                            //       String(item.Account) === String(rowAccount) &&
                            //       String(item.adsetid) === String(adsetid) &&
                            //       String(item.ad_id) === String(adid) &&
                            //       String(item.level) === "ad"
                            //       ? { ...item, fbStatus: newStatus }
                            //       : item
                            //   )
                            // );
                            setCamapignlevelstatus(prev =>
                                prev.map(item =>
                                    String(item.campaign_id) === String(campaignid) &&
                                        String(item.accountNumber) === String(rowAccount)
                                        ? {
                                            ...item,
                                            adsets: (item.adsets || []).map(adset =>
                                                String(adset.adset_id) === String(adid)
                                                    ? { ...adset, status: newStatus }
                                                    : adset
                                            )
                                        }
                                        : item
                                )
                            );
                            setSwitchOn(desired); // optimistic
                            setConfirmLoading(false);

                            // const updatedCampaignComments = (() => {
                            //     const arr = Array.isArray(campaignComments)
                            //         ? [...campaignComments]
                            //         : [];

                            //     const match = arr.findIndex(
                            //         i =>
                            //             String(i?.campaignid) === String(campaignid) &&
                            //             String(i?.Account) === String(rowAccount) &&
                            //             String(i?.adsetid) === String(adsetid) &&
                            //             String(i?.ad_id) === String(adid) &&
                            //             String(i?.level) === "ad"
                            //     );

                            //     const fbStatus = desired ? "ACTIVE" : "PAUSED";

                            //     if (match >= 0) {
                            //         arr[match] = {
                            //             ...arr[match],
                            //             fbStatus
                            //         };
                            //     } else {
                            //         arr.push({
                            //             campaignid,
                            //             Account: rowAccount,
                            //             adsetid,
                            //             ad_id: adid,
                            //             level: "ad",
                            //             comment: "",
                            //             usercommit: "",
                            //             fbStatus
                            //         });
                            //     }

                            //     return arr;
                            // })();
                            // setCampaignComments(updatedCampaignComments);
                            // if (campaignStatusFilter !== "All") {
                            //   const adStatusMap = new Map(
                            //     updatedCampaignComments
                            //       .filter(item => item.level === "ad" && item.ad_id)
                            //       .map(item => [
                            //         String(item.ad_id),
                            //         item.fbStatus
                            //           ? String(item.fbStatus).toUpperCase()
                            //           : "ACTIVE"
                            //       ])
                            //   );
                            //   const newRowData = newRowDataForFilter.current;

                            //   // Attach fbStatus to each row using adStatusMap
                            //   const newRowDataWithFbStatus = newRowData.map(each => {
                            //     const adKey = String(each.adid);

                            //     return {
                            //       ...each,
                            //       fbStatus: adStatusMap.get(adKey) || "ACTIVE"
                            //     };
                            //   });

                            //   // Final filter by selected status
                            //   const filteredRowDataWithStatus = newRowDataWithFbStatus.filter(
                            //     item =>
                            //       item.fbStatus.toUpperCase() ===
                            //       campaignStatusFilter?.toUpperCase()
                            //   );

                            //   setdailyData(filteredRowDataWithStatus);

                            // }
                            // setCampaignComments(prev => {
                            //   const arr = Array.isArray(prev) ? [...prev] : [];

                            //   const match = arr.findIndex(
                            //     i =>
                            //       String(i?.campaignid) === String(campaignid) &&
                            //       String(i?.Account) === String(rowAccount) &&
                            //       String(i?.adsetid) === String(adsetid) &&
                            //       String(i?.ad_id) === String(adid) &&
                            //       String(i?.level) === 'ad'
                            //   );

                            //   if (match >= 0) {
                            //     arr[match] = { ...arr[match], fbStatus: desired ? 'ACTIVE' : 'PAUSED' };
                            //   } else {
                            //     arr.push({
                            //       campaignid,
                            //       Account: rowAccount,
                            //       adsetid,
                            //       ad_id: adid,
                            //       level: 'ad',
                            //       comment: "",
                            //       usercommit: "",
                            //       fbStatus: desired ? 'ACTIVE' : 'PAUSED',
                            //     });
                            //   }

                            //   console.log('Updated campaignComments:', arr[match]);

                            //   return arr;
                            // });
                        }
                        setIsAdidModalVisibles(false);

                        // statusMap?.set(statusKey, newStatus);      // persist across tabs
                        // updateLeaf({ __adStatus: newStatus });     // patch only this row
                        // message.success(`Ad ${newStatus.toLowerCase()}`);
                        // refreshThisCell();
                    } catch (e) {
                        setConfirmLoading(false);
                        setSwitchOn(prev => !prev);                // revert UI
                        message.error('Failed to update ad status');
                    } finally {
                        setIsAdidModalVisibles(false);
                        setSelectedAdid(null);
                    }
                };
                const handleSmartAdStatusClick = async () => {
                    const desired = nextChecked ? "ACTIVE" : "PAUSED";


                    if (!leafCampaigns || leafCampaigns.length <= 1) {
                        handlePauseOk();
                        return;
                    }


                    const listToUpdate = leafCampaigns.filter(item =>
                        String(item.fbStatus).toUpperCase() !== desired
                    );

                    if (listToUpdate.length === 0) {
                        message.info("All selected ads already have this status.");
                        return;
                    }

                    try {
                        message.loading({
                            content: desired === "ACTIVE"
                                ? "Activating selected ads..."
                                : "Pausing selected ads...",
                            key: "bulkAdStatus"
                        });

                        const results = await Promise.allSettled(
                            listToUpdate.map(item =>
                                apiClient.post("/NewAdStatusChange", {
                                    status: desired,
                                    name: item.adName,
                                    campaign_id: item.campaignid,
                                    adset_id: item.adsetid,
                                    ad_id: item.adid,
                                    accountNumber: item.accountNumber,
                                    email: userdetails?.email
                                })
                            )
                        );

                        const successCount = results.filter(r => r.status === "fulfilled").length;
                        const failedCount = results.length - successCount;

                        const now = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

                        // 🌟 Update UI state for all ads
                        setCampaignComments(prev => {
                            const arr = [...prev];

                            listToUpdate.forEach(update => {
                                const idx = arr.findIndex(
                                    i =>
                                        String(i.campaignid) === String(update.campaignid) &&
                                        String(i.Account) === String(update.accountNumber) &&
                                        String(i.adsetid) === String(update.adsetid) &&
                                        String(i.ad_id) === String(update.adid) &&
                                        String(i.level) === "ad"
                                );

                                if (idx >= 0) {
                                    arr[idx] = {
                                        ...arr[idx],
                                        fbStatus: desired,
                                        statusUpdatedAt: now,
                                        statusUpdatedBy: userdetails?.email
                                    };
                                } else {
                                    arr.push({
                                        campaignid: update.campaignid,
                                        Account: update.accountNumber,
                                        adsetid: update.adsetid,
                                        ad_id: update.adid,
                                        level: "ad",
                                        fbStatus: desired,
                                        statusUpdatedAt: now,
                                        statusUpdatedBy: userdetails?.email
                                    });
                                }
                            });

                            return arr;
                        });

                        message.success({
                            content: `${successCount} ads updated, ${failedCount} failed`,
                            key: "bulkAdStatus",
                            duration: 3
                        });

                        setIsAdidModalVisibles(false);

                    } catch (err) {
                        console.error("Bulk Ad Status Error:", err);
                        message.error("Failed to update selected ads.");
                    }
                };

                const handlePinClick = async (_campName, campid, asetid, current) => {
                    const next = !current;
                    setPinned(next); // optimistic
                    const payloadForActivity = {
                        editType: "Pin",
                        campaignid: campaignid,       // cents
                        adsetid: adsetid,
                        ad_id: adid,
                        Account: rowAccount,    // ✅ update *this* row’s account
                        campaignname: campaignName,
                        adsetname: adsetName,
                        adname: adName,
                        updatedBy: userdetails?.userName,
                        updatedUserEmail: userdetails?.email,
                        updateType: "Ad pin updated",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: `From "${next ? "unpin" : "pin"}" to "${next ? "pin" : "unpin"}"`,
                    }
                    try {
                        if (next) {
                            const newResponse = await apiClient.post('http://localhost:4000/reports/singleactions/pin', {
                                accountNumber: rowAccount,
                                campaignname: campaignName,
                                campaignid,
                                adsetid,
                                ad_id: adid,
                                userPin: userdetails?.email,
                                comment: comment || '',
                                level: "ad",
                                activity: payloadForActivity
                            }, authHeaders);
                            if (newResponse.status === 200 || newResponse.status === 201) {
                                setCampaignComments(prev => {
                                    const arr = Array.isArray(prev) ? [...prev] : [];
                                    const timeStamp = moment().tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm A');

                                    const match = arr.findIndex(
                                        i =>
                                            String(i?.campaignid) === String(campaignid) &&
                                            String(i?.Account) === String(rowAccount) &&
                                            String(i?.adsetid) === String(adsetid) &&
                                            String(i?.ad_id) === String(adid) &&
                                            String(i?.level) === 'ad'
                                    );

                                    if (match >= 0) {
                                        arr[match] = { ...arr[match], pinned: true, userPin: userdetails?.email, editedPinTime: timeStamp };
                                    } else {
                                        arr.push({
                                            campaignid,
                                            Account: rowAccount,
                                            adsetid,
                                            ad_id: adid,
                                            level: 'ad',
                                            pinned: true,
                                            userPin: userdetails?.email,
                                            editedPinTime: timeStamp
                                        });
                                    }

                                    return arr;
                                });
                            }
                        } else {
                            const newResponse = await apiClient.post('http://localhost:4000/reports/singleactions/unpin', {
                                accountNumber: rowAccount,
                                campaignname: campaignName,
                                campaignid,
                                adsetid,
                                ad_id: adid,
                                userPin: userdetails?.email,
                                comment: comment || '',
                                level: "ad",
                                activity: payloadForActivity
                            }, authHeaders);
                            if (newResponse.status === 200 || newResponse.status === 201) {
                                setCampaignComments(prev => {
                                    const arr = Array.isArray(prev) ? [...prev] : [];
                                    const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

                                    const match = arr.findIndex(
                                        i =>
                                            String(i?.campaignid) === String(campaignid) &&
                                            String(i?.Account) === String(rowAccount) &&
                                            String(i?.adsetid) === String(adsetid) &&
                                            String(i?.ad_id) === String(adid) &&
                                            String(i?.level) === 'ad'
                                    );

                                    if (match >= 0) {
                                        arr[match] = { ...arr[match], pinned: false, userPin: userdetails?.email, editedPinTime: timeStamp };
                                    } else {
                                        arr.push({
                                            campaignid,
                                            Account: rowAccount,
                                            adsetid,
                                            ad_id: adid,
                                            level: 'ad',
                                            pinned: false,
                                            userPin: userdetails?.email,
                                            editedPinTime: timeStamp
                                        });
                                    }

                                    return arr;
                                });
                            }
                        }

                        // pinMap?.set(statusKey, next);          // persist
                        // updateLeaf({ __adPinned: next });      // patch only this row
                        message.success(next ? 'Pinned' : 'Unpinned');
                        // refreshThisCell();
                    } catch {
                        setPinned(!next);                      // revert UI
                        message.error('Error while updating pin status');
                    }
                };
                const handleSmartAdPinClick = async (_campName, campid, asetid, current) => {
                    const next = !current;

                    // If multiple ads selected
                    if (leafCampaigns && leafCampaigns.length > 1) {
                        try {
                            message.loading({
                                content: next ? "Pinning selected ads..." : "Unpinning selected ads...",
                                key: "adPin"
                            });

                            const endpoint = next ? "/NewPinBulk" : "/NewUnpinBulk";

                            // Make bulk API calls
                            const results = await Promise.allSettled(
                                leafCampaigns.map(item =>
                                    apiClient.post(
                                        endpoint,
                                        {
                                            accountNumber: item.accountNumber,
                                            campaignname: item.adName,
                                            campaignid: item.campaignid,
                                            adsetid: item.adsetid,
                                            ad_id: item.adid,
                                            userPin: userdetails?.email,
                                            level: "ad"
                                        },
                                        authHeaders
                                    )
                                )
                            );

                            const successCount = results.filter(
                                r => r.status === "fulfilled" && (r.value?.status === 200 || r.value?.status === 201)
                            ).length;

                            const failureCount = results.length - successCount;

                            // Update UI (same structure as your single pin logic)
                            setCampaignComments(prev => {
                                const list = Array.isArray(prev) ? [...prev] : [];
                                const ts = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");

                                leafCampaigns.forEach(item => {
                                    const index = list.findIndex(
                                        i =>
                                            String(i?.campaignid) === String(item.campaignid) &&
                                            String(i?.Account) === String(item.accountNumber) &&
                                            String(i?.adsetid) === String(item.adsetid) &&
                                            String(i?.ad_id) === String(item.adid) &&
                                            String(i?.level) === "ad"
                                    );

                                    if (index >= 0) {
                                        list[index] = {
                                            ...list[index],
                                            pinned: next,
                                            userPin: userdetails?.email,
                                            editedPinTime: ts
                                        };
                                    } else {
                                        list.push({
                                            campaignid: item.campaignid,
                                            Account: item.accountNumber,
                                            adsetid: item.adsetid,
                                            ad_id: item.adid,
                                            level: "ad",
                                            pinned: next,
                                            userPin: userdetails?.email,
                                            editedPinTime: ts
                                        });
                                    }
                                });

                                return list;
                            });

                            message.success({
                                content: `${successCount} ad(s) ${next ? "pinned" : "unpinned"}, ${failureCount} failed`,
                                key: "adPin",
                                duration: 3
                            });

                        } catch (error) {
                            console.error("❌ Ad Bulk Pin Error:", error);
                            message.error("Failed to update selected ads.");
                        }

                        return; // Important: Stop here
                    }

                    // If only 1 ad selected → use your existing single logic
                    handlePinClick(_campName, campid, asetid, current);
                };

                const handleOks = async () => {
                    try {
                        const payloadForActivity = {
                            editType: "Comment",
                            campaignid: campaignid,       // cents
                            adsetid: adsetid,
                            ad_id: adid,
                            Account: rowAccount,    // ✅ update *this* row’s account
                            campaignname: campaignName,
                            adsetname: adsetName,
                            adname: adName,
                            updatedBy: userdetails?.userName,
                            updatedUserEmail: userdetails?.email,
                            updateType: "Ad comment updated",
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                            // updateDetail: `From ${updatedPinStatus ? "unpin" : "pin"} to ${updatedPinStatus ? "pin" : "unpin"}`,
                        }
                        const newResponse = await apiClient.post(
                            'http://localhost:4000/reports/singleactions/comments',
                            {
                                accountNumber: rowAccount,
                                campaignname: adName,
                                campaignid,
                                adsetid,
                                ad_id: adid,
                                comment: comment,
                                usercommit: userdetails?.email,
                                level: "ad",
                                activity: payloadForActivity
                            },
                            authHeaders
                        );

                        if (newResponse.status === 200 || newResponse.status === 201) {
                            setCampaignComments(prev => {
                                const arr = Array.isArray(prev) ? [...prev] : [];
                                const timeStamp = moment().tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm A');

                                const match = arr.findIndex(
                                    i =>
                                        String(i?.campaignid) === String(campaignid) &&
                                        String(i?.Account) === String(rowAccount) &&
                                        String(i?.adsetid) === String(adsetid) &&
                                        String(i?.ad_id) === String(adid) &&
                                        String(i?.level) === 'ad'
                                );

                                if (match >= 0) {
                                    arr[match] = { ...arr[match], comment: comment, usercommit: userdetails?.email, editedTime: timeStamp };
                                } else {
                                    arr.push({
                                        campaignid,
                                        Account: rowAccount,
                                        adsetid,
                                        ad_id: adid,
                                        level: 'ad',
                                        comment: comment,
                                        usercommit: userdetails?.email,
                                        editedTime: timeStamp
                                    });
                                }

                                return arr;
                            });
                        }

                        // commentMap?.set(statusKey, {
                        //   text: comment,
                        //   editedBy: userdetails?.email,
                        //   editedAt: moment().format('DD-MM-YYYY hh:mm:ss A'),
                        // });
                        // message.success(relatedComment ? 'Comment updated' : 'Comment added');
                        message.success(relatedComment ? "Comment updated successfully!" : "New comment added successfully!");
                        setIsModalVisibles(false);
                        // refreshThisCell();
                    } catch {
                        message.error('Error while submitting the comment');
                    }
                };
                const handleSmartAdCommentSubmit = async () => {
                    // MULTIPLE ads selected
                    if (leafCampaigns && leafCampaigns.length > 1) {
                        try {
                            message.loading({
                                content: 'Saving comments for selected ads...',
                                key: 'bulkAdComment'
                            });

                            // Build bulk items list
                            const items = leafCampaigns.map(item => ({
                                accountNumber: item.accountNumber,
                                campaignname: item.adName,
                                campaignid: item.campaignid,
                                adsetid: item.adsetid,
                                ad_id: item.adid,
                                comment,
                                usercommit: userdetails?.email,
                                level: "ad",
                            }));

                            // console.log("Sending AD items:", items);

                            // Call bulk API
                            const resp = await apiClient.post(
                                '/Comments/upsertBulk',
                                { items, usercommit: userdetails?.email }
                            );

                            if (resp.status === 200 || resp.status === 201) {
                                // Update UI state instantly
                                setCampaignComments(prev => {
                                    const arr = Array.isArray(prev) ? [...prev] : [];
                                    const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

                                    leafCampaigns.forEach(item => {
                                        const match = arr.findIndex(
                                            i =>
                                                String(i?.campaignid) === String(item.campaignid) &&
                                                String(i?.Account) === String(item.accountNumber) &&
                                                String(i?.adsetid) === String(item.adsetid) &&
                                                String(i?.ad_id) === String(item.adid) &&
                                                String(i?.level) === 'ad'
                                        );

                                        if (match >= 0) {
                                            arr[match] = {
                                                ...arr[match],
                                                comment,
                                                usercommit: userdetails?.email,
                                                editedTime: timeStamp
                                            };
                                        } else {
                                            arr.push({
                                                campaignid: item.campaignid,
                                                Account: item.accountNumber,
                                                adsetid: item.adsetid,
                                                ad_id: item.adid,
                                                level: 'ad',
                                                comment,
                                                usercommit: userdetails?.email,
                                                editedTime: timeStamp,
                                            });
                                        }
                                    });

                                    return arr;
                                });

                                message.success({
                                    content: `${leafCampaigns.length} ad comment(s) saved successfully`,
                                    key: 'bulkAdComment',
                                    duration: 3,
                                });

                                setIsModalVisibles(false);
                            }
                        } catch (err) {
                            console.error(" Bulk Ad Comment Error:", err);
                            message.error("Error while saving comments for selected ads.");
                        }
                        return;
                    }

                    // SINGLE ad → fallback
                    handleOks();
                };

                const handleDelete = async () => {
                    try {
                        const payloadForActivity = {
                            editType: "Comment",
                            campaignid: campaignid,       // cents
                            adsetid: adsetid,
                            ad_id: adid,
                            Account: rowAccount,    // ✅ update *this* row’s account
                            campaignname: campaignName,
                            adsetname: adsetName,
                            adname: adName,
                            updatedBy: userdetails?.userName,
                            updatedUserEmail: userdetails?.email,
                            updateType: "Ad comment updated",
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                            // updateDetail: `From ${updatedPinStatus ? "unpin" : "pin"} to ${updatedPinStatus ? "pin" : "unpin"}`,
                        }
                        const newResponse = await apiClient.post('http://localhost:4000/reports/singleactions/comments/delete', {
                            accountNumber: rowAccount,
                            campaignname: adName,
                            campaignid,
                            adsetid,
                            ad_id: adid,
                            // comment: comment,
                            usercommit: userdetails?.email,
                            level: "ad",
                            activity: payloadForActivity
                        }, authHeaders);
                        if (newResponse.status === 200 || newResponse.status === 201) {
                            setCampaignComments(prev => {
                                const arr = Array.isArray(prev) ? [...prev] : [];
                                const timeStamp = moment().tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm A');

                                const match = arr.findIndex(
                                    i =>
                                        String(i?.campaignid) === String(campaignid) &&
                                        String(i?.Account) === String(rowAccount) &&
                                        String(i?.adsetid) === String(adsetid) &&
                                        String(i?.ad_id) === String(adid) &&
                                        String(i?.level) === 'ad'
                                );

                                if (match >= 0) {
                                    arr[match] = { ...arr[match], comment: "", usercommit: userdetails?.email, editedTime: timeStamp };
                                }
                                // else {
                                //   arr.push({
                                //     campaignid,
                                //     Account: rowAccount,
                                //     adsetid,
                                //     ad_id: adid,
                                //     level: 'ad',
                                //     comment: comment,
                                //     usercommit: userdetails?.email,
                                //     editedTime: timeStamp
                                //   });
                                // }

                                return arr;
                            });
                            setComment('');
                            message.success('Comment deleted');
                            setIsModalVisibles(false);
                        }
                        //   commentMap?.delete(statusKey);
                        // tombstone override so UI doesn't fall back to stale server comment
                        // commentMap?.set(statusKey, {
                        //   text: '',
                        //   editedBy: userdetails?.email,
                        //   editedAt: moment().format('DD-MM-YYYY hh:mm:ss A'),
                        //   deleted: true,
                        // });

                        // refreshThisCell();
                    } catch {
                        message.error('Failed to delete the comment');
                    }
                };

                // init switch state from comments (assume ACTIVE if none)
                // React.useEffect(() => {
                //   if (!adid) return;
                //   const matchedComment = campaignComments.find(
                //     (item) =>
                //       item.campaignid === campaignid &&
                //       Array.isArray(item.AdLevel) &&
                //       item.AdLevel.some(ad => ad.ad_id === adid)
                //   );
                //   const adEntry = matchedComment?.AdLevel?.find(ad => ad.ad_id === adid);
                //   const isActive = adEntry?.status === "ACTIVE";

                //   setSwitchStates(prev => ({
                //     ...prev,
                //     [adid]: matchedComment && adEntry ? isActive : true
                //   }));
                // }, [campaignComments, campaignid, adsetid, adid]);

                const handlePauseClick = (aid, checked) => {
                    setSelectedAdid(aid);
                    setNextChecked(checked);
                    setIsAdidModalVisibles(true);
                };

                // ✅ bulk /adStatusChange (accounts array)
                // const handlePauseOk = async () => {
                //   if (!selectedAdid) return;

                //   setSwitchStates(prev => ({ ...prev, [selectedAdid]: nextChecked }));

                //   try {
                //     const response = await apiClient.post(
                //       `/BulkAdStatusChange`,
                //       {
                //         status: nextChecked ? "ACTIVE" : "PAUSED",
                //         ad_id: selectedAdid,
                //         name: campaignName,
                //         accountNumbers: accountsParam,
                //         campaign_id: campaignid,
                //         adset_id: adsetid,
                //         email: userdetails?.email,
                //       },
                //       authHeaders
                //     );

                //     if (response.status === 200 || response.status === 201) {
                //       refreshComments(rowAccount || newaccount);
                //       functionCallForCommnets(rowAccount || newaccount);
                //     } else {
                //       console.warn(" Backend returned unexpected status:", response.status);
                //     }
                //   } catch (error) {
                //     console.error(" API call to /adStatusChange failed:", error?.response?.data || error.message);
                //   }

                //   setIsAdidModalVisibles(false);
                //   setSelectedAdid(null);
                // };

                const handlePauseCancel = () => {
                    setIsAdidModalVisibles(false);
                    setSelectedAdid(null);
                };

                const copyToClipboard = () => {
                    navigator.clipboard.writeText(firstColumnValue)
                        .then(() => {
                            setTooltipText("Copied!");
                            setTimeout(() => setTooltipText("Click to Copy"), 2000);
                        })
                        .catch(() => console.error('Failed to copy to clipboard'));
                };

                const handleEditClick = () => setIsModalVisibles(true);

                // ✅ bulk upsert comment (per-ad scope)
                const upsertCommentBulk = async ({ text }) => {
                    await apiClient.post(
                        '/Comments/upsert',
                        {
                            accountNumber: rowAccount,
                            campaignname: nameKeyForComments,
                            campaignid,
                            adsetid,
                            ad_id: adid,
                            comment: text,
                            usercommit: userdetails?.email,
                            level: "ad"
                        },
                        authHeaders
                    );
                };

                // const handleDelete = async () => {
                //   try {
                //     const response = await apiClient.post(
                //       '/Comments/bulk-delete',
                //       {
                //         accountNumbers: accountsParam,
                //         campaignname: nameKeyForComments,
                //         campaignid,
                //         adsetid,
                //         ad_id: adid,                   // per-ad scope
                //       },
                //       authHeaders
                //     );

                //     if (response.status === 200 || response.status === 201) {
                //       refreshComments(rowAccount || newaccount);
                //       message.success('Comment deleted successfully!');
                //       setIsModalVisibles(false);
                //     } else {
                //       message.error('Failed to delete the comment. Please try again.');
                //     }
                //   } catch (error) {
                //     console.error('Error deleting the comment:', error);
                //     message.error('Failed to delete the comment. Please try again.');
                //   }
                // };

                // const handleOks = async () => {
                //   try {
                //     await upsertCommentBulk({ text: comment });
                //     refreshComments(rowAccount || newaccount);
                //     message.success(relatedComment ? "Comment updated successfully!" : "New comment added successfully!");
                //     setIsModalVisibles(false);
                //   } catch (error) {
                //     console.error('Error while submitting comment:', error);
                //     message.error("Error while submitting the comment.");
                //   }
                // };

                const handleCancels = () => setIsModalVisibles(false);

                const CustomTooltipContent = ({ editedTime, usercommit }) => (
                    <div style={{ padding: '5px', borderRadius: '5px' }}>
                        <p style={{ margin: 0, color: theme === 'dark' ? "#fff" : "#000" }}>{usercommit}</p>
                        <p style={{ margin: 0, color: theme === 'dark' ? "#fff" : "#000" }}>{editedTime}</p>
                    </div>
                );

                // ✅ bulk Pin/Unpin (per-ad scope)
                // const handlePinClick = async (campName, campid, asetid, currentPinStatus) => {
                //   const updatedPinStatus = !currentPinStatus;

                //   try {
                //     if (updatedPinStatus) {
                //       const resp = await apiClient.post(
                //         '/PinBulk',
                //         {
                //           accountNumbers: accountsParam,
                //           campaignname: nameKeyForComments, // pin doc under the same name used for comments
                //           campaignid: campid,
                //           adsetid: asetid,
                //           ad_id: adid,                 // per-ad scope
                //           userPin: userdetails?.email,
                //           comment: comment || ''
                //         },
                //         authHeaders
                //       );
                //       if (resp.status === 200 || resp.status === 201) {
                //         refreshComments(rowAccount || newaccount);
                //       }
                //       message.success("Campaign pinned!");
                //     } else {
                //       const resp = await apiClient.post(
                //         '/UnpinBulk',
                //         {
                //           accountNumbers: accountsParam,
                //           campaignname: nameKeyForComments,
                //           campaignid: campid,
                //           adsetid: asetid,
                //           ad_id: adid                  // per-ad scope
                //         },
                //         authHeaders
                //       );
                //       if (resp.status === 200 || resp.status === 201) {
                //         refreshComments(rowAccount || newaccount);
                //       }
                //       message.success("Campaign unpinned!");
                //     }

                //     setPinned(updatedPinStatus);
                //   } catch (error) {
                //     console.error('Error toggling pin status:', error);
                //     message.error('Error while updating pin status.');
                //   }
                // };

                const PinIcon = ({ campaignName, campaignid, adsetid, pinned, universalOject }) => {
                    return (
                        <Tooltip
                            title={pinned ? (
                                <CustomTooltipContent
                                    editedTime={universalOject?.editedPinTime}
                                    usercommit={universalOject?.userPin}
                                />
                            ) : null
                            }
                            overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                // fontWeight: 500,
                            }}
                        >
                            <button
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                }}
                            >
                                {pinned ? "📌" : "📍"}
                            </button>
                        </Tooltip>
                    );
                };

                const adLevelCreatives = params.context?.adLevelCreatives || [];

                const matchedAd =
                    adLevelCreatives
                        .find(
                            c =>
                                String(c.campaignId) === String(rowCampaignId) &&
                                String(c.accountNumber) === String(rowAccountNumber)
                        )
                        ?.adsets
                        ?.find(
                            a => String(a.adsetId) === String(rowAdsetId)
                        )
                        ?.ads
                        ?.find(
                            ad => String(ad.adId) === String(rowAdId)
                        ) || null;

                const hasCreative = !!matchedAd;
                const CreativeMedia = ({
                    url,
                    filetype,
                    small = false,
                    circle = false
                }) => {
                    if (!url) return null;

                    const isVideo = filetype === "video";

                    const baseStyle = small
                        ? {
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 4,
                            border: "1px solid #ccc",
                            cursor: "pointer",
                        }
                        : {
                            width: "100%",
                            maxHeight: "280px",
                            display: "block",
                            objectFit: "contain",
                        };

                    if (circle) {
                        return (
                            <div
                                style={{
                                    width: 35,
                                    height: 35,
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                }}
                            >
                                {isVideo ? (
                                    <video
                                        src={url}
                                        muted
                                        autoPlay
                                        loop
                                        playsInline
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={url}
                                        alt="page"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                )}
                            </div>
                        );
                    }

                    return isVideo ? (
                        <video
                            src={url}
                            style={baseStyle}
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
                            style={baseStyle}
                        />
                    );
                };

                const CreativeTooltip = () => {
                    if (!adLevelCreatives.length) {
                        return (
                            <div style={{ color: theme === "dark" ? "#e4e6eb" : "#050505" }}>
                                Loading creatives…
                            </div>
                        );
                    }

                    if (!matchedAd) {
                        return (
                            <div style={{ color: theme === "dark" ? "#e4e6eb" : "#050505" }}>
                                No creative for this ad
                            </div>
                        );
                    }

                    return (
                        // <img
                        //   src={matchedAd.image}
                        //   alt={matchedAd.headline || "Creative"}
                        //   onClick={(e) => {
                        //     e.stopPropagation();
                        //     setSelectedCampaignCreatives([matchedAd])
                        //     setCreativeModalOpen(true);
                        //   }}
                        //   style={{
                        //     width: 60,
                        //     height: 60,
                        //     objectFit: "cover",
                        //     borderRadius: 4,
                        //     border: "1px solid #ccc",
                        //     cursor: "pointer",
                        //   }}
                        // />
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCampaignCreatives([matchedAd]);
                                setCreativeModalOpen(true);
                            }}
                        >
                            <CreativeMedia
                                url={matchedAd.image}
                                filetype={matchedAd.filetype}
                                small
                            />
                        </div>
                    );
                };

                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Switch
                            //   checked={!!switchStates[adid]}
                            //   onClick={(checked) => handlePauseClick(adid, checked)}
                            // checked={universalOject?.fbStatus ? universalOject?.fbStatus === "ACTIVE" : true}
                            checked={switchOn}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(checked, e) => { e?.stopPropagation?.(); handlePauseClick(adid, checked); }}
                            size="small"
                            //   style={{ backgroundColor: switchStates[adid] ? '#91C25F' : '#d9d9d9' }}
                            // style={{ backgroundColor: (universalOject?.fbStatus ? universalOject?.fbStatus === "ACTIVE" : true) ? '#91C25F' : '#d9d9d9' }}
                            style={{
                                backgroundColor: switchOn ? '#91C25F' : '#d9d9d9',
                            }}
                        />
                        <Modal
                            title="Confirm Action"
                            open={isAdidModalVisibles}
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
                                <p>Are you sure you want to turn {nextChecked ? "ON" : "OFF"} this ad?</p>
                                <p>Ad ID: {selectedAdid}</p>
                                <p>Ad Name: {adName}</p>
                            </div>
                        </Modal>

                        <PinIcon
                            campaignName={campaignName}
                            campaignid={campaignid}
                            adsetid={adsetid}
                            pinned={pinned}
                            universalOject={universalOject}
                        />

                        {hasComment ? (
                            <Tooltip
                                title={
                                    <div>
                                        <div>{universalOject?.comment}</div>
                                        <div>{universalOject?.editedTime}</div>
                                        <div>{universalOject?.usercommit}</div>
                                    </div>
                                }
                                overlayInnerStyle={{
                                    backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    border: '1px solid #ccc',
                                    borderRadius: 6,
                                }}
                            >
                                <MessageOutlined
                                    className={theme === "dark" ? "black-icon-comment" : 'Message'}
                                    style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px', color: '#4CAF50' }}
                                    onClick={handleEditClick}
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
                                padding: 8,
                            }}
                        >
                            <PictureOutlined
                                className={
                                    theme === "dark"
                                        ? hasCreative
                                            ? "black-icon-creatives"
                                            : "black-icon-creatives1"
                                        : ""
                                }
                                style={{
                                    cursor: hasCreative ? "pointer" : "not-allowed",
                                    color: hasCreative ? "#1890ff" : "#aaa",
                                    fontSize: 12,
                                    marginRight: '5px',
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
                                maxHeight: "87vh",
                            }}
                            style={{ top: 12 }}
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
                                            <CreativeMedia
                                                url={selectedCreative.image}
                                                filetype={selectedCreative.filetype}
                                                circle
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
                                                    <div style={{ marginTop: "10px" }}>
                                                        {idx === 0 && adLevelCreatives.length > 0 && (
                                                            <EditOutlined
                                                                style={{ cursor: "pointer", marginLeft: 8 }}
                                                                onClick={() => {
                                                                    const campaign = adLevelCreatives[0];

                                                                    const href = `/Campaigns?campaignId=${rowCampaignId}&account=${rowAccountNumber}&network=${newRevenuePratner}`;
                                                                    window.open(href, "_blank", "noopener,noreferrer");
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 8,
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
                                                    marginBottom: 2,
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
                                                            background: "#91C25F",
                                                            color: "#000",
                                                            borderRadius: 18,
                                                            fontSize: 10,
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
                                            <LikeOutlined style={{ marginRight: 6, fontSize: 12 }} />
                                            Like
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                            <CommentOutlined style={{ marginRight: 6, fontSize: 12 }} />
                                            Comment
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                            <ShareAltOutlined style={{ marginRight: 6, fontSize: 12 }} />
                                            Share
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Modal>
                        <LinkOutlined
                            onClick={() => {
                                const url = `/DailyAndCampaignHistory/AdHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${rowAccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
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
                            }}
                        >
                            <span>{valueWithCount}</span>
                        </Tooltip>

                        <Modal
                            title={firstColumnValue}
                            visible={isModalVisibles}
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            onOk={handleOks}
                            onCancel={handleCancels}
                            footer={[
                                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                    <div style={{ display: 'flex', flexDirection: "column" }}>
                                        <span key="info" style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                                            Last Edited Time:
                                        </span>
                                        <span key="info1" style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                                            {/* {editUserANdTime ? moment(editUserANdTime?.editedTime, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A") : ""} */}
                                            {universalOject?.editedTime || ""}
                                        </span>
                                    </div>
                                    <div>
                                        <Button
                                            key="delete"
                                            type="danger"
                                            onClick={handleDelete}
                                            style={{ marginRight: 'auto', border: "1px solid #e3e3da" }}
                                        >
                                            Delete
                                        </Button>
                                        <Button key="cancel" onClick={handleCancels} style={{ marginLeft: "4px" }}>
                                            Cancel
                                        </Button>
                                        <Button key="ok" onClick={handleOks} style={{ marginLeft: "4px", backgroundColor: "#91C25F" }}>
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
        },

        processCellForClipboard: (params) => {
            if (params.node.group) {
                if (!params.node.parent || !params.node.parent.childrenAfterGroup) {
                    return params.node.key;
                }
                return params.node.rowIndex === params.node.parent.childrenAfterGroup[0]?.rowIndex
                    ? params.node.key
                    : "";
            }
            return params.value;
        }
    };

    const adStatusMap = useMemo(() => {
        const map = new Map();

        campaignComments.forEach(doc => {
            if (!doc?.campaignid) return;

            const processAdset = (adset) => {
                if (!adset?.adset_id) return;

                const adLevelList = Array.isArray(doc.AdLevel)
                    ? doc.AdLevel
                    : doc.AdLevel && typeof doc.AdLevel === 'object'
                        ? [doc.AdLevel]
                        : [];

                adLevelList.forEach(ad => {
                    if (!ad?.ad_id || ad.adset_id !== adset.adset_id) return;
                    const key = `${doc.campaignid}_${ad.adset_id}_${ad.ad_id}`;
                    map.set(key, (ad.status || '').toUpperCase());
                });
            };

            if (Array.isArray(doc.AdsetLevel)) {
                doc.AdsetLevel.forEach(processAdset);
            } else if (doc.AdsetLevel && typeof doc.AdsetLevel === 'object') {
                processAdset(doc.AdsetLevel);
            }
        });

        return map;
    }, [campaignComments]);


    const getAdStatus = (campaignId, adsetId, adId) => {
        const key = `${campaignId}_${adsetId}_${adId}`;
        return adStatusMap.get(key); // returns "ACTIVE" | "PAUSED" | undefined
    };

    const functionCall2 = async () => {
        try {
            setLoading1(true);
            const api = newRevenuePratner === "FB_DomainActive" ? "Daily/CampaignName" : "Daily";
            const adsets = selectedAdsets.length > 0
                ? [...new Set(selectedAdsets.map(adset => adset.adsetid))]
                : [];
            const campaigns = selectedCampaigns.length > 0
                ? [...new Set(selectedCampaigns.map(campaign => campaign.campaignid))]
                : [];
            // console.log(adsets, "adsets");
            const collectionName = newRevenuePratner === "FB_DomainActive" ? "Facebook_DActive_Names" : newtworkCollections[newRevenuePratner];
            // const fetchData = await apiClient.get(`/${api}?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=${newtworkCollections[newRevenuePratner]}`);
            // const fetchData = await apiClient.post(`/AdLevel?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&status=Daily&network=Facebook_Mnet_AD`, { adsetids : adsets, campaignids : campaigns });

            // ✅ multi-account param (array of strings)
            const accountsParam = Array.isArray(newaccount)
                ? newaccount.map(String)
                : [String(newaccount)];
            let networkCollection;
            switch (newRevenuePratner) {
                case "FB_Mnet":
                    networkCollection = "Facebook_AD_Daily";
                    break;
                case "FB_MnetBing":
                    networkCollection = "Facebook_AD_Daily";
                    break;
                case "FB_CodeFuel":
                    networkCollection = "Facebook_AD_Daily";
                    break;
                case "Outbrain_TonicRsoc":
                    networkCollection = "Outbrain_TonicRsoc";
                    break;
                default:
                    networkCollection = "Facebook_Mnet_AD";
                    break;
            }

            // ✅ call the new multi-account endpoint
            const fetchData = await apiClient.post(
                newRevenuePratner === "FB_Mnet" || newRevenuePratner === "FB_CodeFuel" || newRevenuePratner === "FB_MnetBing" ? `/AdLevelAccountsNew` : "/AdLevelAccounts",
                {
                    dateStart: startDate,
                    dateEnd: endDate,
                    accountNumbers: accountsParam,
                    timezone: newtime,
                    status: 'Daily',                  // "Daily" | "Live"
                    // network: newRevenuePratner === "FB_Mnet" || newRevenuePratner === "FB_CodeFuel" || newRevenuePratner === "FB_MnetBing" ? "Facebook_AD_Daily" : "Facebook_Mnet_AD",        // keep your original value
                    network: networkCollection,
                    adsetids: adsets,
                    campaignids: campaigns
                }
            );
            const mainData = fetchData.data;
            // console.log("MainData:", mainData);

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

            timezone.current = mainData.length > 0 ? mainData[0].accountTimezone : "";

            let deviceTqMap = new Map();

            // Organize data by ad_id + date
            if (newRevenuePratner === "FB_TonicRsoc") {
                mainData.forEach(item => {
                    const key = `${item.ad_id}_${item[selectTimezone[newtime]]}_${item.keyword}`;
                    if (!deviceTqMap.has(key)) {
                        deviceTqMap.set(key, {});
                    }
                    // if(newRevenuePratner === "FB_Mnet"){
                    const entry = deviceTqMap.get(key);
                    // if (item.device === "Mobile" ) entry.M_tq = item.tq;
                    // if (item.device === "Desktop" ) entry.D_tq = item.tq;
                    deviceTqMap.set(key, { ...entry, ...item });
                    // }
                });
            } else {
                mainData.forEach(item => {
                    const key = `${item.ad_id}_${item[selectTimezone[newtime]]}`;
                    if (!deviceTqMap.has(key)) {
                        deviceTqMap.set(key, {});
                    }
                    // if(newRevenuePratner === "FB_Mnet"){
                    const entry = deviceTqMap.get(key);
                    if (item.device === "Mobile") entry.M_tq = item.tq;
                    if (item.device === "Desktop") entry.D_tq = item.tq;
                    deviceTqMap.set(key, { ...entry, ...item });
                    // }
                });
            }


            const mergedData = Array.from(deviceTqMap.values()).map(entry => {
                return {
                    ...entry,
                    M_tq: entry.M_tq !== undefined ? entry.M_tq : 0,
                    D_tq: entry.D_tq !== undefined ? entry.D_tq : 0,
                };
            });

            // console.log(mergedData);

            // 

            function groupByAccountNumber(data, specifiedDateKey) {
                return data?.reduce((acc, obj) => {
                    const accountKey = obj.accountNumber;
                    const dateKey = obj[`${specifiedDateKey}Date`]; // dynamically access the specified date field

                    // Create a combined key for grouping by both accountNumber and dynamically passed date field
                    const key = `${accountKey}_${dateKey}`;

                    // Find if the combined key already exists in the accumulator array
                    let entry = acc.find(item => item.key === key);

                    if (!entry) {
                        // If not found, create a new entry for this date
                        acc.push({
                            // date: dateKey,
                            accountNumber: obj.accountNumber,
                            specifiedDate: obj.specifiedDate,
                            spend: obj.spend ? parseFloat(obj.spend) : 0,
                            estimated_revenue: obj.estimated_revenue ? parseFloat(obj.estimated_revenue) : 0,
                            fbLeads: obj.fbLeads ? parseInt(obj.fbLeads) : 0,
                            conversions: obj.conversions ? parseInt(obj.conversions) : 0,
                            revenuePartner: obj.revenuePartner,
                            mediaBuyerName: obj.MediaBuyerName,
                            holder: obj.Holder,
                        });
                    } else {
                        // If found, sum the respective fields
                        entry.spend += obj.spend !== null && obj.spend !== undefined ? parseFloat(obj.spend) : 0;
                        entry.estimated_revenue += obj.estimated_revenue !== null && obj.estimated_revenue !== undefined ? parseFloat(obj.estimated_revenue) : 0;
                        entry.fbLeads += obj.fbLeads !== null && obj.fbLeads !== undefined ? parseInt(obj.fbLeads) : 0;
                        entry.conversions += obj.conversions !== null && obj.conversions !== undefined ? parseInt(obj.conversions) : 0;
                    }

                    return acc;
                }, []).map(dateEntry => {
                    // Calculate profit after grouping
                    dateEntry.profit = dateEntry.estimated_revenue - dateEntry.spend;
                    return dateEntry;
                });
            }




            // let keywordKey = "";

            // mainData.forEach(item => {
            //     const date = item[selectTimezone[newtime]];
            //     const adId = item.ad_id;

            //     if (item.revenuePartner === "Tonic_Rsoc") {
            //         keywordKey =
            //             item.keyword && item.keyword.trim() !== "" && item.keyword !== "no"
            //                 ? item.keyword.trim()
            //                 : "no";  // ⬅️ group null/empty as "no"
            //     }            

            //     const key = item.revenuePartner === "Tonic_Rsoc"
            //     ? `${adId}_${date}_${keywordKey}`
            //     : item.revenuePartner === "MEDIA_DOT_NET"
            //     ? `${adId}_${date}_${item.device}`
            //     : `${adId}_${date}`;

            //     const entry = deviceTqMap.get(key) || {
            //         spend: 0,
            //         estimated_revenue: 0,
            //         fbLeads: 0,
            //         fbClicks: 0,
            //         fbLinkClicks: 0,
            //         conversions: 0,
            //         impressions: 0,
            //         ad_clicks: 0,
            //         cpcSum: 0,
            //         tqSum: 0,
            //         count: 0,
            //         M_tq: 0,
            //         D_tq: 0,
            //         ...item
            //     };

            //     // Device-specific tq
            //     if (item.revenuePartner === "MEDIA_DOT_NET") {
            //         if (item.device === "Mobile") entry.M_tq = item.tq;
            //         if (item.device === "Desktop") entry.D_tq = item.tq;
            //     }

            //     // Aggregate
            //     entry.spend += parseFloat(item.spend || 0);
            //     entry.estimated_revenue += parseFloat(item.estimated_revenue || 0);
            //     entry.fbLeads += parseInt(item.fbLeads || 0);
            //     entry.fbClicks += parseInt(item.fbClicks || 0);
            //     entry.fbLinkClicks += parseInt(item.fbLinkClicks || 0);
            //     entry.conversions += parseInt(item.conversions || 0);
            //     entry.impressions += parseInt(item.impressions || 0);
            //     entry.ad_clicks += parseInt(item.ad_clicks || 0);
            //     entry.cpcSum += parseFloat(item.cpc || 0);
            //     entry.tqSum += parseFloat(item.tq || 0);
            //     entry.count += 1;

            //     deviceTqMap.set(key, entry);
            // });

            // const mergedData = Array.from(deviceTqMap.values()).map(entry => ({
            //     ...entry,
            //     M_tq: entry.M_tq || 0,
            //     D_tq: entry.D_tq || 0,
            //     spend: entry.spend.toFixed(2),
            //     estimated_revenue: entry.estimated_revenue.toFixed(2),
            //     cpc: entry.count ? parseFloat((entry.cpcSum / entry.count).toFixed(2)) : 0,
            //     tq: entry.count ? parseFloat((entry.tqSum / entry.count).toFixed(2)) : 0
            // }));


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

            const filteredData = mergedData && mergedData.length > 0 ?
                mergedData.map((eachData) => {
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
                    const getFbStatusKey = campaignComments.find(ad => ad.campaignid === eachData.campaign_id && ad.Account === eachData.accountNumber && ad.adsetid === eachData.adset_id && ad.ad_id === eachData.ad_id && ad.level === 'ad');
                    // console.log(eachData.campaign_name, "campaign_name");
                    return (
                        {
                            // ✅ include accountNumber so actions (pin/comment/status) can be per-account
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
                            conversions: parseInt(conversions),
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
                            adsetid: eachData.ad_id,
                            timezone: 'UTC',
                            adid: eachData.ad_id,
                            adname: eachData.adName,
                            actions: '...',
                            from: "",
                            profitloss: "",
                            M_tq: parseFloat(eachData.M_tq).toFixed(2),
                            D_tq: parseFloat(eachData.D_tq).toFixed(2),
                            fbCron: eachData.fbCron,
                            revenueCron: eachData.revenueCron,
                            cronStatus: eachData.cronStatus,
                            accountStatus: eachData.accountStatus,
                            keyword: eachData.keyword || '',
                            category: category?.category || "",
                            from: campaign_date?.start ? campaign_date?.start : "",
                            to: campaign_date?.end ? campaign_date?.end : "",
                            fbStatus: getFbStatusKey?.fbStatus ?? "ACTIVE",
                        }
                    )
                }) : null;

            // console.log("returnedData:", filteredData);

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


            const fullData = filteredData?.length > 0 ? [...filteredData] : [];

            let newFilterData;
            if (campaignStatusFilter !== "All") {
                newFilterData = fullData.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
            }
            else {
                newFilterData = fullData;
            }

            // setRowData(newFilterData);
            newRowDataForFilter.current = fullData;

            // const filteredByStatus =
            //   !campaignStatusFilter || campaignStatusFilter.toUpperCase() === 'ALL'
            //     ? fullData
            //     : fullData.filter(item => {
            //       const raw = getAdStatus(item.campaignid, item.adsetid, item.adid);
            //       const status = (raw || 'ACTIVE').toUpperCase();
            //       return status === campaignStatusFilter.toUpperCase();
            //     });

            setdailyData(newFilterData); // or setAdLevelData if you use a different state

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
                        ctr: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)),
                        M_tq: (function () {
                            const nonZero = newFilterData.filter(d => parseFloat(d.M_tq) > 0);
                            const total = nonZero.reduce((acc, d) => acc + parseFloat(d.M_tq), 0);
                            return (total / nonZero.length || 0).toFixed(2);
                        })(),
                        D_tq: (function () {
                            const nonZero = newFilterData.filter(d => parseFloat(d.D_tq) > 0);
                            const total = nonZero.reduce((acc, d) => acc + parseFloat(d.D_tq), 0);
                            return (total / nonZero.length || 0).toFixed(2);
                        })(),
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
            //             ctr: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)),
            //             M_tq: (function() {
            //                 const nonZero = fullData.filter(d => parseFloat(d.M_tq) > 0);
            //                 const total = nonZero.reduce((acc, d) => acc + parseFloat(d.M_tq), 0);
            //                 return (total / nonZero.length || 0).toFixed(2);
            //               })(),
            //               D_tq: (function() {
            //                 const nonZero = fullData.filter(d => parseFloat(d.D_tq) > 0);
            //                 const total = nonZero.reduce((acc, d) => acc + parseFloat(d.D_tq), 0);
            //                 return (total / nonZero.length || 0).toFixed(2);
            //               })(),    
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
            // console.log(error);
            // if(error.response.status === 500){
            //     apiStatus.current = true;
            // }
            // console.log(error);
            setApiStatus(true);
            setLoading1(false);
        }
    }
    // useEffect(() => {
    //     console.log(campaignIds, "campaignIds updated");
    // }, [campaignIds]);
    //   useEffect(() => {
    //     if (!campaignIds || Object.keys(campaignIds).length === 0) return;

    //     const fetchCreatives = async () => {
    //       const token = localStorage.getItem("token");
    //       try {
    //         const creativesData = await sendCreativesRequest(
    //           campaignIds,
    //           token
    //         );

    //         console.log('Final creatives data:', creativesData);
    //         setAdLevelCreatives(creativesData)

    //       } catch (err) {
    //         console.error('Creatives fetch failed', err);
    //       }
    //     };

    //     fetchCreatives();
    //   }, [campaignIds]);

    //   const sendCreativesRequest = async (campaignIdsByAccount, token) => {
    //     if (!campaignIdsByAccount || typeof campaignIdsByAccount !== "object") return [];

    //     // 🔹 build single payload
    //     const items = Object.entries(campaignIdsByAccount).map(
    //       ([accountNumber, campaignIds]) => ({
    //         accountNumber: String(accountNumber),
    //         campaignIds: campaignIds.map(String)
    //       })
    //     );

    //     const resp = await apiClient.post(
    //       "https://prodapis.adsgoat.in/Creatives/get",
    //       { items },
    //       {
    //         headers: {
    //           Authorization: token
    //         }
    //       }
    //     );

    //     return resp.data?.data || [];
    //   };

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
    //   if (activeTab === "3") {
    //     functionCall2();
    //   }
    //   // if(selectedAdsets){
    //   // functionCall2();
    //   // oneTimeFetch.current = false;
    //   // }
    // }, [selectedAdsets, selectedCampaigns, activeTab]);

    const ranOnce = useRef(false);
    const prevAdsets = useRef(null);
    const prevCampaigns = useRef(null);

    useEffect(() => {
        if (activeTab !== "3") return; // only care when tab 3 is active

        const adsetsStr = JSON.stringify(selectedAdsets);
        const campsStr = JSON.stringify(selectedCampaigns);

        const changed =
            !ranOnce.current ||
            prevAdsets.current !== adsetsStr ||
            prevCampaigns.current !== campsStr;

        if (changed) {
            functionCall2();

            // mark current values as seen
            ranOnce.current = true;
            prevAdsets.current = adsetsStr;
            prevCampaigns.current = campsStr;
        }
    }, [activeTab, selectedAdsets, selectedCampaigns]);

    // useEffect(() => {
    //     // functionCall1();
    //     console.log(campaignStatusFilter, "campaignStatusFilter");
    //     if (campaignStatusFilter !== "All") {
    //         // const filteredByStatus = newRowDataForFilter.current.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
    //         // setdailyData(filteredByStatus);
    //         // const adStatusMap = new Map(
    //         //   campaignComments
    //         //     .filter(item => item.level === "ad")
    //         //     .map(item => [
    //         //       String(item.ad_id),
    //         //       typeof item.status === "string"
    //         //         ? item.status.toUpperCase()
    //         //         : "ACTIVE"
    //         //     ])
    //         // );

    //         // const filteredRowObjects = newRowDataForFilter.current.filter(row => {
    //         //   const adStatus = adStatusMap.get(String(row.adid)) || "ACTIVE";
    //         //   return adStatus === campaignStatusFilter?.toUpperCase();
    //         // });
    //         // Build ad-status map from campaignComments (uses ad_id)
    //         const adStatusMap = new Map(
    //             campaignComments
    //                 .filter(item => item.level === "ad" && item.ad_id)
    //                 .map(item => [
    //                     String(item.ad_id),
    //                     item.fbStatus ? String(item.fbStatus).toUpperCase() : "ACTIVE"
    //                 ])
    //         );

    //         const newRowData = newRowDataForFilter.current;

    //         // Attach fbStatus to each row using adStatusMap
    //         const newRowDataWithFbStatus = newRowData.map(each => {
    //             const adKey = String(each.adid);

    //             return {
    //                 ...each,
    //                 fbStatus: adStatusMap.get(adKey) || "ACTIVE"
    //             };
    //         });

    //         // Final filter by selected status
    //         const filteredRowDataWithStatus = newRowDataWithFbStatus.filter(
    //             item =>
    //                 item.fbStatus.toUpperCase() ===
    //                 campaignStatusFilter?.toUpperCase()
    //         );

    //         setdailyData(filteredRowDataWithStatus);
    //         if (typeFilter !== "All") {

    //             const campaignBudgetMap = new Map(
    //                 Camapignlevelstatus.map(item => {
    //                     const id = String(item.campaign_id);

    //                     const hasDaily =
    //                         Number(item.campaign_budget?.daily_budget || 0) > 0 ||
    //                         item.adsets?.some(ad => Number(ad.budget?.daily_budget || 0) > 0);

    //                     const hasLifetime =
    //                         Number(item.campaign_budget?.lifetime_budget || 0) > 0 ||
    //                         item.adsets?.some(ad => Number(ad.budget?.lifetime_budget || 0) > 0);

    //                     return [id, { daily: hasDaily, lifetime: hasLifetime }];
    //                 })
    //             );

    //             const filteredByType = filteredRowDataWithStatus.filter(row => {
    //                 const budget = campaignBudgetMap.get(String(row.campaignid));

    //                 if (typeFilter === "Daily") return budget?.daily;
    //                 if (typeFilter === "Lifetime") return budget?.lifetime;

    //                 return true;
    //             });

    //             setdailyData(filteredByType);
    //         }
    //     } else {
    //         let data = newRowDataForFilter.current;

    //         if (typeFilter !== "All") {
    //             const campaignBudgetMap = new Map(
    //                 Camapignlevelstatus.map(item => {
    //                     const id = String(item.campaign_id);

    //                     const hasDaily =
    //                         Number(item.campaign_budget?.daily_budget || 0) > 0 ||
    //                         item.adsets?.some(ad => Number(ad.budget?.daily_budget || 0) > 0);

    //                     const hasLifetime =
    //                         Number(item.campaign_budget?.lifetime_budget || 0) > 0 ||
    //                         item.adsets?.some(ad => Number(ad.budget?.lifetime_budget || 0) > 0);

    //                     return [id, { daily: hasDaily, lifetime: hasLifetime }];
    //                 })
    //             );

    //             data = data.filter(row => {
    //                 const budget = campaignBudgetMap.get(String(row.campaignid));

    //                 if (typeFilter === "Daily") return budget?.daily;
    //                 if (typeFilter === "Lifetime") return budget?.lifetime;

    //                 return true;
    //             });
    //         }

    //         setdailyData(data);
    //         // setdailyData(newRowDataForFilter.current);
    //     }
    // }, [campaignStatusFilter, typeFilter, Camapignlevelstatus]);

    // useEffect(() => {
    //   // console.log(campaignComments, "campaignComments");
    //   // console.log(campaignStatusFilter, "campaignStatusFilter");
    //   // console.log(campaignComments.filter(ad => ad.level === 'ad'), "campaignComments.filter(ad => ad.level === 'ad')");
    //   const mainData = newRowDataForFilter.current;
    //   // console.log(mainData, "mainData");
    //   const filterData = mainData && mainData.length > 0 ?
    //     mainData.map((eachData) => {
    //       const getFbStatusKey = campaignComments.find(ad => ad.campaignid === eachData.campaignid && ad.Account === eachData.accountNumber && ad.adsetid === eachData.adsetid && ad.adid === eachData.ad_id && ad.level === 'ad');
    //       return (
    //         {
    //           ...eachData,
    //           fbStatus: getFbStatusKey?.fbStatus || "ACTIVE",
    //         }
    //       )
    //     }) : [];
    //   newRowDataForFilter.current = filterData;
    //   let newFilterData;
    //   if (campaignStatusFilter !== "All") {
    //     console.log("testing 4444");
    //     newFilterData = filterData?.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
    //     console.log(newFilterData.filter(item => item.fbStatus?.toUpperCase() === "PAUSED"));
    //   }
    //   else {
    //     newFilterData = filterData;
    //   }

    //   setdailyData(prev => [...newFilterData]);
    //   // newRowDataForFilter.current = filteredData;
    //   console.log("testing 4444");
    // }, [campaignComments]);

    // useEffect(() => {
    //   functionCall2();
    // }, [campaignStatusFilter]);

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
                adsetStatusMap.get(String(row.adid)) ===
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

    useEffect(() => {
        if (refreshpage === "Refresh23") {
            handleReFetchData();
        }
    }, [refreshpage]);

    useEffect(() => {
        if (gridRef1.current && gridRef1.current.api) {
            setTimeout(() => {
                gridRef1.current.api.refreshCells({ force: true });
                gridRef1.current.api.redrawRows();
                gridRef1.current.api.sizeColumnsToFit();
            }, 200);
        }
    }, [memorizedDailyData]);

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
                    ) : newRowDataForFilter.current?.length > 0 ?
                        <div>
                            <div>
                                <Row className="header-row" style={{ width: '100%', height: "100%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap', backgroundColor: theme === "dark" && "#4d4d4d", }}>
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
                                                    onOk={handleBulkAdStatusSubmit}
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
                                                                onClick={() => handleBulkSmartPinAd("pin")}
                                                            >
                                                                📌
                                                            </span>
                                                            <span
                                                                style={{ cursor: "pointer", fontSize: "18px" }}
                                                                onClick={() => handleBulkSmartPinAd("unpin")}
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
                                                <Tooltip title="Bulk comment" overlayInnerStyle={{
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
                                                    title="Bulk comment"
                                                    className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                                                    open={isBulkCommentModalVisible}
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
                                                            style={{ backgroundColor: "#91C25F" }}
                                                            onClick={() => {
                                                                handleBulkCommentSubmitAd();
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
                                                <Tooltip title="Bulk add category" overlayInnerStyle={{
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
                                                                    color: theme === "dark" ? "#ddd" : "#333",
                                                                    display: "flex",
                                                                    flexDirection: "column"
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
                                                border: '1px solid #91C25F',
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
                                        < Tooltip
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
                                                                        ? '#91C25F'
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
                                                    color: "#91C25F",
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
                                                <Switch checked={toggleStatus} onChange={() => handleChangeToggle()} style={{marginLeft:'10px', marginRight:'10px', backgroundColor: toggleStatus && "#91C25F" }}/>
                                            </Tooltip>
                                        </Col> */}
                                    <Col xs={24} sm={24} md={4} lg={2} style={{ flex: '0.2 0 auto' }}>
                                        {/* <Tooltip title="Export to CSV"> */}
                                        <Button type="primary" style={{ backgroundColor: '#91C25F', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined className="black-icon" />} onClick={() => onBtExport(gridRef1, "Daily")} />
                                        {/* </Tooltip> */}
                                    </Col>
                                </Row>
                            </div>

                            {dailyData?.length > 0 ? (
                                <div
                                    className={`ag-theme-alpine ag-container ${gridThemeClass}`}
                                // style={{
                                //     width: '100%',
                                //     // borderRadius: 12,
                                //     backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
                                //     padding: 10,
                                //     height: 'auto',
                                //     boxShadow:
                                //     theme === 'dark'
                                //         ? '0 1px 3px rgba(0,0,0,0.6)'
                                //         : '0 1px 6px rgba(0,0,0,0.08)',
                                // }}
                                >

                                    <div className='table-container'>
                                        <AgGridReact
                                            ref={gridRef1}
                                            rowHeight={30}
                                            className='custom-grid'
                                            rowData={memorizedDailyData}
                                            // immutableData={true}
                                            // getRowId={params => params.data.id}
                                            columnDefs={memorizedColumnDef1}
                                            onCellClicked={onCellClicked}
                                            // context={context}
                                            context={{
                                                ...context,
                                                adLevelCreatives,
                                            }}
                                            pagination={true}
                                            paginationPageSize={200}
                                            paginationPageSizeSelector={[20, 40, 60, 80, 100, 150, 200]}
                                            groupDisplayType='multipleColumns'
                                            suppressAggFuncInHeader={true}
                                            suppressCellSelection={true}
                                            groupSuppressBlankHeader={true}
                                            defaultColDef={defaultColDef}
                                            rowSelection='multiple'
                                            onSelectionChanged={onSelectionChanged}
                                            groupSelectsChildren={true} // ✅ Selects all children when a group is selected
                                            suppressRowClickSelection={true}
                                            useValueFormatterForExport={true}
                                            // groupIncludeFooter={true}
                                            // groupIncludeTotalFooter={true}
                                            autoGroupColumnDef={autoGroupColumnDef}
                                            getRowId={(params) => String(params.data.adid)}
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
                                                        color: theme === "dark" ? '#fff' : '#000',
                                                        height: '30px'         // Text color should contrast with the background
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

                                                // Step 1: Group rows by adname
                                                // const groupedTQMap = new Map();

                                                // filteredData.forEach((row) => {
                                                // if (!groupedTQMap.has(row.adname)) {
                                                //     groupedTQMap.set(row.adname, 0);
                                                // }
                                                // const currentTQ = groupedTQMap.get(row.adname);
                                                // groupedTQMap.set(row.adname, currentTQ + (isNaN(row.tq) ? 0 : Number(row.tq)));
                                                // });

                                                // Step 2: Compute average of grouped totals
                                                // const totalGroupedSum = Array.from(groupedTQMap.values()).reduce((acc, val) => acc + val, 0);
                                                // const averageGroupedTQ = groupedTQMap.size > 0 ? (totalGroupedSum / groupedTQMap.size).toFixed(2) : "0.00";

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
                                                        ctr: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0) * 100).toFixed(2)),
                                                        // tq: averageGroupedTQ,
                                                        M_tq: (() => {
                                                            const nonZero = filteredData.filter(d => parseFloat(d?.M_tq) > 0);
                                                            const total = nonZero.reduce((acc, d) => acc + parseFloat(d.M_tq || 0), 0);
                                                            return parseFloat((total / (nonZero.length || 1)).toFixed(2));
                                                        })(),
                                                        D_tq: (() => {
                                                            const nonZero = filteredData.filter(d => parseFloat(d?.D_tq) > 0);
                                                            const total = nonZero.reduce((acc, d) => acc + parseFloat(d.D_tq || 0), 0);
                                                            return parseFloat((total / (nonZero.length || 1)).toFixed(2));
                                                        })(),
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
                                // style={{
                                //     width: '100%',
                                //     // borderRadius: 12,
                                //     backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
                                //     padding: 10,
                                //     height: 'auto',
                                //     boxShadow:
                                //     theme === 'dark'
                                //         ? '0 1px 3px rgba(0,0,0,0.6)'
                                //         : '0 1px 6px rgba(0,0,0,0.08)',
                                // }}
                                >

                                    <div className='table-container'>
                                        <AgGridReact
                                            ref={gridRef1}
                                            rowHeight={30}
                                            className='custom-grid'
                                            rowData={[]}
                                            columnDefs={memorizedColumnDef1}
                                            onCellClicked={onCellClicked}
                                            // context={context}
                                            context={{
                                                ...context,
                                                adLevelCreatives,
                                            }}
                                            pagination={true}
                                            paginationPageSize={200}
                                            paginationPageSizeSelector={[20, 40, 60, 80, 100, 150, 200]}
                                            groupDisplayType='multipleColumns'
                                            suppressAggFuncInHeader={true}
                                            suppressCellSelection={true}
                                            groupSuppressBlankHeader={true}
                                            defaultColDef={defaultColDef}
                                            rowSelection='multiple'
                                            onSelectionChanged={onSelectionChanged}
                                            groupSelectsChildren={true} // ✅ Selects all children when a group is selected
                                            suppressRowClickSelection={true}
                                            // groupIncludeFooter={true}
                                            // groupIncludeTotalFooter={true}
                                            autoGroupColumnDef={autoGroupColumnDef}
                                            getRowId={(params) => String(params.data.adid)}
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
                                                        color: theme === "dark" ? '#fff' : '#000',
                                                        height: '30px'         // Text color should contrast with the background
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

                                                // Step 1: Group rows by adname
                                                // const groupedTQMap = new Map();

                                                // filteredData.forEach((row) => {
                                                // if (!groupedTQMap.has(row.adname)) {
                                                //     groupedTQMap.set(row.adname, 0);
                                                // }
                                                // const currentTQ = groupedTQMap.get(row.adname);
                                                // groupedTQMap.set(row.adname, currentTQ + (isNaN(row.tq) ? 0 : Number(row.tq)));
                                                // });

                                                // Step 2: Compute average of grouped totals
                                                // const totalGroupedSum = Array.from(groupedTQMap.values()).reduce((acc, val) => acc + val, 0);
                                                // const averageGroupedTQ = groupedTQMap.size > 0 ? (totalGroupedSum / groupedTQMap.size).toFixed(2) : "0.00";

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
                                                        ctr: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0) * 100).toFixed(2)),
                                                        // tq: averageGroupedTQ,
                                                        M_tq: (() => {
                                                            const nonZero = filteredData.filter(d => parseFloat(d?.M_tq) > 0);
                                                            const total = nonZero.reduce((acc, d) => acc + parseFloat(d.M_tq || 0), 0);
                                                            return parseFloat((total / (nonZero.length || 1)).toFixed(2));
                                                        })(),
                                                        D_tq: (() => {
                                                            const nonZero = filteredData.filter(d => parseFloat(d?.D_tq) > 0);
                                                            const total = nonZero.reduce((acc, d) => acc + parseFloat(d.D_tq || 0), 0);
                                                            return parseFloat((total / (nonZero.length || 1)).toFixed(2));
                                                        })(),
                                                    },
                                                ];

                                                setDailyFixedFooter(updatedFooter);
                                            }}
                                        />
                                    </div>

                                </div>
                            }
                        </div>
                        : <div style={{ backgroundColor: theme === "dark" && "#333" }}>
                            <Result
                                className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                icon={<SmileOutlined />}
                                title={`No DailyData for ${newaccount} from ${startDate} to ${endDate}`}
                            // extra={<Button type="primary">Next</Button>}
                            />
                        </div>}
            </div>
        </div>
    );
};

export default Daily;
