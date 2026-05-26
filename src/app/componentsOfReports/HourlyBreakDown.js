import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import React from 'react';
import moment from 'moment-timezone';
import { Input, Button, Row, Col, Typography, Result, Modal, message, Switch, Tabs, Spin, Badge, Dropdown, Tooltip, Space, Menu } from 'antd';
import {
    GlobalOutlined, NumberOutlined, InfoCircleOutlined, DownloadOutlined, SmileOutlined, CopyOutlined, EditOutlined, PushpinOutlined, PlusOutlined
} from '@ant-design/icons';
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

const HourlyCampaignLevelReports = ({ functionCallForCommnets, context, functionCallForCampaigns, startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, campaignComments, setCampaignComments, Camapignlevelstatus, setCamapignlevelstatus, changeRRefrst, debouncedHandleColumnMove, userdetails, refreshComments, refreshpage, getMainMenuItems, toggleStatus, handleChangeToggle, tabStatus, showCampaignLevel, removeSelectedCampaigns, moveToNextTab, accountsAccess, commentsMap }) => {
    // console.log(columnDefs, "columnDefs");
    // console.log("campaign acconts:", newaccount);
    // console.log('accountAccess:', accountsAccess);
    // console.log(campaignComments);
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

    // console.log(apiStatus, "apiStatus");


    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedCells, setSelectedCells] = useState([]); // Store selected cell positions
    const [firstSelectedCell, setFirstSelectedCell] = useState(null); // Store the first selected cell
    const [activeTab, setActiveTab] = useState("1");

    const timezone = useRef();

    // console.log("timzones:", timezone);

    const cronStatus = useRef();

    const accountStatus = useRef();

    let fbCron = useRef();

    let revenueCron = useRef();

    const maxHour = useRef();

    const maxNetworkHour = useRef();

    const gridRef = useRef();


    const newRowData = useRef();

    const oneTimeFetch = useRef(true);

    const [selectedCampaigns, setSelectedCampaigns] = useState([]);

    const memorizedColumnDef = useMemo(() => columnDefs, [columnDefs]);

    const memorizedRowData = useMemo(() => {
        let filtered = rowData || [];

        const normalizedInput = inputValue.trim().toLowerCase();
        const normalizedInside = insideInput.trim().toLowerCase();

        // 1️⃣ FIRST FILTER → by inputValue (only adname)
        if (normalizedInput) {
            filtered = filtered.filter((each) => {
                const campaignname = (each?.campaignname || "").trim().toLowerCase();
                const accountNumber = (each?.accountNumber || "").toString().trim().toLowerCase();
                const campaignId = (each?.campaignid || "").toString().trim().toLowerCase();
                return (
                    campaignname.startsWith(normalizedInput) ||
                    campaignname.includes(normalizedInput) ||
                    campaignname.endsWith(normalizedInput) ||
                    accountNumber.includes(normalizedInput) ||
                    campaignId.includes(normalizedInput)
                );
            });
        }

        // 2️⃣ SECOND FILTER → by insideInput (all fields)
        if (normalizedInside) {
            filtered = filtered.filter((each) => {
                const campaignname = (each?.campaignname || "").trim().toLowerCase();
                const accountNumber = (each?.accountNumber || "").toString().trim().toLowerCase();
                const campaignId = (each?.campaignid || "").toString().trim().toLowerCase();

                return (
                    campaignname.includes(normalizedInside) ||
                    accountNumber.includes(normalizedInside) ||
                    campaignId.includes(normalizedInside)
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
    const [campaignIds, setCampaignIds] = useState([]);
    const [adLevelCreatives, setAdLevelCreatives] = useState([]);
    const [showAllHours, setShowAllHours] = useState(false);

    useEffect(() => {
        const api = gridRef.current?.api;
        if (!api) return;

        if (inputValue.trim() === '' && selectedCampaigns.length > 0) {
            const selectedIds = selectedCampaigns.map(item => item.campaignid);
            const selectedOnly = rowData.filter(item => selectedIds.includes(item.campaignid));


            api.applyTransaction({ replace: true, data: selectedOnly });

            setTimeout(() => {
                api.forEachNode((node) => {
                    if (selectedIds.includes(node.data?.campaignid)) {
                        node.setSelected(true);
                    }
                });
            }, 0);
        } else if (inputValue.trim() === '' && selectedCampaigns.length === 0) {
            api.applyTransaction({ replace: true, data: rowData });
        }
    }, [inputValue, selectedCampaigns, rowData]);


    // console.log(memorizedColumnDef, "memorizedColumnDef");
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
    const onBtExport1 = async () => {
        // console.log(gridRef.current.api, "in");
        const Details = {
            network: newRevenuePratner,
            account: newaccount,
            dateRange: `From ${startDate} to ${endDate}`,
            type: "Live",
            email: userdetails?.email,
            time: moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A")
        };
        const campaignIdNameMap = {};

        gridRef.current.api.forEachLeafNode(node => {
            const d = node.data;
            if (d?.campaignid && d?.campaignname) {
                campaignIdNameMap[String(d.campaignid)] = d.campaignname;
            }
        });
        gridRef.current.api.exportDataAsCsv({
            processRowGroupCallback: (params) => {
                return campaignIdNameMap[String(params.node.key)] || params.node.key;
            },
            processCellCallback: (params) => {
                const colId = params.column.getColId();

                if (colId === 'campaignid') {
                    return params.data?.campaignname || params.value;
                }

                return params.value;
            }
        });
        try {
            await apiClient.post('/UserExportActivities/', { Details });
        } catch (err) {
            console.error("Export activity logging failed", err);
        }
    };

    const openBulkCategoryModal = () => {
        setBulkOpen(true);
        setBulkCategory("");
    };
    const autoGroupColumnDefLive = {
        headerName: 'Hourly Breakdown',
        minWidth: 40,
        pinned: 'left',
        sortable: true, // Enable sorting
        unSortIcon: true,
        sort: 'asc', // Default sort order
        headerClass: 'ag-center-header',
        valueFormatter: (params) => {
            // GROUP ROW
            if (params.node?.group) {
                const firstChild = params.node.childrenAfterGroup?.[0]?.data;
                return firstChild?.campaignname ?? params.node.key;
            }

            // LEAF ROW
            return params.value;
        },
        // comparator: (groupKeyA, groupKeyB, nodeA, nodeB) => {

        //     // get first leaf row of group A
        //     const leafA = nodeA.allLeafChildren?.[0]?.data;
        //     const leafB = nodeB.allLeafChildren?.[0]?.data;

        //     // safety
        //     if (!leafA) return 1;
        //     if (!leafB) return -1;

        //     const campaignidA = leafA.campaignid;
        //     const accountA = leafA.accountNumber;
        //     const campaignidB = leafB.campaignid;
        //     const accountB = leafB.accountNumber;

        //     // find pinned record for A
        //     const recA = campaignComments.find(c =>
        //         String(c.Account) === String(accountA) &&
        //         String(c.campaignid) === String(campaignidA) &&
        //         c.level === "campaign"
        //     );

        //     const recB = campaignComments.find(c =>
        //         String(c.Account) === String(accountB) &&
        //         String(c.campaignid) === String(campaignidB) &&
        //         c.level === "campaign"
        //     );

        //     const pinnedA = recA?.pinned ?? false;
        //     const pinnedB = recB?.pinned ?? false;

        //     // 1️⃣ PINNED FIRST when sorting ASC
        //     if (pinnedA !== pinnedB) return pinnedA ? -1 : 1;

        //     // 2️⃣ fallback: alphabetical by group key
        //     return String(groupKeyA).localeCompare(String(groupKeyB));
        // },
        comparator: (groupKeyA, groupKeyB, nodeA, nodeB) => {

            const leafA = nodeA.allLeafChildren?.[0]?.data;
            const leafB = nodeB.allLeafChildren?.[0]?.data;

            if (!leafA) return 1;
            if (!leafB) return -1;

            const hourA = leafA.fb_hour; // 👈 adjust if field name differs
            const hourB = leafB.fb_hour;

            // Try numeric sorting (best for hours like 0–23)
            const numA = Number(hourA);
            const numB = Number(hourB);

            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }

            // fallback (if values are strings like "01:00", "12 PM", etc.)
            return String(groupKeyA).localeCompare(String(groupKeyB));
        },
        cellRenderer: "agGroupCellRenderer", // ✅ Use AG Grid's built-in renderer
        cellRendererParams: {
            // checkbox: true,
            suppressCount: false,
            innerRenderer: (params) => {
                if (params.node.footer) {
                    return 'Total';
                }
                // console.log(params.value, "value");
                // console.log(params.node.childrenAfterGroup[0]?.data, "params in campaign level");
                const leafData = params.node.group
                    ? params.node.allLeafChildren?.[0]?.data
                    : params.data;

                const currentCampaignId = leafData?.campaignid;
                const currentAccount = leafData?.accountNumber;

                const accountsParam = Array.isArray(newaccount) ? newaccount.map(String) : [String(newaccount)];
                let accountNumberToPassHistoryPage;

                const campaignName = (() => {
                    if (params.node.childrenAfterGroup?.length > 0) {
                        return params.node.childrenAfterGroup[0]?.data?.["fb-hour"] || params.node.key;
                    }
                    return params.node.key; // fallback to campaignid
                })();

                const firstColumnValue = campaignName;

                const valueWithCount = `${firstColumnValue}`;

                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
                                // onClick={() => {
                                //     const rowData = params.node.group
                                //         ? params.node.childrenAfterGroup?.[0]?.data
                                //         : params.node.data;

                                //     const rowNode = params.api.getRowNode(params.node.id);

                                //     // Clear existing selections (for single-select mode)
                                //     params.api.deselectAll();

                                //     // Set this row as selected
                                //     if (rowNode) {
                                //         rowNode.setSelected(true);
                                //     }


                                //     showCampaignLevel([rowData]);
                                //     moveToNextTab("2");

                                //     // console.log("Clicked row data:", [rowData]);
                                // }}
                                style={{ cursor: 'pointer' }}
                            >
                                {valueWithCount}
                            </span>
                        </Tooltip>
                    </div>
                );
            }
        },
        processCellForClipboard: (params) => {
            if (params.node.group) {
                // console.log("Processing group column for copy..."); // Debugging log

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

    function getFBHour(data, startDate, endDate) {
        const start = new Date(startDate).toISOString().slice(0, 10);
        const end = new Date(endDate).toISOString().slice(0, 10);

        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .slice(0, 10);

        const fbData = data.filter(
            item => item.fbCron && item.fbCron !== "Failed" && item.hour
        );
        if (!fbData.length) return "00";
        if (start === end && start === today) {
            const currentHour = new Date().getHours();

            const todayHours = fbData
                .map(i => Number(i.hour))
                .filter(h => h <= currentHour);

            return todayHours.length
                ? String(Math.max(...todayHours)).padStart(2, "0")
                : "00";
        }
        if (start === end && start === yesterday) {
            return findMaxHour(fbData);
        }
        return findMaxHour(fbData);
    }

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

    const functionCall1 = async () => {
        try {
            setLoading(true);

            const collectionName =
                newRevenuePratner === "FB_DomainActive"
                    ? "Facebook_DActive_Names"
                    : newtworkCollections[newRevenuePratner];

            // --- ALWAYS use CampaignLevelAccounts (single OR multiple) ---
            // Normalize to array of strings
            const accountsParam = Array.isArray(newaccount)
                ? newaccount.map(String)
                : [String(newaccount)];

            // Build GET query with repeated accountNumbers keys
            const params = new URLSearchParams({
                dateStart: startDate,
                dateEnd: endDate,
                timezone: newtime,
                status: tabStatus,
                network: collectionName,
            });
            accountsParam.forEach(acc => params.append("accountNumbers", acc));

            //   const resp = await apiClient.post(`/CampaignLevelAccounts?${params.toString()}`);
            const resp = await apiClient.post('/CampaignLevelAccountsHourly', {
                dateStart: startDate,
                dateEnd: endDate,
                timezone: newtime,
                status: tabStatus,
                network: collectionName,
                accountNumbers: accountsParam,   // <= ['111', '222'] or ['111'] for single
            });


            const mainData1 = resp.data;

            const campaignsByAccount = {};

            mainData1.forEach(item => {
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

            // --- keep your existing logic below this line unchanged ---
            const mainData = mainData1;
            const specifiedTimeZone = selectTimezone[newtime];

            const filteredData = mainData && mainData.length > 0 ?
                mainData.map((eachData) => {
                    let revenueData;
                    if (eachData.estimated_revenue === 0 || isNaN(eachData.estimated_revenue)) {
                        revenueData = 0;
                    } else if (eachData.estimated_revenue === undefined) {
                        revenueData = 0;
                    } else if (eachData.estimated_revenue === null) {
                        revenueData = 0;
                    } else {
                        revenueData = parseFloat(eachData.estimated_revenue).toFixed(2);
                    }
                    const profit = (revenueData - eachData.spend).toFixed(2);
                    let margin;
                    if (revenueData === 0) {
                        margin = "0";
                    } else {
                        margin = `${Math.round((((revenueData - eachData.spend) / revenueData) * 100) * 100) / 100}%`;
                    }
                    const rpc = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((revenueData / eachData.conversions) * 100) / 100;

                    let cpl;
                    if (eachData.fbLeads == 0) {
                        cpl = 0;
                    } else {
                        cpl = Math.round((eachData.spend / eachData.fbLeads) * 100) / 100;
                    }
                    const ncpl = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((eachData.spend / eachData.conversions) * 100) / 100;

                    const relatedComment = campaignComments.find(comment => comment.campaignname === eachData.campaign_name);
                    const category = campaignComments.find(campaign => campaign.campaignid === eachData.campaign_id && campaign.Account === eachData.accountNumber && campaign.level === "campaign");
                    const campaign_date = Camapignlevelstatus.find(campaign => campaign.campaign_id === eachData.campaign_id && campaign.accountNumber === eachData.accountNumber);
                    const campaignPinned = campaignComments.find(campaign => campaign.campaignname === eachData.campaign_name && campaign.Account === eachData.accountNumber && campaign.campaign_id === eachData.campaign_id);
                    const fbLClicks = parseInt(eachData.fbLinkClicks, 10);
                    const spend = parseFloat(eachData.spend);
                    const cpcLinkClicks = isNaN(fbLClicks) || fbLClicks === 0 ? 0 : Math.round((spend / fbLClicks) * 100) / 100;
                    const campaignObjectStatus = Camapignlevelstatus
                        .find(item =>
                            String(item.campaign_id) === String(eachData.campaign_id) &&
                            String(item.accountNumber) === String(eachData.accountNumber)
                        );
                    return {
                        accountNumber: eachData.accountNumber,
                        campaignname: eachData.campaign_name,
                        adsetname: eachData.adsetName,
                        date: eachData[specifiedTimeZone],
                        'fb-hour': eachData.hour || "",
                        'mnet-hour': eachData.updatedHour || "",
                        spend: parseFloat(eachData.spend).toFixed(2),
                        revenue: revenueData ? revenueData : 0,
                        profit: parseFloat(profit),
                        fbleads: parseInt(eachData.fbLeads),
                        conversions: eachData.conversions !== null && eachData.conversions !== 0 ? parseInt(eachData.conversions) : 0,
                        cpc: parseFloat(eachData.cpc),
                        cpclinkclicks: cpcLinkClicks,
                        fbclicks: parseInt(eachData.fbClicks),
                        fblinkclicks: parseInt(eachData.fbLinkClicks),
                        impressions: parseInt(eachData.impressions),
                        rpc: parseFloat(rpc),
                        cpl: parseFloat(cpl),
                        ncpl: parseFloat(ncpl),
                        adsetid: eachData.adset_id,
                        campaignid: eachData.campaign_id,
                        timezone: eachData[newtime] || "",
                        comment: relatedComment ? relatedComment.comment : "",
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
                        cronStatus: eachData.cronStatus,
                        accountStatus: eachData.accountStatus,
                        category: category?.category || "",
                        campaignStatus: campaign_date?.status || "",
                        pinned: campaignPinned ? campaignPinned.pinned : false,
                        fbStatus: campaignObjectStatus?.status,
                    };
                })
                : null;

            const getFbValue = mainData.filter(item => item.fbCron !== null && item.fbCron !== 'Failed');
            const getRevenueValue = mainData.filter(item => item.revenueCron !== null && item.revenueCron !== 'Failed');

            if (mainData.length > 1) {
                const findRevenueObject = mainData.find(item => item.estimated_revenue >= 0);
                // console.log(findRevenueObject, findRevenueObject.accountTimezone, "testing  ")
                timezone.current = findRevenueObject.accountTimezone;
                accountStatus.current = findRevenueObject.accountStatus;
                cronStatus.current = mainData[0].cronStatus;

                fbCron.current = getFbValue[0]?.fbCron ? getFbValue[0].fbCron : 'Failed';
                revenueCron.current = getRevenueValue[0]?.revenueCron ? getRevenueValue[0].revenueCron : 'Failed';

                // maxHour.current = findMaxHour(mainData);
                maxHour.current = getFBHour(mainData, startDate, endDate);
                maxNetworkHour.current = getMaxHour(mainData);
            }

            let newFilterData;
            if (campaignStatusFilter !== "All") {
                newFilterData = filteredData.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
            }
            else {
                newFilterData = filteredData;
            }
            if (!showAllHours) {
                newFilterData = newFilterData.filter((item) => {
                    const fbHour = Number(item["fb-hour"]);

                    const revenueHour = Number(
                        String(item["mnet-hour"] || "0").split(":")[0]
                    );

                    if (isNaN(fbHour) || isNaN(revenueHour)) {
                        return false;
                    }

                    return fbHour <= revenueHour;
                });
            }

            setRowData(newFilterData);
            newRowDataForFilter.current = filteredData;

            setLiveFixedFooter([{
                campaignName: 'Total',
                actions: "",
                spend: parseFloat(newFilterData.reduce((acc, curr) => acc + parseFloat(curr.spend || 0), 0).toFixed(2)),
                revenue: parseFloat(newFilterData.reduce((acc, curr) => acc + parseFloat(curr.revenue || 0), 0).toFixed(2)),
                profit: parseFloat(newFilterData.reduce((acc, curr) => acc + parseFloat(curr.profit || 0), 0).toFixed(2)),
                margin: parseFloat((newFilterData.reduce((acc, curr) => acc + parseFloat(curr.profit || 0), 0) / (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.revenue || 0), 0) || 1) * 100).toFixed(2)),
                rpc: parseFloat((newFilterData.reduce((acc, curr) => acc + parseFloat(curr.rpc || 0), 0) / (newFilterData.length || 1)).toFixed(2)),
                cpl: parseFloat((newFilterData.reduce((acc, curr) => acc + parseFloat(curr.cpl || 0), 0) / (newFilterData.length || 1)).toFixed(2)),
                ncpl: parseFloat((newFilterData.reduce((acc, curr) => acc + parseFloat(curr.ncpl || 0), 0) / (newFilterData.length || 1)).toFixed(2)),
                fbleads: parseFloat(newFilterData.reduce((acc, curr) => acc + parseFloat(curr.fbleads || 0), 0).toFixed(2)),
                conversions: parseFloat(newFilterData.reduce((acc, curr) => acc + parseFloat(curr.conversions || 0), 0).toFixed(2)),
                fmargin: parseFloat((newFilterData.reduce((acc, curr) => acc + parseFloat(curr.profit || 0), 0) / (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.spend || 0), 0) || 1) * 100).toFixed(2)),
                roi: parseFloat(((newFilterData.reduce((acc, curr) => acc + parseFloat(curr.revenue || 0), 0) - newFilterData.reduce((acc, curr) => acc + parseFloat(curr.spend || 0), 0)) / (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.spend || 0), 0) || 1) * 100).toFixed(2)),
                cpc: parseFloat((newFilterData.reduce((acc, curr) => acc + parseFloat(curr.cpc || 0), 0) / (newFilterData.length || 1)).toFixed(2)),
                cpclinkclicks: parseFloat((newFilterData.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks || 0), 0) / (newFilterData.length || 1)).toFixed(2)),
                fbclicks: parseFloat(newFilterData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks || 0), 0).toFixed(2)),
                fblinkclicks: parseFloat(newFilterData.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks || 0), 0).toFixed(2)),
                impressions: parseFloat(newFilterData.reduce((acc, curr) => acc + parseFloat(curr.impressions || 0), 0).toFixed(2)),
                ctr: parseFloat((newFilterData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks || 0), 0) / (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.impressions || 0), 0) || 1) * 100).toFixed(2))
            }]);

            newRowData.current = filteredData;
            setApiStatus(false);
            setLoading(false);
        } catch (error) {
            setApiStatus(true);
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     console.log(campaignIds, "campaignIds updated");
    // }, [campaignIds]);
    // useEffect(() => {
    //     if (!campaignIds || Object.keys(campaignIds).length === 0) return;

    //     const fetchCreatives = async () => {
    //         const token = localStorage.getItem("token");
    //         try {
    //             const creativesData = await sendCreativesRequest(
    //                 campaignIds,
    //                 token
    //             );

    //             console.log('Final creatives data:', creativesData);
    //             setAdLevelCreatives(creativesData)

    //         } catch (err) {
    //             console.error('Creatives fetch failed', err);
    //         }
    //     };

    //     fetchCreatives();
    // }, [campaignIds]);

    const sendCreativesRequest = async (campaignIdsByAccount, token) => {
        if (!campaignIdsByAccount || typeof campaignIdsByAccount !== "object") return [];
        const items = Object.entries(campaignIdsByAccount).map(
            ([accountNumber, campaignIds]) => ({
                accountNumber: String(accountNumber),
                campaignIds: campaignIds.map(String)
            })
        );

        const resp = await apiClient.post(
            "https://prodapis.adsgoat.in/Creatives/get",
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
    //     if (campaignStatusFilter && Camapignlevelstatus.length > 0) {
    //         console.log("test1");
    //         functionCall1();
    //     }
    // }, []);

    useEffect(() => {
        if (campaignStatusFilter && Camapignlevelstatus.length > 0) {
            functionCall1();
        }
    }, [showAllHours]);

    useEffect(() => {
        // functionCall1();
        // console.log(campaignStatusFilter, "campaignStatusFilter");
        // console.log(campaignStatusFilter?.toUpperCase())
        if (campaignStatusFilter !== "All") {

            // Filter grid rows by campaign status
            const campaignStatusMap = new Map(
                Camapignlevelstatus.map(item => [
                    String(item.campaign_id),
                    item.status?.toUpperCase()
                ])
            );

            const filteredRowObjects = newRowDataForFilter.current.filter(row =>
                campaignStatusMap.get(String(row.campaignid)) ===
                campaignStatusFilter?.toUpperCase()
            );

            // filteredRowObjects is the final filtered grid data

            setRowData(filteredRowObjects);
        } else {
            // console.log(newRowDataForFilter.current)
            setRowData(newRowDataForFilter.current);
        }
    }, [campaignStatusFilter]);



    useEffect(() => {
        if (refreshpage === "Refresh11") {
            // console.log("test2");
            handleReFetchData();
            showCampaignLevel([]);
        }
    }
        , [refreshpage]);


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

    const handleTabChange = (key) => {
        // console.log("Switched to Tab:", key); // Debugging log
        setActiveTab(key);
    };

    const items = [
        { key: '1', label: 'Campaigns', content: 'Content for Campaign data' },
        { key: '2', label: 'Adset', content: 'Content for Adset data' },
        { key: '3', label: 'Ad', content: 'Content for Ad data' }
    ];

    const handleCarouselChange = (index) => {
        setActiveTab(index);

    };

    const renderCarouselNav = () => (
        <StickyBox offsetTop={64} offsetBottom={20} style={{ zIndex: 1, padding: '0px', margin: '0px', paddingLeft: '12px', paddingTop: '15px' }}>
            <Tabs
                activeKey={activeTab}
                onChange={handleCarouselChange}
                items={items.map((item) => ({
                    key: item.key,
                    label: item.label,
                }))}
                className={`custom-tabs ${theme === 'dark' ? 'dark-mode-tabs' : 'light-mode-tabs'}`}
                style={{
                    backgroundColor: 'transparent',
                    padding: '0',
                    marginBottom: '0',
                }}
                tabBarStyle={{
                    fontSize: '12px',
                    padding: '0',
                    height: '30px',
                    lineHeight: '30px',
                    marginBottom: '-1px',
                    borderBottom: 'none',
                }}
            />
        </StickyBox>
    );


    const uniqueByCampaignId = (arr) => {
        const map = new Map();
        arr.forEach(obj => {
            if (!map.has(obj.campaignid)) {
                map.set(obj.campaignid, obj);
            }
        });
        return Array.from(map.values());
    };


    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);

        // Store selection persistently
        setSelectedCampaigns(selectedData);

        // Keep your existing functionality
        showCampaignLevel(uniqueByCampaignId(selectedData));
        const leafCampaignsData = selectedNodes
            .filter(node => !node.group && node.data)
            .map(node => ({
                campaignid: node.data.campaignid,
                campaignname: node.data.campaignname,
                accountNumber: node.data.accountNumber,
                fbStatus: node.data.fbStatus,
                category: node.data.category,
                level: "campaign",
            }))
            .filter(item => item.campaignid && item.campaignname);


        const uniqueLeafCampaigns = Array.from(
            new Map(
                leafCampaignsData.map(item => [`${item.campaignid}_${item.accountNumber}`, item])
            ).values()
        );


        setLeafCampaigns(uniqueLeafCampaigns);

        // console.log(" Selected unique campaigns:", uniqueLeafCampaigns);
    };





    useEffect(() => {
        if (removeSelectedCampaigns === "Remove") {
            if (gridRef.current) {
                gridRef.current.api.deselectAll(); // ✅ clears selection in grid
                // showCampaignLevel([]);             // ✅ manually clears selection data
            }
        }
    }, [removeSelectedCampaigns]);

    const onChangeStatusUpdate = (key) => {

    }

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
                    ) : newRowDataForFilter.current?.length > 0 ?
                        <div>
                            <Row className="header-row" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap', backgroundColor: theme === "dark" && "#4d4d4d" }}>
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
                                                onOk={handleBulkStatusSubmit}
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
                                                    <div style={{ display: "flex", gap: "14px", color: theme === "dark" ? "white" : "black" }}>
                                                        <span
                                                            style={{ cursor: "pointer", fontSize: "18px" }}
                                                            onClick={() => handleBulkSmartPin("pin")}
                                                        >
                                                            📌
                                                        </span>
                                                        <span
                                                            style={{ cursor: "pointer", fontSize: "18px" }}
                                                            onClick={() => handleBulkSmartPin("unpin")}
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
                                                            handleSmartCommentSubmit();
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
                                                onCancel={() => setBulkOpen(false)}
                                                className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
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
                                            Time zone: {timezone.current}
                                            {/* {ids[0] ? `${timezone.current ?? "-"}` : "-"} */}
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


                                <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                    <Text style={{ color: theme === "dark" && "white" }}>F/N Hour: {maxHour.current}:00 / {maxNetworkHour.current}:00</Text>
                                </Col>
                                {/* <Col>
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
                                </Col> */}
                                {/* <Col>
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
                                </Col> */}
                                 <Col>
                                    <Switch
                                        checked={showAllHours}
                                        onChange={(checked) => setShowAllHours(checked)}
                                        checkedChildren="Spend"
                                        unCheckedChildren="Revenue"
                                        style={{
                                            backgroundColor: showAllHours ? "#91c25f" : undefined
                                        }}
                                    />
                                </Col>
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
                               
                                <Col xs={24} sm={24} md={4} lg={2} style={{ flex: '0.2 0 auto' }}>
                                    {/* <Tooltip title="Export to CSV"> */}
                                    <Button type="primary" style={{ backgroundColor: '#91C25F', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined className="black-icon" />} onClick={onBtExport1} />
                                    {/* </Tooltip> */}
                                </Col>
                            </Row>
                            {rowData.length > 0 ?
                                (
                                    // <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>



                                    <div
                                        className={`ag-theme-alpine ag-container ${gridThemeClass}`}
                                    >
                                        <div className='table-container'>
                                            <AgGridReact
                                                ref={gridRef}
                                                suppressReactUi={true}
                                                rowHeight={30}
                                                className='custom-grid'
                                                context={{
                                                    ...context,
                                                    adLevelCreatives,
                                                }}
                                                rowData={memorizedRowData}
                                                rowSelection='multiple'
                                                columnDefs={memorizedColumnDef}
                                                defaultColDef={{ ...defaultColDef, suppressMenu: true }}
                                                onCellClicked={onCellClickedLive}
                                                pagination={true}
                                                paginationPageSize={200}
                                                paginationPageSizeSelector={[20, 40, 60, 80, 100, 150, 200]}
                                                suppressAggFuncInHeader={true}
                                                getMainMenuItems={getMainMenuItems}
                                                groupSelectsChildren={true} // ✅ Selects all children when a group is selected
                                                suppressRowClickSelection={true} // ✅ Prevents selection on row click, only via checkbox
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



                                    // </div>
                                ) : <div style={{ backgroundColor: theme === "dark" && "#333" }}>
                                    <div
                                        className={`ag-theme-alpine ag-container ${gridThemeClass}`}
                                    >
                                        <div className='table-container'>
                                            <AgGridReact
                                                ref={gridRef}
                                                suppressReactUi={true}
                                                rowHeight={30}
                                                className='custom-grid'
                                                // context={context}
                                                context={{
                                                    ...context,
                                                    adLevelCreatives,
                                                }}

                                                rowData={[]}
                                                rowSelection='multiple'
                                                columnDefs={memorizedColumnDef}
                                                defaultColDef={{ ...defaultColDef, suppressMenu: true }}
                                                onCellClicked={onCellClickedLive}
                                                useValueFormatterForExport={true}
                                                pagination={true}
                                                paginationPageSize={200}
                                                paginationPageSizeSelector={[20, 40, 60, 80, 100, 150, 200]}
                                                suppressAggFuncInHeader={true}
                                                getMainMenuItems={getMainMenuItems}
                                                groupSelectsChildren={true} // ✅ Selects all children when a group is selected
                                                suppressRowClickSelection={true} // ✅ Prevents selection on row click, only via checkbox
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
                                </div>}
                        </div>
                        :
                        <div style={{ backgroundColor: theme === "dark" && "#333" }}>
                            <Result
                                className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                icon={<SmileOutlined />}
                                title={`No LiveData for ${newaccount} from ${startDate} to ${endDate}`}
                            // extra={<Button type="primary">Next</Button>}
                            />
                        </div>
                    }
                </div>
            </div>

        </div>
    );

};

export default HourlyCampaignLevelReports;

