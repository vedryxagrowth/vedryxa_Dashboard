import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import React from 'react';
import moment from 'moment-timezone';
import { Input, Button, Row, Col, Typography, Result, Modal, message, Switch, Tabs, Badge, Spin, Checkbox, Tooltip, Space, Menu, Dropdown } from 'antd';
import { GlobalOutlined, NumberOutlined, InfoCircleOutlined, DownloadOutlined, SmileOutlined, CopyOutlined, EditOutlined, MessageOutlined, PauseCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined, LinkOutlined, PushpinOutlined, FilterOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import { RxSwitch } from "react-icons/rx";
import StickyBox from 'react-sticky-box';
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
    "FB_Mnet": "Facebook_Mnet",
    "FB_MnetBing": "Facebook_MnetBing",
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
    "FB_CodeFuel": "Facebook_CodeFuel"

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

const AdsetLevelReports = ({ functionCallForCampaigns, context, activeTab, functionCallForCommnets, startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, campaignComments, setCampaignComments, Camapignlevelstatus, setCamapignlevelstatus, changeRRefrst, debouncedHandleColumnMove, userdetails, refreshComments, refreshpage, getMainMenuItems, toggleStatus, handleChangeToggle, tabStatus, selectedAdsets, showAdsetLevel, removeSelectedAdsets, selectedCampaigns, moveToNextTab, accountsAccess, commentsMap }) => {
    const { theme, apiClient } = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
    const getRowStyleTheme = theme === 'dark' ? { backgroundColor: '#1e1e1f', color: '#ffffff' } : { backgroundColor: '#ffffff', color: '#000000' };
    const [rowData, setRowData] = useState([]);

    const newRowDataForFilter = useRef([]);

    const [campaignStatusFilter, setcampaignStatusLabel] = useState("All");

    const [insideInput, setInsideInput] = useState("");

    const [liveFixedFooter, setLiveFixedFooter] = useState([]);

    const [isLoading, setLoading] = useState(true);

    const [apiStatus, setApiStatus] = useState(false);


    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedCells, setSelectedCells] = useState([]); // Store selected cell positions
    const [firstSelectedCell, setFirstSelectedCell] = useState(null); // Store the first selected cell
    // const [activeTab, setActiveTab] = useState("1");

    const timezone = useRef();

    const cronStatus = useRef();

    const accountStatus = useRef();

    let fbCron = useRef();

    let revenueCron = useRef();

    const maxHour = useRef();

    const maxNetworkHour = useRef();

    const gridRef = useRef();


    const newRowData = useRef();

    const oneTimeFetch = useRef(true);

    const [selectedAdset, setSelectedAdset] = useState([]);

    const memorizedColumnDef = useMemo(() => columnDefs, [columnDefs]);
    // const memorizedRowData = useMemo(() => rowData ? rowData?.filter((each) => {
    //     const normalizedCampaign = each.campaignname.trim().toLowerCase();
    //     const normalizedInput = inputValue.trim().toLowerCase();
    //     return (
    //         normalizedCampaign.startsWith(normalizedInput) ||
    //         normalizedCampaign.includes(normalizedInput) ||
    //         normalizedCampaign.endsWith(normalizedInput)
    //     );
    // }
    // ) : [], [rowData, inputValue, theme]);
    const memorizedRowData = useMemo(() => {
        let filtered = rowData || [];

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
                const adsetId = (each?.adsetid || "").toString().trim().toLowerCase()
                return (
                    adsetname.includes(normalizedInside) ||
                    accountNumber.includes(normalizedInside) ||
                    campaignId.includes(normalizedInside) ||
                    adsetId.includes(normalizedInside)
                );
            });
        }

        return filtered;
    }, [rowData, inputValue, insideInput]);
    const [leafCampaigns, setLeafCampaigns] = useState([]);
    const [isBulkCommentModalVisible, setIsBulkCommentModalVisible] = useState(false);
    const [comment, setComment] = useState("");
    const [isBulkStatusModalVisible, setIsBulkStatusModalVisible] = useState(false);
    const [bulkStatusAction, setBulkStatusAction] = useState(null);
    const [confirmBulkLoading, setConfirmBulkLoading] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulkCategory, setBulkCategory] = useState("");

    // useEffect to show selected campaigns after clearing search
    useEffect(() => {
        const api = gridRef.current?.api;
        if (!api) return;

        if (inputValue.trim() === '' && selectedAdset.length > 0) {
            const selectedIds = selectedAdset.map(item => item.adsetid);
            const selectedOnly = rowData.filter(item => selectedIds.includes(item.adsetid));

            // ✅ Replace rows
            api.applyTransaction({ replace: true, data: selectedOnly });

            // ✅ Reselect those rows
            setTimeout(() => {
                api.forEachNode((node) => {
                    if (selectedIds.includes(node.data?.adsetid)) {
                        node.setSelected(true);
                    }
                });
            }, 0);
        } else if (inputValue.trim() === '' && selectedAdset.length === 0) {
            api.applyTransaction({ replace: true, data: rowData });
        }
    }, [inputValue, selectedAdset, rowData]);

    // console.log(memorizedRowData, "memorizedRowData");
    // console.log(rowData, "rowData");

    useEffect(() => {
        setLiveFixedFooter([
            {
                campaignName: 'Total',
                actions: "",
                spend: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
                revenue: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
                profit: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
                margin: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
                rpc: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / memorizedRowData?.length).toFixed(2)),
                cpl: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / memorizedRowData?.length).toFixed(2)),
                ncpl: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / memorizedRowData?.length).toFixed(2)),
                fbleads: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
                conversions: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
                fmargin: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                roi: parseFloat(((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                cpc: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / memorizedRowData?.length).toFixed(2)),
                cpclinkclicks: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks), 0) / memorizedRowData?.length).toFixed(2)),
                fbclicks: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
                fblinkclicks: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0).toFixed(2)),
                impressions: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
                ctr: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
            }
        ])
    }, [memorizedRowData]);

    const onBtExport1 = () => {
        console.log(gridRef.current.api, "in")
        const Details = {
            network: newRevenuePratner,
            account: newaccount,
            dateRange: `From ${startDate} to ${endDate}`,
            type: "Live",
            email: userdetails?.email,
            time: moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A")
        }
        gridRef.current.api.exportDataAsCsv({
            processCellCallback: (params) => {
                const node = params.node;
                if (node.group) {
                    return null;
                }
                return params.value;
            },
            shouldRowBeSkipped: (params) => {
                return params.node.group;
            },
        });
        const updateDetails = async () => {
            await apiClient.post('/UserExportActivities/', { Details });
        }
        updateDetails();

    };
    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedAdset(selectedData);
        showAdsetLevel(uniqueByAdsetId(selectedData));
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
        console.log(" Selected unique Adsets:", uniqueLeafCampaigns);

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
            userPin: userdetails?.email
        }));

        message.loading(
            `${action === "pin" ? "Pinning" : "Unpinning"} selected adsets...`,
            0
        );

        const apiUrl =
            action === "pin"
                ? "/SmartPinBulk"
                : "/SmartUnpinBulk";

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
                } else {
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
            }));

            const body = {
                accountNumber: leafCampaigns?.[0]?.accountNumber,
                level: 'adset',
                items
            };

            const resp = await apiClient.post(
                '/Comments/bulkdelete',
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
                campaignname: item.adsetname,
                adsetid: item.adsetid,
                comment,
                usercommit: userdetails?.email,
                level: "adset"
            }));

            const resp = await apiClient.post(
                '/Comments/upsertBulkNew',
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
                                campaignname: item.adsetname,
                                adsetid: item.adsetid,
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
                    email: userdetails?.email
                }));


            if (filteredItems.length === 0) {
                message.info("No adsets need updating.");
                setIsBulkStatusModalVisible(false);
                setConfirmBulkLoading(false);
                return;
            }

            const resp = await apiClient.post(
                "/BulkAdsetStatusChangeMany",
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
                if (campaignStatusFilter !== "All") {
                    const adsetStatusMap = new Map(
                        updatedCampaignLevelStatus.flatMap(campaign =>
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

                    setRowData(filteredRowObjects);
                }


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
        }));

        if (items.length === 0) {
            message.info("No campaigns selected.");
            setBulkOpen(false);
            return;
        }

        try {
            message.loading({ content: "Updating category...", key: "bulkCategory" });

            await apiClient.post(
                "/BulkUpdateCategoryNew",
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
    const autoGroupColumnDefLive = {
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
        // filter: 'agTextColumnFilter',      // Enable string filter
        // floatingFilter: false,              // Optional: show quick filter below header
        // suppressMenu: false,
        // showRowGroup: 'adsetname',
        // field: 'adsetname',

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

        cellRenderer: "agGroupCellRenderer", // ✅ Use AG Grid's built-in renderer
        cellRendererParams: {
            checkbox: true,
            suppressCount: false,
            innerRenderer: (params) => {
                if (params.node.footer) {
                    return 'Total';
                }
                // console.log(params.value, "value");
                const adsetNameGroup = (() => {
                    if (params.node.childrenAfterGroup?.length > 0) {
                        return params.node.childrenAfterGroup[0]?.data?.adsetname || params.node.key;
                    }
                    return params.node.key; // fallback to campaignid
                })();

                const firstColumnValue = adsetNameGroup;  // campaign name
                const campaignName = adsetNameGroup;
                const adsetName = adsetNameGroup;

                let campaignid, adsetid;
                let accountNumberToPassHistoryPage;

                if (params.node.group && Array.isArray(params.node.childrenAfterGroup) && params.node.childrenAfterGroup.length > 0) {
                    const firstChild = params.node.childrenAfterGroup[0]?.data;  // Safe access with optional chaining

                    if (firstChild) {  // Ensure firstChild is not undefined before accessing properties
                        campaignid = firstChild.campaignid ?? null;  // Use null-safe access
                        adsetid = firstChild.adsetid ?? null;
                        accountNumberToPassHistoryPage = firstChild.accountNumber ?? null;

                    } else {
                        console.log("First child data is undefined", params.node.childrenAfterGroup[0]);
                    }
                } else if (params.data) {
                    campaignid = params.data.campaignid ?? null;
                    adsetid = params.data.adsetid ?? null;
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

                // ► the row’s accountNumber (critical for status toggle)
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


                // find the exact comment record for this (campaign+adset+account)
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
                useEffect(() => {
                    if (typeof pinnedOverride === 'boolean') setPinned(pinnedOverride);
                }, [pinnedOverride]);


                //   const relatedComment = rec?.comment ?? null;
                //   const editedRaw      = rec?.editedTime ?? rec?.editedPinTime ?? '';
                //   const editedBy       = rec?.usercommit ?? rec?.userPin ?? '';
                //   const editedPretty   = editedRaw
                //     ? moment(editedRaw, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A")
                //     : '';



                const getEditedUserAndTime = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    return relatedStatus ? relatedStatus : null;
                };

                const getPinEditedUserAndTime = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    return relatedStatus ? relatedStatus : null;
                };

                const getStatusForCampaign = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    return relatedStatus !== undefined && relatedStatus.status === true ? true : relatedStatus !== undefined ? false : null;
                };

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
                // console.log("Date:", relatedComment);
                const valueWithCount = `${firstColumnValue}`;
                // console.log(editUserANdTime);

                const [tooltipText, setTooltipText] = useState("Click to Copy");
                const [isModalVisibles, setIsModalVisibles] = useState(false);
                const [isAdsetModalVisibles, setIsAdsetModalVisibles] = useState(false);
                const [selectedAdset, setSelectedAdset] = useState(null); // store adid when switch clicked
                // const [switchOn, setSwitchOn] = useState(false); // control toggle state
                const [nextChecked, setNextChecked] = useState(false); // what user clicked
                const [comment, setComment] = useState(relatedComment || '');
                // const [pinned, setPinned] = useState(getPinStatusForCampaign(campaignName));
                const [pendingAccount, setPendingAccount] = useState(null);
                const [universalOject, setUniversalObject] = React.useState(null)
                const [confirmLoading, setConfirmLoading] = React.useState(false);


                // const [switchOn, setSwitchOn] = useState(true); // default to ACTIVE

                // keep pin in sync
                //   useEffect(() => { setPinned(!!rec?.pinned); }, [rec?.pinned]);

                // init switch from comments.AdsetLevel per account
                //   useEffect(() => {
                //     const commentForCampaign = campaignComments.find(obj =>
                //       String(obj.campaignid) === String(campaignid) && String(obj.Account) === String(rowAccount)
                //     );

                //     let matchedAdset = null;
                //     if (Array.isArray(commentForCampaign?.AdsetLevel)) {
                //       matchedAdset = commentForCampaign.AdsetLevel.find(a => String(a.adset_id) === String(adsetid));
                //     } else if (commentForCampaign?.AdsetLevel?.adset_id &&
                //                String(commentForCampaign?.AdsetLevel?.adset_id) === String(adsetid)) {
                //       matchedAdset = commentForCampaign.AdsetLevel;
                //     }

                //     const isActive = matchedAdset?.status === "ACTIVE";
                //     setSwitchOn(matchedAdset ? isActive : true); // fallback ACTIVE
                //   }, [campaignComments, campaignid, adsetid, rowAccount]);


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
                    const campaignForAccount = Camapignlevelstatus.find(obj =>
                        String(obj.campaign_id) === String(campaignid) &&
                        String(obj.accountNumber) === String(rowAccount)
                    );
                    const arrayOfAdsets = campaignForAccount?.adsets || [];
                    const matchedAdset = arrayOfAdsets.find(a => String(a.adset_id) === String(adsetid));
                    return matchedAdset ? matchedAdset.status === "ACTIVE" : true; // default ACTIVE
                });

                React.useEffect(() => {
                    setUniversalObject(campaignComments.find(d => d.level === "adset" && d.campaignid === campaignid && d.adsetid === adsetid && d.Account === rowAccount));
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [campaignComments]);

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
                //         accountNumber: String(pendingAccount),     // ← per row account
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

                const handlePauseOk = async () => {
                    const desired = nextChecked; // true => ACTIVE
                    setIsAdsetModalVisibles(true);
                    setConfirmLoading(true);
                    try {
                        const token = localStorage.getItem("token");
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
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm A"),
                            updateDetail: `From ${desired ? "Inactive" : "Active"} to ${desired ? "Active" : "Inactive"}`,
                        }
                        const payload = {
                            status: desired ? "ACTIVE" : "PAUSED",
                            campaignname: campaignName,
                            name: adsetName,
                            accountNumber: String(rowAccount),
                            campaign_id: campaignid,
                            adset_id: adsetid,
                            email: userdetails?.email,
                            activity: payloadForActivity
                        };
                        const response = await apiClient.post(`http://localhost:8000/NewBulkAdsetStatusChangeWithHistory`, payload,
                            { headers: { Authorization: token } }
                        );

                        const newStatus = desired ? "ACTIVE" : "PAUSED";

                        // write to override map (stable across tabs)
                        // statusMap?.set(statusKey, newStatus);
                        if (response.status === 200 || response.status === 201) {
                            setSwitchOn(desired);
                            setConfirmLoading(false);
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
                            if (campaignStatusFilter !== "All") {
                                const adsetStatusMap = new Map(
                                    updatedCampaignLevelStatus.flatMap(campaign =>
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

                                setRowData(filteredRowObjects);
                            }

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

                        // also cache on the row so sort/comparator can see it without reading maps
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
                    if (!leafCampaigns || leafCampaigns.length <= 1) {
                        handlePauseOk();
                        return;
                    }
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
                //         campaignname: adsetName,   // you store adsetName under campaignname on comments
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

                // ► BULK comment delete
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
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm A"),
                            updateDetail: `From ${next ? "unpin" : "pin"} to ${next ? "pin" : "unpin"}`,
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
                            ? await apiClient.post('http://localhost:8000/NewPinBulkWithHistory', body)
                            : await apiClient.post('http://localhost:8000/NewUnpinBulkWithHistory', body);

                        if (resp.status === 200 || resp.status === 201) {
                            // persist in Map + row cache
                            // if (newResponse.status === 200 || newResponse.status === 201) {
                            setCampaignComments(prev => {
                                const arr = Array.isArray(prev) ? [...prev] : [];
                                const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

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
                            // }
                            message.success(next ? "Pinned" : "Unpinned");
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

                    if (leafCampaigns && leafCampaigns.length > 1) {
                        try {
                            message.loading({ content: next ? 'Pinning selected adsets...' : 'Unpinning selected adsets...', key: 'adsetPin' });

                            const endpoint = next ? '/NewPinBulk' : '/NewUnpinBulk';
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
                            console.error('Adset Bulk Pin Error:', error);
                            message.error('Failed to update selected adsets.');
                        }
                        return;
                    }
                    handlePinClick(currentPinStatus);
                };

                const PinIcon = ({ universalOject, pinned }) => (
                    <Tooltip
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
                            onClick={() => handlePinClick(pinned)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}
                        >
                            {pinned ? "📌" : "📍"}
                        </button>
                    </Tooltip>
                );

                const handleOks = async () => {
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
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm A"),
                        // updateDetail: `From ${updatedPinStatus ? "unpin" : "pin"} to ${updatedPinStatus ? "pin" : "unpin"}`,
                    }
                    try {
                        const newResponse = await apiClient.post('http://localhost:8000/Comments/upsert/History', {
                            accountNumber: rowAccount,
                            campaignname: adsetName,
                            campaignid,
                            adsetid,
                            comment,
                            usercommit: userdetails?.email,
                            level: "adset",
                            activity: payloadForActivity
                        });
                        if (newResponse.status === 200 || newResponse.status === 201) {
                            setCampaignComments(prev => {
                                const arr = Array.isArray(prev) ? [...prev] : [];
                                const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

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
                        // persist in Map (stable across tabs)
                        // commentMap?.set(statusKey, {
                        //     text: comment,
                        //     editedBy: userdetails?.email,
                        //     editedAt: moment().format("DD-MM-YYYY hh:mm:ss A"),
                        // });
                        message.success("Comment saved");
                        setIsModalVisibles(false);
                    } catch (e) {
                        message.error('Failed to save comment');
                    }
                };
                const handleSmartAdsetCommentSubmit = async () => {
                    if (leafCampaigns && leafCampaigns.length > 1) {
                        try {
                            message.loading({ content: 'Saving comments for selected adsets...', key: 'bulkAdsetComment' });
                            const items = leafCampaigns.map(item => ({
                                accountNumber: item.accountNumber,
                                campaignname: item.adsetname,
                                campaignid: item.campaignid,
                                adsetid: item.adsetid,
                                comment,
                                usercommit: userdetails?.email,
                                level: "adset",
                            }));

                            console.log('Sending adset items:', items);
                            const resp = await apiClient.post(
                                '/Comments/upsertBulk',
                                { items, usercommit: userdetails?.email },

                            );

                            if (resp.status === 200 || resp.status === 201) {
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
                            console.error(' Bulk Adset Comment Error:', error);
                            message.error('Error while saving comments for selected adsets.');
                        }
                        return;
                    }
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
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm A"),
                            // updateDetail: `From ${updatedPinStatus ? "unpin" : "pin"} to ${updatedPinStatus ? "pin" : "unpin"}`,
                        }
                        const newResponse = await apiClient.post('http://localhost:8000/New/Comments/delete/History', {
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
                                const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

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
                    } catch (error) {
                        console.error('Error sending data to server:', error);
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
                //         // console.log(payload);

                //         // Call the backend API to delete the comment
                //         const response = await apiClient.post('/Comments/delete', payload);

                //         if (response.status === 200  || response.status === 201) {
                //             // Remove the comment from the local state
                //             // const updatedComments = campaignComments.filter(
                //             //     (comment) => comment.campaignname !== firstColumnValue
                //             // );
                //             refreshComments(newaccount);

                //             // // Update the state with the updated comments
                //             // setCampaignComments(updatedComments);

                //             // // Refresh the table or any other UI component
                //             // // changeRRefrst();

                //             message.success('Comment deleted successfully!');
                //             setIsModalVisibles(false); // Close the popup
                //         } else {
                //             message.error('Failed to delete the comment. Please try again.-1');
                //         }
                //     } catch (error) {
                //         console.error('Error deleting the comment:', error);
                //         message.error('Failed to delete the comment. Please try again.');
                //     }
                // };


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
                        return response.data;
                    } catch (error) {
                        console.error('Error sending edited comment to server:', error);
                        throw error;
                    }
                };

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

                //         // const updatedComments = relatedComment
                //         //     ? campaignComments.map(cmt => (cmt.campaignname === firstColumnValue ? { ...cmt, comment } : cmt))
                //         //     : [...campaignComments, logData];
                //         // setCampaignComments(updatedComments);

                //         // changeRRefrst();
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
                //         console.error('Error toggling pin status:', error);
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

                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Switch
                            checked={switchOn}
                            // onClick={(checked) => handlePauseClick(adsetid, checked)} 
                            // onChange={handlePauseClick}
                            onChange={(checked, e) => {
                                e?.stopPropagation?.();
                                handlePauseClick(checked);
                            }}
                            size="small"
                            style={{
                                backgroundColor: switchOn ? '#91C25F' : '#d9d9d9',
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
                            pinned={pinned}
                        /> */}
                        <PinIcon pinned={pinned} universalOject={universalOject} />

                        {universalOject?.comment && (
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
                                //   }
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
                        )}
                        {!universalOject?.comment && (
                            <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }} />
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
                                style={{ cursor: 'pointer', marginLeft: '2px', color: "#1e1e1f", marginRight: '10px' }}
                            />
                        </Tooltip>
                        <LinkOutlined
                            onClick={() => {
                                const url = `/LiveHistory/LiveAdsetHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${accountNumberToPassHistoryPage}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
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
                            title={
                                firstColumnValue
                            }
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            visible={isModalVisibles}
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
                                            {editedPretty || ""}
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
                                style={{ color: theme === "dark" ? "white" : "black" }}
                            />
                        </Modal>
                    </div>
                );
            }
        },
        processCellForClipboard: (params) => {
            if (params.node.group) {
                console.log("Processing group column for copy..."); // Debugging log

                // ✅ Fix: Ensure `params.node.parent` exists before accessing its properties
                if (!params.node.parent || !params.node.parent.childrenAfterGroup) {
                    return params.node.key;
                }

                // ✅ Only copy group name for the first row in the group
                return params.node.rowIndex === params.node.parent.childrenAfterGroup[0]?.rowIndex
                    ? params.node.key
                    : ""; // Prevent duplicate copies
            }
            return params.value; // Normal copy behavior for regular cells
        }
    };

    function findMaxHour(data) {
        // Use reduce to find the maximum value of the 'hour' key
        const maxHour = data.reduce((max, obj) => {
            // Convert the 'hour' value to a number before comparison
            const hourAsNumber = parseInt(obj.hour, 10);
            return hourAsNumber > max ? hourAsNumber : max;
        }, -Infinity);  // Initialize with -Infinity to ensure proper comparison

        return String(maxHour).padStart(2, '0');  // Return the max hour as a string with leading zero
    }

    function getMaxHour(data) {
        const hours = data
            .filter(item => item.updatedHour) // Filter out objects without updatedHour
            .map(item => parseInt(item.updatedHour.split(":")[0], 10));
        return hours.length > 0 ? Math.max(...hours) : null;
    }

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

    const functionCall1 = async () => {
        try {
            setLoading(true);

            // selected campaigns (unchanged)
            const campaigns = selectedCampaigns.length > 0
                ? [...new Set(selectedCampaigns.map(adset => adset.campaignid))]
                : [];

            const collectionName =
                newRevenuePratner === "FB_DomainActive"
                    ? "Facebook_DActive_Names"
                    : newtworkCollections[newRevenuePratner];

            // ✅ multi-account param (common across levels)
            const accountsParam = Array.isArray(newaccount)
                ? newaccount.map(String)
                : [String(newaccount)];

            // ✅ call the new multi-account endpoint
            const resp = await apiClient.post(
                "/AdsetLevelAccounts",
                {
                    dateStart: startDate,
                    dateEnd: endDate,
                    timezone: newtime,
                    status: tabStatus,       // "Daily" or "Live"
                    network: collectionName,
                    accountNumbers: accountsParam,
                    campaignids: campaigns,
                }
            );

            // You had a filter to skip rows where ad_clicks > 0
            const mainData1 = resp.data || [];
            const mainData = mainData1;

            const specifiedTimeZone = selectTimezone[newtime];

            const filteredData = mainData && mainData.length > 0
                ? mainData.map(eachData => {
                    const revenueData =
                        eachData?.estimated_revenue == null || isNaN(eachData.estimated_revenue)
                            ? 0
                            : parseFloat(eachData.estimated_revenue).toFixed(2);

                    const profit = (revenueData - eachData.spend).toFixed(2);
                    const rpc =
                        !eachData.conversions
                            ? 0
                            : Math.round((revenueData / eachData.conversions) * 100) / 100;

                    const cpl =
                        !eachData.fbLeads
                            ? 0
                            : Math.round((eachData.spend / eachData.fbLeads) * 100) / 100;

                    const ncpl =
                        !eachData.conversions
                            ? 0
                            : Math.round((eachData.spend / eachData.conversions) * 100) / 100;

                    const relatedComment = campaignComments.find(
                        c => c.campaignname === eachData.campaign_name
                            && String(c.Account) === String(eachData.accountNumber) // ✅ per-account
                    );
                    const category = campaignComments.find(campaign => campaign.campaignname === eachData.campaign_name && campaign.Account === eachData.accountNumber);
                    const campaign_date = Camapignlevelstatus.find(campaign => campaign.campaign_id === eachData.campaign_id && campaign.accountNumber === eachData.accountNumber);
                    const adsetObjectStatus = Camapignlevelstatus
                        .find(item =>
                            String(item.campaign_id) === String(eachData.campaign_id) &&
                            String(item.accountNumber) === String(eachData.accountNumber)
                        )?.adsets.find(adset =>
                            String(adset.adset_id) === String(eachData.adset_id)
                        );
                    const fbLClicks = parseInt(eachData.fbLinkClicks, 10);
                    const spend = parseFloat(eachData.spend);
                    const cpcLinkClicks = isNaN(fbLClicks) || fbLClicks === 0
                        ? 0
                        : Math.round((spend / fbLClicks) * 100) / 100;


                    return {
                        // ✅ keep accountNumber on the row
                        accountNumber: String(eachData.accountNumber),
                        campaignname: eachData.campaign_name,
                        adsetname: eachData.adsetName,
                        date: eachData[specifiedTimeZone],
                        'fb-hour': eachData.hour,
                        'mnet-hour': eachData.updatedHour,
                        spend: parseFloat(eachData.spend).toFixed(2),
                        revenue: revenueData ? revenueData : 0,
                        profit: parseFloat(profit),
                        fbleads: parseInt(eachData.fbLeads || 0),
                        conversions: parseInt(eachData.conversions || 0),
                        cpc: parseFloat(eachData.cpc || 0),
                        cpclinkclicks: cpcLinkClicks,
                        fbclicks: parseInt(eachData.fbClicks || 0),
                        fblinkclicks: parseInt(eachData.fbLinkClicks || 0),
                        impressions: parseInt(eachData.impressions || 0),
                        rpc: parseFloat(rpc),
                        cpl: parseFloat(cpl),
                        ncpl: parseFloat(ncpl),
                        adsetid: eachData.adset_id,
                        campaignid: eachData.campaign_id,
                        timezone: eachData[newtime],
                        comment: relatedComment ? relatedComment.comment : null,
                        adid: "",
                        adname: "",
                        actions: '...',
                        from: campaign_date?.start ? campaign_date?.start : "",
                        to: campaign_date?.end ? campaign_date?.end : "",
                        profitloss: "",
                        M_tq: "",
                        D_tq: "",
                        fbCron: eachData.fbCron,
                        revenueCron: eachData.revenueCron,
                        accountStatus: eachData.accountStatus,
                        cronStatus: eachData.cronStatus,
                        category: category?.category || "",
                        fbStatus: adsetObjectStatus?.status || "ACTIVE",
                    };
                })
                : [];

            // pick non-Failed cron/status fields across accounts
            const getValidField = (field) => {
                for (const item of mainData) {
                    if (item[field] && item[field].toLowerCase() !== 'failed') return item[field];
                }
                return '-';
            };

            timezone.current = mainData.length ? mainData[0].accountTimezone : "";
            accountStatus.current = getValidField('accountStatus');
            cronStatus.current = getValidField('cronStatus');
            fbCron.current = getValidField('fbCron');
            revenueCron.current = getValidField('revenueCron');

            // const filteredByStatus =
            //     !campaignStatusFilter || campaignStatusFilter.toUpperCase() === 'ALL'
            //         ? filteredData
            //         : filteredData.filter(item => {
            //             const raw = getAdsetStatus(item.campaignid, item.adsetid, item.accountNumber); // ✅ include accountNumber if you track per-account
            //             const status = (raw || 'ACTIVE').toUpperCase();
            //             return status === campaignStatusFilter.toUpperCase();
            //         });

            let newFilterData;
            if (campaignStatusFilter !== "All") {
                newFilterData = filteredData.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
            }
            else {
                newFilterData = filteredData;
            }

            setRowData(newFilterData);
            newRowDataForFilter.current = filteredData;

            // setRowData(filteredByStatus);

            setLiveFixedFooter([{
                campaignName: 'Total',
                actions: "",
                spend: parseFloat(newFilterData.reduce((a, c) => a + parseFloat(c.spend || 0), 0).toFixed(2)),
                revenue: parseFloat(newFilterData.reduce((a, c) => a + parseFloat(c.revenue || 0), 0).toFixed(2)),
                profit: parseFloat(newFilterData.reduce((a, c) => a + parseFloat(c.profit || 0), 0).toFixed(2)),
                margin: parseFloat((
                    newFilterData.reduce((a, c) => a + parseFloat(c.profit || 0), 0) /
                    (newFilterData.reduce((a, c) => a + parseFloat(c.revenue || 0), 0) || 1) * 100
                ).toFixed(2)),
                rpc: parseFloat((
                    newFilterData.reduce((a, c) => a + parseFloat(c.rpc || 0), 0) /
                    (newFilterData.length || 1)
                ).toFixed(2)),
                cpl: parseFloat((
                    newFilterData.reduce((a, c) => a + parseFloat(c.cpl || 0), 0) /
                    (newFilterData.length || 1)
                ).toFixed(2)),
                ncpl: parseFloat((
                    newFilterData.reduce((a, c) => a + parseFloat(c.ncpl || 0), 0) /
                    (newFilterData.length || 1)
                ).toFixed(2)),
                fbleads: parseFloat(newFilterData.reduce((a, c) => a + parseFloat(c.fbleads || 0), 0).toFixed(2)),
                conversions: parseFloat(newFilterData.reduce((a, c) => a + parseFloat(c.conversions || 0), 0).toFixed(2)),
                fmargin: parseFloat((
                    newFilterData.reduce((a, c) => a + parseFloat(c.profit || 0), 0) /
                    (newFilterData.reduce((a, c) => a + parseFloat(c.spend || 0), 0) || 1) * 100
                ).toFixed(2)),
                roi: parseFloat((
                    (newFilterData.reduce((a, c) => a + parseFloat(c.revenue || 0), 0) -
                        newFilterData.reduce((a, c) => a + parseFloat(c.spend || 0), 0)) /
                    (newFilterData.reduce((a, c) => a + parseFloat(c.spend || 0), 0) || 1) * 100
                ).toFixed(2)),
                cpc: parseFloat((
                    newFilterData.reduce((a, c) => a + parseFloat(c.cpc || 0), 0) /
                    (newFilterData.length || 1)
                ).toFixed(2)),
                cpclinkclicks: parseFloat((
                    newFilterData.reduce((a, c) => a + parseFloat(c.cpclinkclicks || 0), 0) /
                    (newFilterData.length || 1)
                ).toFixed(2)),
                fbclicks: parseFloat(newFilterData.reduce((a, c) => a + parseFloat(c.fbclicks || 0), 0).toFixed(2)),
                fblinkclicks: parseFloat(newFilterData.reduce((a, c) => a + parseFloat(c.fblinkclicks || 0), 0).toFixed(2)),
                impressions: parseFloat(newFilterData.reduce((a, c) => a + parseFloat(c.impressions || 0), 0).toFixed(2)),
                ctr: parseFloat((
                    newFilterData.reduce((a, c) => a + parseFloat(c.fbclicks || 0), 0) /
                    (newFilterData.reduce((a, c) => a + parseFloat(c.impressions || 0), 0) || 1) * 100
                ).toFixed(2))
            }]);

            newRowData.current = filteredData;
            setApiStatus(false);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setApiStatus(true);
            setLoading(false);
        }
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
    const onCellClickedLive = (event) => {
        // setSelectedCell({ rowIndex: event.node.rowIndex, colId: event.column.getId() });

        if (event.colDef.field === "adsetname") {
            const value = event.value;
            if (value !== undefined) {
                const url = `/LiveHistory/LiveAdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                window.open(url, "_blank", "noopener,noreferrer");
            }
        }
    };
    // const onGridReady = (params, gridId) => {
    //     gridRef.current = params;

    //     params.api.applyColumnState({ 
    //         state: columnDefs || [], 
    //         applyOrder: true 
    //     });
    // };

    // // Use useEffect to track changes in toggleStatus
    // useEffect(() => {
    //     if (!gridRef.current) return; // Ensure gridRef exists

    //     const gridApi = gridRef.current.api;

    //     const handleDragStopped = (e) => debouncedHandleColumnMove(e, 'grid1');

    //     if (toggleStatus) {
    //         gridApi.addEventListener('dragStopped', handleDragStopped);
    //     } else {
    //         gridApi.removeEventListener('dragStopped', handleDragStopped);
    //     }

    //     return () => {
    //         gridApi.removeEventListener('dragStopped', handleDragStopped);
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
    // const handleOk = () => {
    //     if (!newColumnName || !formula) {
    //         message.error('Please fill in all fields.');
    //         return;
    //     }

    //     const lowerCaseFormula = formula.toLowerCase();

    //     try {
    //         // Define the new column definition
    //         const newColumnDef = {
    //             headerName: newColumnName,
    //             field: newColumnName.toLowerCase(),
    //             valueGetter: (params) => {
    //                 if (!params.data) return null;
    //                 try {
    //                     const originalKeys = Object.keys(params.data);
    //                     const sanitizedKeys = originalKeys.map(key => key.replace(/[^a-zA-Z_$0-9]/g, '_'));
    //                     const values = Object.values(params.data);

    //                     const keyMapping = {};
    //                     sanitizedKeys.forEach((key, index) => {
    //                         keyMapping[key] = originalKeys[index];
    //                     });

    //                     // Constructing the function safely using sanitized keys
    //                     const func = new Function(...sanitizedKeys, `return ${lowerCaseFormula}`);

    //                     // Map the values back to their original keys for function execution
    //                     const mappedValues = sanitizedKeys.map(key => params.data[keyMapping[key]]);
    //                     return func(...mappedValues);
    //                 } catch (error) {
    //                     console.error('Error evaluatings formula:', error);
    //                     return null;
    //                 }
    //             },
    //             sortable: true,
    //             filter: true,
    //             aggFunc: (params) => {
    //                 try {
    //                     const values = params.values;
    //                     const sum = values.reduce((acc, value) => acc + (value || 0), 0);

    //                     return sum; // Replace with other aggregation logic if needed
    //                 } catch (error) {
    //                     console.error('Error in aggregation function:', error);
    //                     return null;
    //                 }
    //             },
    //             cellStyle: { backgroundColor: 'skyblue' },
    //             headerCellStyle: { backgroundColor: 'skyblue', color: 'black' }
    //         };

    //         // Update the column definitions
    //         setColumnDefs((prevDefs) => [...prevDefs, newColumnDef]);
    //         columnDefs1.current = [...columnDefs1.current, newColumnDef];
    //         columnDefs2.current = [...columnDefs2.current, newColumnDef];
    //         columnDefs3.current = [...columnDefs3.current, newColumnDef];

    //         // Common function to update data
    //         const updateData = (prevData) => {
    //             return prevData.map((row) => {
    //                 const updatedRow = { ...row };
    //                 try {
    //                     const originalKeys = Object.keys(row);
    //                     const sanitizedKeys = originalKeys.map(key => key.replace(/[^a-zA-Z_$0-9]/g, '_'));
    //                     const values = Object.values(row);
    //                     // console.log(values, "values1");

    //                     const keyMapping = {};
    //                     sanitizedKeys.forEach((key, index) => {
    //                         keyMapping[key] = originalKeys[index];
    //                     });

    //                     const func = new Function(...sanitizedKeys, `return ${lowerCaseFormula}`);
    //                     const mappedValues = sanitizedKeys.map(key => row[keyMapping[key]]);
    //                     updatedRow[newColumnName.toLowerCase()] = func(...mappedValues);
    //                 } catch (error) {
    //                     console.error('Error evaluating formula for data update:', error);
    //                     updatedRow[newColumnName.toLowerCase()] = null;
    //                 }
    //                 return updatedRow;
    //             });
    //         };

    //         // Update data with the new column
    //         setRowData((prevData) => updateData(prevData));
    //         // setdailyData((prevData) => updateData(prevData));
    //         // setCampaignData((prevData) => updateData(prevData));
    //         // setKeywordData((prevData) => updateData(prevData));
    //         // setSystem1KeywordData((prevData) => updateData(prevData));

    //     } catch (error) {
    //         console.error('Error adding column:', error);
    //     }
    //     setNewColumnName('');
    //     setFormula('');
    //     setIsModalOpen(false);
    // };
    // const handleCancel = () => {
    //     setIsModalOpen(false);
    // };
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
    const gridOptions = useMemo(() => ({
        onColumnMoved: (params) => {
            // if (toggleStatus) {
            debouncedHandleColumnMove(params, 'grid1');
            // }
        },
        defaultColDef: {
            suppressMenu: true,
            headerClass: "custom-header" // Apply to all columns by default
        },
        ensureDomOrder: false
    }), []);

    document.addEventListener("DOMContentLoaded", function () {
        const gridDiv = document.getElementById("myGrid");
        new agGrid.Grid(gridDiv, gridOptions);

        // Set column definitions separately after grid initialization
        gridOptions.api.setColumnDefs(columnDefs);
    });
    const handleReFetchData = () => {
        functionCall1();
        setApiStatus(false);
    }
    // useEffect(() => {
    //     if (selectedCampaigns) {
    //         functionCall1();
    //         oneTimeFetch.current = false;
    //     }
    // }, [selectedCampaigns]);

    // useEffect(() => {
    //     if (activeTab === "2") {
    //         functionCall1();
    //     }
    // }, [selectedCampaigns, activeTab]);
    const hasRunOnce2 = useRef(false);
    const prevCampaigns2 = useRef(null);

    useEffect(() => {
        if (activeTab !== "2") return;

        const campsStr = JSON.stringify(selectedCampaigns);

        const changed =
            !hasRunOnce2.current || prevCampaigns2.current !== campsStr;

        if (changed) {
            functionCall1();
            hasRunOnce2.current = true;
            prevCampaigns2.current = campsStr;
        }
    }, [activeTab, selectedCampaigns]);

    useEffect(() => {
        // functionCall1();
        console.log(campaignStatusFilter, "campaignStatusFilter");
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

            setRowData(filteredRowObjects);
            // filteredRowObjects is the final adset-filtered grid data

            // const filteredByStatus = newRowDataForFilter.current.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
            // setRowData(filteredByStatus);
        } else {
            setRowData(newRowDataForFilter.current);
        }
    }, [campaignStatusFilter]);

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

    //     setRowData(newFilterData);
    //     // newRowDataForFilter.current = filteredData;
    //     console.log("testing 4444");
    // }
    //     , [Camapignlevelstatus]);

    useEffect(() => {
        if (refreshpage === "Refresh12") {
            handleReFetchData();
            showAdsetLevel([]);
        }
    }, [refreshpage]);

    // const onCellClickedLive = (event) => {
    //     setSelectedCell({ rowIndex: event.node.rowIndex, colId: event.column.getId() });

    //     if (event.colDef.field === "adsetname") {
    //         const value = event.value;
    //         if (value !== undefined) {
    //             const url = `/LiveHistory/LiveAdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}`;
    //             window.open(url, "_blank", "noopener,noreferrer");
    //         }
    //     }
    // };

    // const onRangeSelectionChanged = (params) => {
    //     const selected = [];
    //     const rangeSelections = params.api.getCellRanges();

    //     if (rangeSelections) {
    //         rangeSelections.forEach((range) => {
    //             const startRow = Math.min(range.startRow.rowIndex, range.endRow.rowIndex);
    //             const endRow = Math.max(range.startRow.rowIndex, range.endRow.rowIndex);
    //             const columns = range.columns.map((col) => col.getColId());

    //             for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
    //                 const node = params.api.getDisplayedRowAtIndex(rowIndex);

    //                 if (!node.group && node.data) { // ✅ Ensures only data rows are selected
    //                     if (!firstSelectedCell) {
    //                         setFirstSelectedCell({ rowIndex, colId: columns[0] }); // ✅ Ensure first cell is recorded
    //                     }
    //                     selected.push({ rowIndex, columns });
    //                 }
    //             }
    //         });
    //     }

    //     setSelectedCells(selected);
    // };


    const onCellKeyDown = (params) => {
        if (params.event.ctrlKey && params.event.key === "c") {
            params.event.preventDefault(); // Prevent default copy behavior

            // ✅ Prepare data to copy: Rows separated by \n, Columns by \t
            const copiedText = selectedCells
                .map(({ rowIndex, columns }) =>
                    columns.map((colId) => params.api.getValue(colId, params.api.getDisplayedRowAtIndex(rowIndex))).join("\t")
                )
                .join("\n"); // Each row on a new line

            navigator.clipboard.writeText(copiedText);
            params.api.copySelectedRangeToClipboard(); // ✅ Restore AG Grid blinking effect
        }
    };

    // const handleTabChange = (key) => {
    //     console.log("Switched to Tab:", key); // Debugging log
    //     setActiveTab(key);
    // };

    const items = [
        { key: '1', label: 'Campaigns', content: 'Content for Campaign data' },
        { key: '2', label: 'Adset', content: 'Content for Adset data' },
        { key: '3', label: 'Ad', content: 'Content for Ad data' }
    ];

    // const handleCarouselChange = (index) => {
    //     setActiveTab(index);
    //     // console.log(index);
    //     // console.log(parseInt(index)-1);
    //     // carouselRef.current.goTo(parseInt(index))
    //     // localStorage.setItem("activeTab", index);

    // };

    // const renderCarouselNav = () => (
    //     <StickyBox offsetTop={64} offsetBottom={20} style={{ zIndex: 1, padding: '0px', margin: '0px', paddingLeft: '12px', paddingTop: '15px' }}>
    //         <Tabs
    //             activeKey={activeTab}
    //             onChange={handleCarouselChange}
    //             items={items.map((item) => ({
    //                 key: item.key,
    //                 label: item.label,
    //             }))}
    //             className={`custom-tabs ${theme === 'dark' ? 'dark-mode-tabs' : 'light-mode-tabs'}`}
    //             style={{
    //                 backgroundColor: 'transparent',
    //                 padding: '0',
    //                 marginBottom: '0',
    //             }}
    //             tabBarStyle={{
    //                 fontSize: '12px',
    //                 padding: '0',
    //                 height: '30px',
    //                 lineHeight: '30px',
    //                 marginBottom: '-1px',
    //                 borderBottom: 'none',
    //             }}
    //         />
    //     </StickyBox>
    // );

    const uniqueByAdsetId = (arr) => {
        const map = new Map();
        arr.forEach(obj => {
            if (!map.has(obj.adsetid)) {
                map.set(obj.adsetid, obj);
            }
        });
        return Array.from(map.values());
    };

    // const onSelectionChanged = (event) => {
    //     const selectedNodes = event.api.getSelectedNodes();
    //     const selectedData = selectedNodes.map(node => node.data);
    //     console.log("Selected Adsets:", selectedData);
    //     showAdsetLevel(uniqueByAdsetId(selectedData));
    // };



    const restoreSelection = () => {
        const selectedRow = selectedAdsets[0];
        console.log("Selected Row:", selectedRow); // Debugging log
        console.log(selectedAdsets, "selectedAdsets"); // Debugging log

        if (selectedRow) {
            // Make sure getRowId is set up to use adset_id
            const rowNode = gridRef.current.api.getRowNode(selectedRow.adset_id);

            // Clear previous selection
            gridRef.current.api.deselectAll();

            // Select the specific row
            if (rowNode) {
                rowNode.setSelected(true);
            }
        }

    };

    useEffect(() => {
        if (removeSelectedAdsets === "Remove") {
            if (gridRef.current) {
                gridRef.current.api.deselectAll(); // ✅ clears selection in grid
                // showCampaignLevel([]);             // ✅ manually clears selection data
            }
        }
    }, [removeSelectedAdsets]);

    // useEffect(() => {
    //     if (gridRef.current?.api) {
    //       restoreSelection();
    //     }
    //   }, [rowData]);

    // normalize to array
    const ids = Array.isArray(newaccount)
        ? newaccount
        : (newaccount ? [newaccount] : []);

    return (
        <div>
            <div style={{ height: "100%", marginBottom: '20px', overflow: "visible" }}>
                <div style={contentStyle}>
                    {isLoading === true ? (
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
                            <Row className="header-row" style={{ width: '100%', height: "45px", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap', backgroundColor: theme === "dark" && "#4d4d4d" }}>
                                <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                                    <Space align="center">
                                        <div className="blinking-circle-1"></div>
                                        <Text style={{ paddingLeft: '3px', fontSize: '15px', color: theme === "dark" && "white" }}>Live</Text>
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
                                                open={isBulkCommentModalVisible}
                                                onCancel={() => setIsBulkCommentModalVisible(false)}
                                                className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
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
                                                onOk={saveBulkCategory}
                                                className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
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
                                                        console.log("timezones:", accountsAccess);
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
                                <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                    <Text style={{ color: theme === "dark" && "white" }}>F/N Hour: {maxHour.current}:00 / {maxNetworkHour.current}:00</Text>
                                </Col>

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
                                {/* <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                        <Text style={{ fontWeight: '600' }}>
                                            Cron/Acc status: {cronStatus.current} /{' '}
                                            <span style={{ color: accountStatus.current === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
                                                {accountStatus.current}
                                            </span>
                                        </Text>
                                    </Col> */}
                                <Col xs={24} sm={24} md={4} lg={2} style={{ flex: "0.2 0 auto" }}>
                                    <Tooltip
                                        title={
                                            <div style={{ fontSize: '13px' }}>
                                                <div>Fb status: {`${fbCron.current?.toLowerCase()}`}</div>
                                                <div>Rev status: {`${revenueCron.current?.toLowerCase()}`}</div>
                                                <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                                                    Cron status: {cronStatus.current?.toLowerCase()}
                                                    {/* <span style={{ color: accountStatus.current === 'Active' ? '#91C25F' : '#EC7117', }}>
                                                    {accountStatus.current}
                                                </span> */}
                                                </Text>
                                                <div>Account:
                                                    <span style={{ marginLeft: '3px', color: accountStatus.current === 'Active' ? '#91C25F' : '#EC7117', }}>
                                                        {accountStatus.current}
                                                    </span>
                                                </div>
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
                                        <InfoCircleOutlined style={{ fontSize: '18px', cursor: 'pointer', marginRight: '10px', color: "#91C25F" }} className="black-icon-info" />
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
                                    <Button type="primary" style={{ backgroundColor: '#91C25F', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined className="black-icon" />} onClick={onBtExport1} />
                                    {/* </Tooltip> */}
                                </Col>
                            </Row>
                            {rowData?.length > 0 ?
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
                                            ref={gridRef}
                                            className='custom-grid'
                                            rowHeight={30}
                                            context={context}
                                            rowData={memorizedRowData}
                                            // immutableData={true}
                                            // getRowId={params => params.data.id}
                                            rowSelection='multiple'
                                            groupSelectsChildren={true} // ✅ Selects all children when a group is selected
                                            suppressRowClickSelection={true}
                                            columnDefs={memorizedColumnDef}
                                            defaultColDef={{ ...defaultColDef, suppressMenu: true }}
                                            // onCellClicked={onCellClickedLive}
                                            pagination={true}
                                            paginationPageSize={200}
                                            paginationPageSizeSelector={[20, 40, 60, 80, 100, 150, 200]}
                                            suppressAggFuncInHeader={true}
                                            getMainMenuItems={getMainMenuItems}
                                            useValueFormatterForExport={true}
                                            // onRangeSelectionChanged={onRangeSelectionChanged} // ✅ Captures range selection
                                            // onCellKeyDown={onCellKeyDown}
                                            // domLayout="normal"
                                            // groupIncludeTotalFooter={rowData.length > 0 ? true : false}
                                            // groupIncludeFooter={rowData.length > 0 ? true : false}
                                            onSelectionChanged={onSelectionChanged}
                                            autoGroupColumnDef={autoGroupColumnDefLive}
                                            onGridReady={(params) => onGridReady(params, 'grid1', gridRef)}
                                            gridOptions={{
                                                ...gridOptions,
                                                ensureDomOrder: false,
                                                enableCharts: true,
                                                suppressRowClickSelection: true,
                                                suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                                groupSelectsChildren: true, // ✅ Ensures child rows are selected properly
                                            }}
                                            frameworkComponents={{ GroupCellRenderer }}
                                            groupDisplayType='multipleColumns'
                                            // rowGroupPanelShow='always'
                                            // onFilterChanged={onFilterChanged} // Use the custom filter handler
                                            pinnedBottomRowData={liveFixedFooter}
                                            suppressCellSelection={true}
                                            getRowStyle={(params) => {
                                                if (params.node.rowPinned) {

                                                    return {
                                                        // fontWeight: "bold",
                                                        backgroundColor: theme === "dark" ? "#1a1918" : "#fff", // Dark mode or light mode
                                                        color: theme === "dark" ? "#fff" : "#000",
                                                        height: '30px'
                                                    };
                                                }
                                                return null; // Keep other row styles unchanged
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
                                                    if (node.data && node.data.campaignname) {
                                                        const normalizedCampaign = node.data.campaignname.trim().toLowerCase();

                                                        // Apply search and filter conditions
                                                        if (
                                                            normalizedCampaign.startsWith(normalizedInput) ||
                                                            normalizedCampaign.includes(normalizedInput) ||
                                                            normalizedCampaign.endsWith(normalizedInput)
                                                        ) {
                                                            filteredData.push(node.data);
                                                        }
                                                    }
                                                });

                                                const updatedFooter = [
                                                    {
                                                        // [`${newtime}Date`]: 'Totals',
                                                        campaignName: 'Total',
                                                        actions: "",
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
                                                        ctr: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0) * 100).toFixed(2))
                                                    },
                                                ];

                                                setLiveFixedFooter(updatedFooter);
                                            }}
                                        />
                                    </div>


                                </div>
                                :
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
                                            ref={gridRef}
                                            className='custom-grid'
                                            rowHeight={30}
                                            context={context}
                                            rowData={[]}
                                            rowSelection='multiple'
                                            groupSelectsChildren={true} // ✅ Selects all children when a group is selected
                                            suppressRowClickSelection={true}
                                            columnDefs={memorizedColumnDef}
                                            defaultColDef={{ ...defaultColDef, suppressMenu: true }}
                                            // onCellClicked={onCellClickedLive}
                                            pagination={true}
                                            paginationPageSize={200}
                                            paginationPageSizeSelector={[20, 40, 60, 80, 100, 150, 200]}
                                            suppressAggFuncInHeader={true}
                                            getMainMenuItems={getMainMenuItems}

                                            // onRangeSelectionChanged={onRangeSelectionChanged} // ✅ Captures range selection
                                            // onCellKeyDown={onCellKeyDown}
                                            // domLayout="normal"
                                            // groupIncludeTotalFooter={rowData.length > 0 ? true : false}
                                            // groupIncludeFooter={rowData.length > 0 ? true : false}
                                            onSelectionChanged={onSelectionChanged}
                                            autoGroupColumnDef={autoGroupColumnDefLive}
                                            onGridReady={(params) => onGridReady(params, 'grid1', gridRef)}
                                            gridOptions={{
                                                ...gridOptions,
                                                ensureDomOrder: false,
                                                enableCharts: true,
                                                suppressRowClickSelection: true,
                                                suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                                groupSelectsChildren: true, // ✅ Ensures child rows are selected properly
                                            }}
                                            frameworkComponents={{ GroupCellRenderer }}
                                            groupDisplayType='multipleColumns'
                                            // rowGroupPanelShow='always'
                                            // onFilterChanged={onFilterChanged} // Use the custom filter handler
                                            pinnedBottomRowData={liveFixedFooter}
                                            suppressCellSelection={true}
                                            getRowStyle={(params) => {
                                                if (params.node.rowPinned) {

                                                    return {
                                                        // fontWeight: "bold",
                                                        backgroundColor: theme === "dark" ? "#1a1918" : "#fff", // Dark mode or light mode
                                                        color: theme === "dark" ? "#fff" : "#000",
                                                        height: '30px'
                                                    };
                                                }
                                                return null; // Keep other row styles unchanged
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
                                                    if (node.data && node.data.campaignname) {
                                                        const normalizedCampaign = node.data.campaignname.trim().toLowerCase();

                                                        // Apply search and filter conditions
                                                        if (
                                                            normalizedCampaign.startsWith(normalizedInput) ||
                                                            normalizedCampaign.includes(normalizedInput) ||
                                                            normalizedCampaign.endsWith(normalizedInput)
                                                        ) {
                                                            filteredData.push(node.data);
                                                        }
                                                    }
                                                });

                                                const updatedFooter = [
                                                    {
                                                        // [`${newtime}Date`]: 'Totals',
                                                        campaignName: 'Total',
                                                        actions: "",
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
                                                        ctr: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0) * 100).toFixed(2))
                                                    },
                                                ];

                                                setLiveFixedFooter(updatedFooter);
                                            }}
                                        />
                                    </div>


                                </div>
                            }
                        </div>

                    ) : <div style={{ backgroundColor: theme === "dark" && "#333" }}>
                        <Result
                            className={theme === 'dark' ? 'dark-result' : 'light-result'}
                            icon={<SmileOutlined />}
                            title={`No LiveData for ${newaccount} from ${startDate} to ${endDate}`}
                        // extra={<Button type="primary">Next</Button>}
                        />
                    </div>}
                </div>
            </div>

        </div>
    );

};

export default AdsetLevelReports;
