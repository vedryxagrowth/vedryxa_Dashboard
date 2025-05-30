"use client"
import { lazy, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { redirect } from 'next/navigation';
import debounce from 'lodash.debounce';
import React from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import dayjs from 'dayjs';
import { Carousel, Input, Button, Row, Col, Typography, Modal, message, ConfigProvider, Switch, Flex, Spin, Tabs, Skeleton } from 'antd';
import {   SearchOutlined, ReloadOutlined, CopyOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { Tooltip, Popover } from 'antd';
import StickyBox from 'react-sticky-box';
import { Select } from 'antd';
import { DatePicker, Space } from 'antd';
const { RangePicker } = DatePicker;
import 'antd/dist/reset.css';
import '../globals.css';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import locale from 'antd/es/date-picker/locale/en_US';
import { useTokenContext } from '../components/parent';
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
}

const LiveReports = React.lazy(() => import('../componentsOfReports/Live'));
const DailyReports = React.lazy(() => import('../componentsOfReports/Daily'));
const CampaignReports = React.lazy(() => import('../componentsOfReports/AllCampaigns'));
const DAKeywordReports = React.lazy(() => import('../componentsOfReports/DAKeywords'));
const System1KeywordReports = React.lazy(() => import('../componentsOfReports/System1Keywords'));
const TonicKeywordReports = React.lazy(() => import('../componentsOfReports/Tonic1Keywords'));
const AgencyAndBMNameReports = React.lazy(() => import('../componentsOfReports/AgencyAndBMName'));
const MnetDomainReports = React.lazy(() => import('../componentsOfReports/MnetDomainData'));
const MnetLiveAdReports = React.lazy(() => import('../componentsOfReports/MnetAdLive'));
const MnetDailyAdReport = React.lazy(() => import('../componentsOfReports/MnetAdDaily'));

const MyTablePage = () => {
    const { userdetails } = useTokenContext();
    const params = new URLSearchParams(window.location.search);

    const networkFromDashboard = params.get('network');
    const accountNumberFromDashboard = params.get('accountNumber');
    const timeFromDashboard = params.get('time');
    const startDateFromDashboard = params.get('startDate');
    const endDateFromDashboard = params.get('endDate');
    const accountNameFromDashboard = params.get('accountName');

    const { theme } = useTokenContext();
    const { apiClient } = useTokenContext();
    if (!userdetails?.adAccounts) {
        return <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* <Flex align="center" gap="middle">
                <Spin size="large" />
            </Flex> */}
            <div style={{ padding: '24px' }}>
                <Skeleton active paragraph={{ rows: 20 }} />
            </div>
        </div>;
    }
    if (userdetails?.role === "Revenue_Partner") {
        redirect("/Dashboard");
    }

    const { adAccounts } = userdetails;

    const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');

    const networks = Object.keys(adAccounts);
    
    const columnStructure = [
        "actions",
        "date",
        "M_tq",
        "D_tq",
        "from",
        "profitloss",
        "spend",
        "revenue",
        "profit",
        "campaignname",
        "margin",
        "fbleads",
        "conversions",
        "fbclicks",
        "impressions",
        "cpl",
        "ncpl",
        "rpc",
        "cpc",
        "ctr",
        "roi",
        "fmargin",
        "adsetname",
        "fb-hour",
        "mnet-hour",
        "adsetid",
        "campaignid",
        "timezone",
        "fblinkclicks",
        "cpclinkclicks",
        "adname",
        "adid"
    ];

    const storedData = localStorage.getItem("storedData") && localStorage.getItem("storedData") !== "undefined" && localStorage.getItem("storedData") !== "null" ? JSON.parse(localStorage.getItem("storedData")) : null;
    // console.log(storedData, "storedData");

    const defaultDates = [dayjs((startDateFromDashboard ? startDateFromDashboard : (storedData ? storedData?.startDate :  yesterday))), dayjs((endDateFromDashboard ? endDateFromDashboard : (storedData ? storedData?.endDate : yesterday)))];

    const [refreshContent, setRefreshContent] = useState("");

    const [initialRowData, setInitialRowData] = useState([]);

    const [rowData, setRowData] = useState([]);

    const [campaignData, setCampaignData] = useState([]);

    const [dailyData, setdailyData] = useState([]);

    const [keywordData, setKeywordData] = useState([]);

    const [system1KeywordData, setSystem1KeywordData] = useState([]);

    const [startDate, setStartDate] = useState(startDateFromDashboard ? startDateFromDashboard : (storedData ? storedData?.startDate : (yesterday)));

    const [newStartDate, setNewStartDate] = useState(startDateFromDashboard ? startDateFromDashboard :(storedData ? storedData?.startDate : (yesterday)));

    const [endDate, setEndDate] = useState(endDateFromDashboard ? endDateFromDashboard :(storedData ? storedData?.endDate : (yesterday)));

    const [newendDate, setNewEndDate] = useState(endDateFromDashboard ? endDateFromDashboard : (storedData ? storedData?.endDate : (yesterday)));

    const [revenuePratner, setRevenuePartner] = useState(networkFromDashboard ? networkFromDashboard : (storedData ? storedData?.revenuePratner : (networks[0])));

    const [newRevenuePratner, setNewRevenuePartner] = useState(networkFromDashboard ? networkFromDashboard : (storedData ? storedData?.revenuePratner : (networks[0])));

    const [isSearching, setIsSearching] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [newInputValue, setNewInputValue] = useState(inputValue);

    const [refrst, setRefrst] = useState(false);
    const [activeTab, setActiveTab] = useState(localStorage.getItem("activeTab") && localStorage.getItem("activeTab") !== "undefined" && localStorage.getItem("activeTab") !== "null" ? localStorage.getItem("activeTab") : "1");

    const [columnStructureStatus, setColumnStructureStatus] = useState(false);
    const [commentsStatus, setCommentsStatus] = useState(false);
    const [campaignsStatus, setCampaignsStatus] = useState(false);
    const [moveForward, setMoveForward] = useState(false);

    const [colDefs, setColDefs] = useState([]);
    const [colDailyDefs, setColDailyDefs] = useState([]);

    const [checked, setChecked] = useState(false);

    const [allProfitLossArray, setAllProfitLossArray] = useState([]);
    const [Camapignlevelstatus, setCamapignlevelstatus] = useState([]);
    const [mainData, setColumnStructure] = useState([]);
    const mainDataRef = useRef(mainData);

    const handleChangeToggle = () => {
        setChecked((prev) => !prev);
    };
    

    const handleBlur = () => {
        if (inputValue.trim() === '') {
            setIsSearching(false);
        }
    };

    const handleChangeInput = (e) => {
        // setInputValue(newInputValue.trim());
        setInputValue(e.target.value);
        // gridRef.current.api.onFilterChanged(); // Trigger AG-Grid to reapply filters
    };

    const handleChangeNewInputValue = (e) => {
        setNewInputValue(e.target.value);
    }

    const sortAccountsForAccess = (accountsForAccess) => {
        return [...accountsForAccess]
          .sort((a, b) => {
            // 1. Sort by status: Active first
            if (a.status !== b.status) {
              return a.status === 'Active' ? -1 : 1;
            }
      
            // 2. Sort by accountNumber
            if (a.accountNumber !== b.accountNumber) {
              return a.accountNumber.localeCompare(b.accountNumber);
            }
      
            // 3. Sort by accountName if present
            if (a.accountName && b.accountName && a.accountName !== b.accountName) {
              return a.accountName.localeCompare(b.accountName);
            }
      
            // 4. Maintain stable order (no-op)
            return 0;
        });
    };

    const accountsForAccess = adAccounts[revenuePratner];
    // console.log(accountsForAccess, "accounts Access");

    const accountsAccess = accountsForAccess === undefined ? [] : accountsForAccess;

    // console.log(accountsAccess, "accounts Access");

    const [networksData, setNetworksData] = useState(accountsAccess);

    const [accountNumberToPass, setAccountNumberToPass] = useState(accountNumberFromDashboard ? accountNumberFromDashboard : storedData ? storedData?.account : accountsForAccess[0].accountNumber);

    // const [isLoading, setLoading] = useState(true);

    // const [isLoading1, setLoading1] = useState(true);

    // const [isLoading2, setLoading2] = useState(true);

    // const [isLoading3, setLoading3] = useState(true);

    // const [isLoading4, setLoading4] = useState(true);

    // const [tonicKeywordLoading, setTonicKeywordLoading] = useState(true);

    // const [tonicKeywordData, setTonicKeywordData] = useState([]);

    // const [fixedTonic, setFixedTonic] = useState([]);

    const [isTrue, setTrue] = useState(false);

    const [account, setAccount] = useState((accountNumberFromDashboard ? accountNumberFromDashboard : (storedData ? storedData?.account : accountsForAccess[0].accountNumber)));

    const [time, setTime] = useState((timeFromDashboard ? timeFromDashboard : (storedData ? storedData?.time : (revenuePratner === "FB_DomainActive" || revenuePratner === "FB_Tonic1") ? "PDT" : "UTC")));

    const [newaccount, setNewAccount] = useState((accountNumberFromDashboard ? accountNumberFromDashboard?.replace(/\+/g, " ") : (storedData ? storedData?.account : accountsForAccess[0].accountNumber)));

    const [accountName, setAccountName] = useState(accountNameFromDashboard ? accountNameFromDashboard?.replace(/\+/g, " ") : (storedData ? storedData?.accountName : (accountsForAccess[0]?.accountName)));

    const [newAccountName, setnewAccountName] = useState(accountNameFromDashboard ? accountNameFromDashboard : (storedData ? storedData?.accountName : (accountsForAccess[0]?.accountName)));
    const [newtime, setNewTime] = useState((timeFromDashboard ? timeFromDashboard : (storedData ? storedData?.time : (revenuePratner === "FB_DomainActive" || revenuePratner === "FB_Tonic1") ? "PDT" : "UTC")));

    const [pageSize, setPageSize] = useState(1);

    const hasFetched = useRef(false);

    const carouselRef = useRef();

    // const gridRef = useRef();

    // const gridRef1 = useRef();

    // const gridRef2 = useRef();

    // const gridRef3 = useRef();

    // const gridRef4 = useRef();

    // const gridRef5 = useRef();

    // const gridRefForCampaignNamesLive = useRef();

    // const gridRefForCampaignNamesDaily = useRef();


    // const newRowData = useRef();

    // const newDailyData = useRef();

    // const newCampaignData = useRef();

    // const newTonicKeywordData = useRef();

    const isInitialLoad = useRef(true);
    //Modal States
    const [newColumnName, setNewColumnName] = useState('');
    const [formula, setFormula] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);

    // const newCampaignNamesDActiveLive = useRef();

    // const newCampaignNamesDActiveDaily = useRef();

    // const [campaignNamesDActiveLiveLoading, setCampaignNamesDActiveLiveLoading] = useState(false);

    // const [campaignNamesDActiveLive, setCampaignNamesDActiveLive] = useState([]);

    // const [campaignNamesDActiveDailyLoading, setCampaignNamesDActiveDailyLoading] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const changeRRefrst = () => {
        setRefrst((prev) => !prev);
    };



    const handleOk = () => {
        if (!newColumnName || !formula) {
            message.error("Please fill in all fields.");
            return;
        }
    
        const lowerCaseFormula = formula.toLowerCase();
    
        const newColumnDef = {
            headerName: newColumnName,
            field: newColumnName.toLowerCase(),
            valueGetter: (params) => {
                if (params.node.group && params.node.aggData) {
                    return sanitizeNumericValue(params.node.aggData[newColumnName.toLowerCase()]) || 0;
                }
    
                const data = params.data;
                if (!data) return 0;
    
                try {
                    // ✅ Compute margin and ROI dynamically
                    const values = { ...data };
                    if (lowerCaseFormula.includes("margin")) {
                        values.margin = computeMargin(data);
                    }
                    if (lowerCaseFormula.includes("fmargin")) {
                        values.fmargin = computeFMargin(data);
                    }
                    if (lowerCaseFormula.includes("cpclinkclikcs")) {
                        values.cpclinkclicks = computeCPCLC(data);
                    }
                    if (lowerCaseFormula.includes("roi")) {
                        values.roi = computeROI(data);
                    }
                    if (lowerCaseFormula.includes("ctr")) {
                        values.ctr = computeCTR(data);
                    }
                    if (lowerCaseFormula.includes("rpc")) {
                        values.rpc = computeRPC(data);
                    }
                    if (lowerCaseFormula.includes("cpc")) {  // ✅ Compute CPC for individual rows
                        values.cpc = sanitizeNumericValue(data.cpc);
                    }
                    if (lowerCaseFormula.includes("cpl")) {
                        values.cpl = computeCPL(data);
                    }
                    if (lowerCaseFormula.includes("ncpl")) {
                        values.ncpl = computeNCPL(data);
                    }
    
                    const originalKeys = Object.keys(values);
                    const sanitizedKeys = originalKeys.map(key => key.replace(/[^a-zA-Z_$0-9]/g, '_'));
    
                    const keyMapping = {};
                    sanitizedKeys.forEach((key, index) => {
                        keyMapping[key] = originalKeys[index];
                    });
    
                    const sanitizedValues = sanitizedKeys.map(key => sanitizeNumericValue(values[keyMapping[key]]));
    
                    const safeFormula = lowerCaseFormula.replace(/\/(\s*)0/g, "/(0 === 0 ? 1 : 0)");
    
                    const func = new Function(...sanitizedKeys, `return ${safeFormula}`);
                    const result = func(...sanitizedValues);
    
                    return isNaN(result) || !isFinite(result) ? 0 : Number(result.toFixed(2));
                } catch (error) {
                    console.error("Error evaluating formula:", error);
                    return 0;
                }
            },
            sortable: true,
            filter: true,
            aggFunc: (params) => params.rowNode.group ? customAggFunc(params, lowerCaseFormula) : null, 
            cellStyle: { backgroundColor: "skyblue" },
            headerCellStyle: { backgroundColor: "skyblue", color: "black" },
        };
    
        setColumnDefs((prevDefs) => [...prevDefs, newColumnDef]);
        setColDefs((prevDefs) => [...prevDefs, newColumnDef]);
        setColDailyDefs((prevDefs) => [...prevDefs, newColumnDef]);
        columnDefs1.current = [...columnDefs1.current, newColumnDef];
        columnDefs2.current = [...columnDefs2.current, newColumnDef];
        columnDefs3.current = [...columnDefs3.current, newColumnDef];
    
        setNewColumnName("");
        setFormula("");
        setIsModalOpen(false);
    };
    
    // Restore grid state (filters and sorting) from localStorage
    const restoreGridState = (gridApi) => {
        const filterModel = JSON.parse(localStorage.getItem('gridFilterModel'));
        const sortModel = JSON.parse(localStorage.getItem('gridSortModel'));

        if (gridApi) {
            if (filterModel) gridApi.setFilterModel(filterModel);
            if (sortModel) gridApi.setSortModel(sortModel);
        }
    };




    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const getMainMenuItems = (params) => {
        const defaultItems = params.defaultItems.slice();

        // Find and override the "Reset Columns" option
        const resetColumnsItemIndex = defaultItems.findIndex(item => item === 'resetColumns');
        if (resetColumnsItemIndex > -1) {
            defaultItems[resetColumnsItemIndex] = {
                name: 'Reset Columns (Custom)',
                action: () => {
                    updatingColumnsStructure(columnStructure)
                },
                cssClasses: ['custom-reset-columns-item']
            };
            defaultItems.splice(resetColumnsItemIndex + 1, 0, {
                name: 'Add New Column',
                action: showModal,
                cssClasses: ['custom-new-item'], // Assign a custom class for skyblue background
            });
        }

        return defaultItems;
    };

    const average = (params) => {
        const total = params.values.reduce((acc, value) => acc + parseFloat(value || 0), 0);
        const count = params.values.filter(value => value !== null && value !== undefined).length;  // Count non-null/undefined values
        return count > 0 ? Math.round((total / count) * 100) / 100 : 0;  // Avoid division by zero
    };

    const liveSpender = (params) => {
        const total = params.values.reduce((acc, value) => acc + parseFloat(value || 0), 0);
        return Math.round(total * 100) / 100; // Round to 2 decimal places
    };

    const currencyFormatter = (params) => {
        return `$${parseFloat(params.value || 0).toFixed(2)}`; // Ensure 2 decimal places in currency format
    };

    const numberComparator = (valueA, valueB) => {
        const numA = parseFloat(valueA) || 0;
        const numB = parseFloat(valueB) || 0;
        return numA - numB;
    };


    const spender = (params) => {
        if (!params.values || params.values.length === 0) {
            return 0; // Return 0 or any fallback value if there are no values to aggregate
        }

        let total = 0;
        params.values.forEach((value) => {
            if (value !== undefined && value !== null && !isNaN(value)) {
                total += parseFloat(value);
            }
        });

        const totalStr = total.toString();
        const [integerPart, decimalPart] = totalStr.split(".");

        if (decimalPart !== undefined && decimalPart.length > 2) {
            const formattedTotal = `${integerPart}.${decimalPart.slice(0, 2)}`;
            return parseFloat(formattedTotal).toFixed(2);
        }

        return total.toFixed(2);
    };


    const newSpender = (params) => {
        var total = 0;
        params.values.forEach((value) => {
            if (value !== undefined) {
                return (
                    (total += parseFloat(value))
                )
            }
        });
        var total1 = total.toString()
        var total2 = total1.split(".")
        if (total2[1] !== undefined && total2[1].length > 2) {
            var total22 = total2[1].slice(0, 2)
            var totalone = total2[0] + '.' + total22
            return parseFloat(totalone).toFixed(2)
        }
        return total;
    }

    const cpcSpender1 = (params) => {
        let total = 0;
        let count = 0;
    
        params.values.forEach((value) => {
            const num = parseFloat(value);
            if (!isNaN(num)) {
                total += num;
                count += 1;
            }
        });
    
        if (count === 0) return 0; // ✅ Prevent divide by zero
    
        return Number((total / count));
    };

    const cpcSpender = (params) => {
        var total = 0;
        var count = 0;
        params.values.forEach((value) => {
            (total += parseFloat(value))
            count += 1
        });
        var total1 = total.toString()
        var total2 = total1.split(".")
        if (total2[1] !== undefined && total2[1].length > 2) {
            var total22 = total2[1].slice(0, 2)
            var totalone = total2[0] + '.' + total22
            return parseFloat(totalone / count).toFixed(2)
        }
        return Number((total / count).toFixed(2));
    }

    const getCpl = (params) => {
        if (params.data !== undefined) {
            const { fbleads, spend } = params.data;

            if (fbleads !== 0) {
                const CPL = spend / fbleads;
                if (CPL === Infinity) {
                    return 0;
                }
                return Number(CPL.toFixed(2));

            }
        }
        if (params.node.aggData !== undefined) {
            const { fbleads, spend } = params.node.aggData;
            if (fbleads !== 0) {
                const CPL = spend / fbleads;
                if (CPL === Infinity) {
                    return 0;
                }
                return Number(CPL.toFixed(2));
            }
        }

        return 0;
    };

    const getCpcLc = (params) => {
        if (params.data !== undefined) {
            const { spend, fblinkclicks } = params.data;
            if (fblinkclicks !== 0) {
                const RPC = spend / fblinkclicks;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return Number(RPC.toFixed(2));

            }
        }
        if (params.node.aggData !== undefined) {
            const { spend, fblinkclicks } = params.node.aggData;
            if (fblinkclicks !== 0) {
                const RPC = spend / fblinkclicks;
                return Number(RPC.toFixed(2));
            }
        }

        return 0;
    }

    const getRpc = (params) => {
        if (params.data !== undefined) {
            const { revenue, conversions } = params.data;
            if (conversions !== 0) {
                const RPC = revenue / conversions;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return Number(RPC.toFixed(2));

            }
        }
        if (params.node.aggData !== undefined) {
            const { revenue, conversions } = params.node.aggData;
            if (conversions !== 0) {
                const RPC = revenue / conversions;
                return Number(RPC.toFixed(2));
            }
        }

        return 0;
    }

    const getCtr = (params) => {
        const data = params.node.group ? params.node.aggData : params.data;
        if (!data) return 0;
    
        const impressions = sanitizeNumericValue(data.impressions);
        const fbclicks = sanitizeNumericValue(data.fbclicks);
    
        if (isNaN(impressions) || impressions <= 0) return 0;
    
        const margin = (fbclicks / impressions) * 100;
        const roundedMargin = isFinite(margin) && !isNaN(margin) ? Math.round(margin * 100) / 100 : 0;
    
        if (params.node.group) {
            params.node.aggData["ctr"] = roundedMargin;
        }
    
        return roundedMargin;
    }

    const getDev = (params) => {
        const rpc = getRpc(params);
        if (params.data !== undefined) {
            const { fbleads } = params.data;

            if (fbleads !== 0) {
                const CPL = rpc * fbleads;
                if (CPL === Infinity) {
                    return 0;
                }
                return CPL;

            }
        }
        if (params.node.aggData !== undefined) {
            const { fbleads } = params.node.aggData;
            if (fbleads !== 0) {
                const CPL = rpc * fbleads;
                return CPL;
            }
        }

        return 0;

    }

    const getFmargin = (params) => {
        const revenue = getDev(params);
        if (params.data !== undefined) {
            const { profit } = params.data;
            if (revenue !== 0) {
                const RPC = (profit / revenue) * 100;
                if (RPC === Infinity || isNaN(RPC) || RPC === -Infinity) {
                    return 0;
                }
                return `${Number(RPC.toFixed(2))}`;

            }
        }
        if (params.node.aggData !== undefined) {
            const { profit } = params.node.aggData;
            if (revenue !== 0) {
                const RPC = (profit / revenue) * 100;
                return `${Number(RPC.toFixed(2))}`;
            }
        }

        return 0;
    }


    const getNcpl = (params) => {
        if (params.data !== undefined) {
            const { spend, conversions } = params.data;
            if (conversions !== 0) {
                const RPC = spend / conversions;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return Number(RPC.toFixed(2));

            }
        }
        if (params.node.aggData !== undefined) {
            const { spend, conversions } = params.node.aggData;
            if (conversions !== 0) {
                const RPC = spend / conversions;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return Number(RPC.toFixed(2));
            }
        }

        return 0;
    }

    const sanitizeNumericValue = (value) => {
        if (typeof value === 'string') {
            return parseFloat(value.replace(/[%$,]/g, '').trim()) || 0;
        }
        return isNaN(value) || value === undefined || value === null ? 0 : value;
    };
    
    // ✅ Compute Margin Correctly (for both Normal & Grouped Rows)
    const getMargin = (params) => {
        const data = params.node.group ? params.node.aggData : params.data;
        if (!data) return 0;
    
        const revenue = sanitizeNumericValue(data.revenue);
        const spend = sanitizeNumericValue(data.spend);
    
        if (isNaN(revenue) || revenue <= 0) return 0;
    
        const margin = ((revenue - spend) / revenue) * 100;
        const roundedMargin = isFinite(margin) && !isNaN(margin) ? Math.round(margin * 100) / 100 : 0;
    
        if (params.node.group) {
            params.node.aggData["margin"] = roundedMargin;
        }
    
        return roundedMargin;
    };
    
    // ✅ Custom Margin Getter for Dynamically Added Columns
    const getCustomMargin = (params) => {
        if (params.node.group && params.node.aggData) {
            return sanitizeNumericValue(params.node.aggData["margin"]);
        }
        return getMargin(params);
    };
    
    // ✅ Aggregation Function for Grouped Row Calculation

    const computeRPC = (data) => {
        const revenue = sanitizeNumericValue(data.revenue);
        const conversions = sanitizeNumericValue(data.conversions);
    
        if (conversions > 0) {
            return Number(((revenue / conversions)).toFixed(2));
        }
        return 0;
    };

    const computeCPCLC = (data) => {
        const fblinkClicks = sanitizeNumericValue(data.fblinkclicks);
        const spend = sanitizeNumericValue(data.spend);
    
        if (fblinkClicks > 0) {
            return Number((((spend) / fblinkClicks)).toFixed(2));
        }
        return 0;
    };

    const computeCPL = (data) => {
        const fbleads = sanitizeNumericValue(data.fbleads);
        const spend = sanitizeNumericValue(data.spend);
    
        if (fbleads > 0) {
            return Number((((spend) / fbleads)).toFixed(2));
        }
        return 0;
    };

    const computeNCPL = (data) => {
        const conversions = sanitizeNumericValue(data.conversions);
        const spend = sanitizeNumericValue(data.spend);
    
        if (conversions > 0) {
            return Number((((spend) / conversions)).toFixed(2));
        }
        return 0;
    };

    const computeMargin = (data) => {
        const revenue = sanitizeNumericValue(data.revenue);
        const spend = sanitizeNumericValue(data.spend);
    
        if (revenue > 0) {
            return Number((((revenue - spend) / revenue) * 100).toFixed(2));
        }
        return 0;
    };

    const computeFMargin = (data) => {
        const spend = sanitizeNumericValue(data.spend);
        const revenue1 = sanitizeNumericValue(data.revenue);
        const fbleads = sanitizeNumericValue(data.fbleads);
        const revenue = computeRPC(data) * fbleads;
    
        if (revenue > 0) {
            return Number((((revenue1-spend) / revenue) * 100).toFixed(2));
        }
        return 0;
    };
    
    // ✅ Compute ROI for Individual Child Rows
    const computeROI = (data) => {
        const revenue = sanitizeNumericValue(data.revenue);
        const spend = sanitizeNumericValue(data.spend);
    
        if (spend > 0) {
            return Number((((revenue-spend) / spend) * 100).toFixed(2));
        }
        return 0;
    };

    const computeCTR = (data) => {
        const impressions = sanitizeNumericValue(data.impressions);
        const fbclicks = sanitizeNumericValue(data.fbclicks);
    
        if (impressions > 0) {
            return Number(((fbclicks / impressions) * 100).toFixed(2));
        }
        return 0;
    };

    const computeAggregatedRPC = (params) => {
        const totalConversions = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.conversions), 0);
        const totalRevenue = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.revenue), 0);
    
        if (totalConversions > 0) {
            return Number(((totalRevenue / totalConversions)).toFixed(2));
        }
        return 0;
    };

    const computeAggregatedCPCLC = (params) => {
        const totalSpend = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.spend), 0);
        const totalFBLinkClicks = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.fblinkclicks), 0);
    
        if (totalFBLinkClicks > 0) {
            return Number(((totalSpend / totalFBLinkClicks)).toFixed(2));
        }
        return 0;
    };

    const computeAggregatedNCPL = (params) => {
        const totalSpend = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.spend), 0);
        const totalConversions = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.conversions), 0);
    
        if (totalConversions > 0) {
            return Number(((totalSpend / totalConversions)).toFixed(2));
        }
        return 0;
    };

    const computeAggregatedCPL = (params) => {
        const totalSpend = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.spend), 0);
        const totalFbleads = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.fbleads), 0);
    
        if (totalFbleads > 0) {
            return Number(((totalSpend / totalFbleads)).toFixed(2));
        }
        return 0;
    };
    
    // ✅ Compute Aggregated Margin for Grouped Rows
    const computeAggregatedMargin = (params) => {
        const totalSpend = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.spend), 0);
        const totalRevenue = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.revenue), 0);
    
        if (totalRevenue > 0) {
            return Number((((totalRevenue - totalSpend) / totalRevenue) * 100).toFixed(2));
        }
        return 0;
    };

    const computeAggregatedFMargin = (params) => {
        const totalSpend = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.spend), 0);
        const totalRevenue1 = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.revenue), 0);
        const totalFbleads = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.fbleads), 0);
        const totalRevenue = computeAggregatedRPC(params) * totalFbleads;
    
        if (totalRevenue > 0) {
            return Number((((totalRevenue1-totalSpend) / totalRevenue) * 100).toFixed(2));
        }
        return 0;
    };
    
    // ✅ Compute Aggregated ROI for Grouped Rows
    const computeAggregatedROI = (params) => {
        const totalSpend = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.spend), 0);
        const totalRevenue = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.revenue), 0);
    
        if (totalSpend > 0) {
            return Number((((totalRevenue-totalSpend) / totalSpend) * 100).toFixed(2));
        }
        return 0;
    };

    const computeAggregatedCTR = (params) => {
        const totalImpressions = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.impressions), 0);
        const totalFBClicks = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.fbclicks), 0);
    
        if (totalImpressions > 0) {
            return Number(((totalFBClicks / totalImpressions) * 100).toFixed(2));
        }
        return 0;
    };
    
    // ✅ Custom Aggregation Function (Handles Grouped Rows & Computes Full Formula)
    const customAggFunc = (params, formula) => {
        if (!params.rowNode.group) return null; // ✅ Only for grouped rows
    
        const aggregatedValues = {};
        const formulaKeys = formula.match(/[a-zA-Z_]\w*/g) || [];
    
        formulaKeys.forEach((key) => {
            const keyLower = key.toLowerCase();
    
            if (params.rowNode.group) {
                if (keyLower === "margin") {
                    aggregatedValues[keyLower] = computeAggregatedMargin(params);
                } 
                else if (keyLower === "fmargin") {
                    aggregatedValues[keyLower] = computeAggregatedFMargin(params);
                }
                else if (keyLower === "cpclinkclicks") {
                    aggregatedValues[keyLower] = computeAggregatedCPCLC(params);
                }
                else if (keyLower === "rpc") {
                    aggregatedValues[keyLower] = computeAggregatedRPC(params);
                }
                else if (keyLower === "cpc") {  // ✅ Apply Average for CPC
                    aggregatedValues[keyLower] = cpcSpender1(params);
                }
                else if (keyLower === "cpl") {
                    aggregatedValues[keyLower] = computeAggregatedCPL(params);
                }
                else if (keyLower === "ncpl") {
                    aggregatedValues[keyLower] = computeAggregatedNCPL(params);
                }
                else if (keyLower === "roi") {
                    aggregatedValues[keyLower] = computeAggregatedROI(params);
                } else if (keyLower === "ctr") {
                    aggregatedValues[keyLower] = computeAggregatedCTR(params);
                }else {
                    aggregatedValues[keyLower] = params.rowNode.allLeafChildren.reduce(
                        (acc, child) => acc + sanitizeNumericValue(child.data[keyLower]), 0
                    );
                }
            }
        });
    
        try {
            const sanitizedKeys = Object.keys(aggregatedValues).map(key => key.replace(/[^a-zA-Z_$0-9]/g, '_'));
            const keyMapping = {};
            sanitizedKeys.forEach((key, index) => {
                keyMapping[key] = Object.keys(aggregatedValues)[index];
            });
    
            const sanitizedValues = sanitizedKeys.map(key => aggregatedValues[keyMapping[key]]);
            const safeFormula = formula.replace(/\/(\s*)0/g, '/(0 === 0 ? 1 : 0)');
    
            const func = new Function(...sanitizedKeys, `return ${safeFormula}`);
            const result = func(...sanitizedValues);
    
            return isNaN(result) || !isFinite(result) ? 0 : Number(result.toFixed(2));
        } catch (error) {
            console.error("Error evaluating aggregated formula:", error);
            return 0;
        }
    };

    const getROI = (params) => {
        const data = params.node.group ? params.node.aggData : params.data;
        if (!data) return 0;
    
        const revenue = sanitizeNumericValue(data.revenue);
        const spend = sanitizeNumericValue(data.spend);
    
        if (isNaN(spend) || spend <= 0) return 0;
    
        const margin = ((revenue - spend) / spend) * 100;
        const roundedMargin = isFinite(margin) && !isNaN(margin) ? Math.round(margin * 100) / 100 : 0;
    
        if (params.node.group) {
            params.node.aggData["roi"] = roundedMargin;
        }
    
        return roundedMargin;
    }

    const agFunc = (params) => {
        let sum = 0;
        params.values.forEach((value) => (sum += parseFloat(value)));
        return sum;
    };

    const marginFormatter = (params) => {
        return `${parseFloat(params.value || 0).toFixed(2)}%`; // Ensure 2 decimal places in currency format
    };

    const rpcCplFormatter = (params) => {
        const value = params.value;
        return isNaN(value) || !isFinite(value) ? '0' : parseFloat(value).toFixed(2);
    };

    const avgRpcCpl = (params) => {
        const validValues = params.values.filter(value => !isNaN(value) && isFinite(value));
        if (validValues.length === 0) {
            return 0;
        }
        const sum = validValues.reduce((acc, value) => acc + value, 0);
        const average = sum / validValues.length;
        return parseFloat(average);
    };



    const onFilterChanged = () => {
        if (gridRef.current) {
            const filterModel = gridRef.current.api.getFilterModel();
            const adsetNameFilter = filterModel.adsetName;

            // Determine if the 'Select All' option is unchecked
            const isSelectAllUnchecked = !adsetNameFilter || !adsetNameFilter.values || adsetNameFilter.values.length === 0;

            // Update footer properties based on the 'Select All' option state
            gridRef.current.api.setGridOptions({
                groupIncludeTotalFooter: !isSelectAllUnchecked,
                groupIncludeFooter: !isSelectAllUnchecked
            });

            // Show all data if 'Select All' is unchecked, otherwise show filtered data
            if (isSelectAllUnchecked) {
                setRowData([...initialRowData]);
            } else {
                const filteredData = initialRowData.filter(row =>
                    adsetNameFilter.values.includes(row.adsetName)
                );
                setRowData(filteredData);
            }

            // Refresh the grid to apply the changes
            gridRef.current.api.refreshClientSideRowModel('filter');
        }
    };

    // Call the function when the grid is ready
    // useEffect(() => {
    //     if (gridRef.current && gridRef.current.api) {
    //         const currentGridApi = gridRef.current.api;

    //         currentGridApi.addEventListener('filterChanged', onFilterChanged);

    //         // Cleanup function to remove the event listener when the component unmounts
    //         return () => {
    //             currentGridApi.removeEventListener('filterChanged', onFilterChanged);
    //         };
    //     }
    // }, [gridRef, initialRowData]);


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

    const CopyableCell = ({ value }) => {
        const [tooltipText, setTooltipText] = useState("Copy to clipboard");

        const copyToClipboard = () => {
            navigator.clipboard.writeText(value).then(() => {
                setTooltipText("Copied!");
                setTimeout(() => setTooltipText("Copy to clipboard"), 2000); // Reset tooltip text after 2 seconds
            }).catch(() => {
                alert('Failed to copy!');
            });
        };

        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                    {value}
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

    const campaignNameRenderer = (params) => {
        const cell = document.createElement('div');
        ReactDOM.render(<CopyableCell value={params.value} />, cell);
        return cell;
    };

    const isYesterday = () => {
        const startDate1 = moment(startDate); // Convert to moment object
        const endDate1 = moment(endDate);     // Convert to moment object

        // Define "yesterday" as a reference
        const yesterday1 = moment().subtract(1, 'days');
        return startDate1.isSame(yesterday1, 'day') && endDate1.isSame(yesterday1, 'day');
    };

    const campaignMap = useMemo(() => {
        const map = new Map();
        Camapignlevelstatus.forEach((item) => {
          map.set(item.name, item.start);
        });
        return map;
    }, [Camapignlevelstatus]);

    const columnDefsObjectOfAdID = {
        M_tq: {
            headerName: 'M_TQ',
            field: 'M_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },             
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        },
          D_tq: {
            headerName: 'D_TQ',
            field: 'D_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        }, 
        campaignname: {
            headerName: 'CampaignName',
            field: 'campaignname',
            resizable: true,
            sortable: true,
            width: 500,
            hide: true,
            // rowGroup: true,
            // rowGroupIndex: 0, // Level 0
            // pinned: 'left',
            // enableRowGroup: true,
            // onClick: (event) => {
            //     const url = `/history/${event}-${account}-${time}`;
            //     window.open(url, '_blank', 'noopener,noreferrer');
            // },
            // cellRenderer: campaignNameRenderer,
        },
        adsetname: {
            headerName: 'AdsetName', field: 'adsetname',
            // resizeble: true,
            sortable: true,
            width: 350,
            rowGroup: true, 
            rowGroupIndex: 0, // Level 1
            hide: true,
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            }, 
            showRowGroup: 'adsetname'
        },
        adname: {
            headerName: 'AdName', field: 'adname',
            // resizeble: true,
            sortable: true,
            width: 300,
            rowGroup: true, 
            rowGroupIndex: 1, // Level 2
            hide: true,
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            }, 
            showRowGroup: 'adname',
        },
        adid: {
            headerName: 'AdID',
            field: 'adid',
            sortable: true,
            minWidth: 200,
            filter: 'agSetColumnFilter',
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // },
            // suppressMenu: true,    // Suppress the column menu
            
        },
        from:{
            headerName: 'From',
            field: 'from',
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                // const {  start } = campaignStatus;
                // console.log(params.node.groupData?.campaignname, "groupData");
                // console.log(params.node.key, "start");
                return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            minWidth: 110,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profitloss:{
              headerName: 'P/L',
              minWidth: 110,
              field: 'profitloss',
              valueGetter: (params) => {
                if (params.node.group) {
                  const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                  const campaignData = allProfitLossArray?.items?.filter(obj => obj.campaign_name === campaignName);
                  const revenue = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.estimated_revenue) || 0), 0);
                  const spend = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.spend) || 0), 0);
                  // const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                  // const {  start } = campaignStatus;
                  // console.log(params.node.groupData?.campaignname, "groupData");
                  // console.log(params.node.key, "start");
                  // return campaignStatus?.start || 'Unknown';
                  return (revenue - spend) ? (revenue - spend).toFixed(2) : "" || "";
                }
                return '';
              },
              cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
              },
              cellStyle: { fontWeight: 'bold' },
              suppressMenu: true,
              menuTabs: [],
              headerClass: 'hide-menu', // Add a custom class
        },
        actions: {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 90,
            // sortable: true,
            // filter: true,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            suppressMenu: true,    // Suppress the column menu
            menuTabs: [],
            hide: !isYesterday(),
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [newgroupedData, setNewGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignStatus, setCampaignStatus] = useState(true);
                const [campaignActualSpend, setCampaignActualSpend] = useState({});

                const onChangeSpendAndStatus = async () => {
                    if (params?.node?.rowPinned === 'bottom') {
                        return ""; // Return empty string to remove "..."
                    }
                    if (params?.node?.footer) {
                        return ""; // Prevent modal from opening for group footer rows
                    }
                    const allLeafChildren = params.node?.allLeafChildren || [];

                    // Fetch all the rows under the current group
                    const groupedData = allLeafChildren.map(node => node.data) || [];
                    // console.log(groupedData, "groupedData");
                    setNewGroupedData(groupedData);
                    const campaignId = groupedData[0]?.campaignid;

                    // Only show the modal if there is data (groupedData length is greater than 0)
                    if (groupedData.length > 0) {
                        const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
                        const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
                        if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
                            setGroupedData(getCampaignResponse.data);
                            setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
                            onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
                        }
                        if(getCampaignActualSpend.status === 200){
                            // console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
                            setCampaignActualSpend(getCampaignActualSpend.data);
                        }
                        else {
                            setGroupedData(groupedData);
                        }
                        // Set the grouped data for the modal
                        setIsModalVisible(true); // Show the modal for non-footer rows
                    }
                };

                const handleOk = async () => {
                    setIsModalVisible(false); // Close the modal
                    const object = {
                        campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
                        adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
                        campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
                        usercommit: userdetails?.email,
                        accountNumber: newaccount,
                        budget: changeBudget * 100,
                        status: campaignStatus
                    };
                    // console.log(object);
                    const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
                    const responseData = requestResponse.data;
                    // console.log(responseData, "response");
                    message.success("Budget and Status Updated");
                    changeRRefrst();
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                    // console.log(changeBudget); // Close the modal
                };

                const getTotalSpend = (data) => {
                    if (!data || data.length === 0) return 0;
                    const total = data.reduce((total, item) => {
                        return total + (parseFloat(item?.spend) || 0);
                    }, 0);
                    return Math.round(total * 100) / 100; // Round to 2 decimal places
                };

                const onChangeBudgetValue = event => {
                    onChangeBudget(event.target.value)
                }

                const onChangeCampaignStatus = async () => {
                    const apiEndpoint = campaignStatus
                        ? '/campaignStatusPause/' // Pause campaign
                        : '/campaignStatusActive/'; // Activate campaign
                
                    try {
                        const response = await apiClient.post(apiEndpoint, 
                            { campaignId: groupedData[0]?.campaignid }
                        );
                        if (response.status === 200) {
                            message.success(`Campaign ${groupedData[0]?.campaignid} status updated to ${campaignStatus ? 'Paused' : 'Active'}`);
                            setCampaignStatus((prev) => !prev); // Toggle the status
                        } else {
                            message.error('Failed to update campaign status.');
                        }
                    } catch (error) {
                        console.error('Error updating campaign status:', error);
                        message.error('Error updating campaign status.');
                    }
                };

                return (
                    <div>
                        <div onClick={onChangeSpendAndStatus}>
                            <span>{params.value || "..."}</span> 
                        </div>
                        {isModalVisible && (
                            <Modal
                                title={groupedData?.length > 0 && groupedData?.length !== 1 ? groupedData[0]?.campaignname : groupedData?.campaignname}
                                visible={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                width={600}  
                                style={{ padding: '20px' }} 
                                okButtonProps={{ style: { backgroundColor: '#C7F39A', borderColor: '#C7F39A' } }} 
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#C7F39A"}} onChange={onChangeCampaignStatus} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong>Campaign ID:</Typography.Text>
                                        <p>{campaignActualSpend?.id}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
        },
        date: {
            headerName: 'Date',
            field: 'date',
            minWidth: 110,
            sortable: true,
            sort: "asc",
            filter: "agDateColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    const dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    const dateParts = dateAsString.split("/");
                    const cellDate = new Date(
                        Number(dateParts[2]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[0])
                    );

                    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                        return 0;
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                    return 0;
                },
            },
        },
        'fb-hour': {
            headerName: 'F-H',
            field: 'fb-hour',
            width: 85,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        'mnet-hour': {
            headerName: 'N-H',
            field: 'mnet-hour',
            minWidth: 95,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        spend: {
            headerName: 'Spend',
            field: 'spend',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agTextColumnFilter", // Keep filter active
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Total amount spent",
        },       
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            sortable: true,
            aggFunc: liveSpender,
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Profit = Revenue - Spend",
            
        },
        margin: {
            headerName: 'Margin',
            field: 'margin',
            minWidth: 100,
            valueGetter: getMargin,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Margin = (Profit / Revenue) * 100",
            
        },
        fbleads: {
            headerName: 'FBLeads',
            field: 'fbleads',
            minWidth: 105,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        conversions: {
            headerName: 'Conv',
            field: 'conversions',
            minWidth: 85,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            
            headerTooltip: "Conversions",
            
        },
        cpc: {
            headerName: 'CPC',
            field: 'cpc',
            aggFunc: cpcSpender,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CPC = Spend / FBClicks",
            
        },
        cpclinkclicks: {
            headerName: 'CPC_LC',
            field: 'cpclinkclicks',
            // aggFunc: cpcSpender,
            valueGetter:getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
            
        },
        fbclicks: {
            headerName: 'FBClicks',
            field: 'fbclicks',
            minWidth: 110,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        fblinkclicks: {
            headerName: 'FB_LC',
            field: 'fblinkclicks',
            headerTooltip:'fblinkclicks',
            minWidth: 110,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        impressions: {
            headerName: 'IMP',
            field: 'impressions',
            minWidth: 80,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Impressions",
        },
        ctr: {
            headerName: 'CTR',
            field: 'ctr',
            valueGetter: getCtr,
            minWidth: 100,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        rpc: {
            headerName: 'RPC',
            field: 'rpc',
            minWidth: 80,
            valueGetter: getRpc,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "RPC = Revenue / Conversions",
            cellStyle: { fontWeight: 'bold' }
        },
        cpl: {
            headerName: 'CPL',
            field: 'cpl',
            minWidth: 80,
            valueGetter: getCpl,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CPL = Spend / FBLeads",
            
        },
        ncpl: {
            headerName: 'NCPL',
            field: 'ncpl',
            minWidth: 90,
            valueGetter: getNcpl,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "NCPL = Spend / Conversions",
            
        },
        fmargin: {
            headerName: 'FMargin',
            field: 'fmargin',
            minWidth: 120,
            valueGetter: getFmargin,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "FMargin = (Profit / Spend) * 100",
            
        },
        roi: {
            headerName: 'ROI',
            field: 'roi',
            minWidth: 100,
            valueGetter: getROI,
            filter: "agNumberColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "ROI = ((Revenue - Spend) / Spend) * 100",
            
        },
        adsetid: {
            headerName: 'AdsetId',
            field: 'adsetid',
            sortable: true,
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' 
        },
        campaignid: {
            headerName: 'CampaignId',
            field: 'campaignid',
            sortable: true,
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' 
        },
        timezone: {
            headerName: 'TimeZone',
            field: 'timezone',
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' 
        },
    };

    const columnDefsObjectOfDailyAdID = {
        M_tq: {
            headerName: 'M_TQ',
            field: 'M_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },             
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        },
        D_tq: {
            headerName: 'D_TQ',
            field: 'D_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        },  
        campaignname: {
            headerName: 'CampaignName',
            field: 'campaignname',
            resizable: true,
            sortable: true,
            width: 500,
            hide: true,
            // rowGroup: true,
            // rowGroupIndex: 0, // Level 0
            // pinned: 'left',
            // enableRowGroup: true,
            // onClick: (event) => {
            //     const url = `/history/${event}-${account}-${time}`;
            //     window.open(url, '_blank', 'noopener,noreferrer');
            // },
            // cellRenderer: campaignNameRenderer,
        },
        actions: {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 90,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            hide: false,
            suppressMenu: true,
            hide: !isYesterday(),
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [newgroupedData, setNewGroupedData] = useState([]);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignStatus, setCampaignStatus] = useState(true);
                const [campaignActualSpend, setCampaignActualSpend] = useState({});

                const onChangeSpendAndStatus = async () => {
                    // Check if it's a group footer row (for groupIncludeFooter)
                    if (params?.node?.footer) {
                        // console.log("This is a groupIncludeFooter row. Modal will not open.");
                        return; // Prevent modal from opening for group footer rows
                    }

                    // Ensure allLeafChildren exists and is an array before proceeding
                    const allLeafChildren = params.node?.allLeafChildren || [];
                    setNewGroupedData(groupedData);
                    // Fetch all the rows under the current group
                    const groupedData = allLeafChildren.map(node => node.data) || [];
                    const campaignId = groupedData[0]?.campaignid;

                    // Only show the modal if there is data (groupedData length is greater than 0)
                    if (groupedData.length > 0) {
                        const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
                        const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
                        if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
                            setGroupedData(getCampaignResponse.data);
                            setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
                            onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
                        }
                        if(getCampaignActualSpend.status === 200){
                            // console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
                            setCampaignActualSpend(getCampaignActualSpend.data);
                        }
                        else {
                            setGroupedData(groupedData);
                            // console.log("dailyadd");
                        }
                        // Set the grouped data for the modal
                        setIsModalVisible(true); // Show the modal for non-footer rows
                    }
                };

                const handleOk = async () => {
                    setIsModalVisible(false); // Close the modal
                    const object = {
                        campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
                        adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
                        campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
                        usercommit: userdetails?.email,
                        accountNumber: newaccount,
                        budget: changeBudget * 100,
                        status: campaignStatus
                    };
                    // console.log(object);
                    const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
                    const responseData = requestResponse.data;
                    // console.log(responseData, "response");
                    message.success("Budget and Status Updated");
                    changeRRefrst();
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                    // console.log(changeBudget); // Close the modal
                };

                const getTotalSpend = (data) => {
                    if (!data || data.length === 0) return 0;
                    const total = data.reduce((total, item) => {
                        return total + (parseFloat(item?.spend) || 0);
                    }, 0);
                    return Math.round(total * 100) / 100; // Round to 2 decimal places
                };

                const onChangeBudgetValue = event => {
                    onChangeBudget(event.target.value)
                }
                const onChangeCampaignStatus = async () => {
                    const apiEndpoint = campaignStatus
                        ? 'https://prodapis.adsgoat.in/campaignStatusPause/' // Pause campaign
                        : 'https://prodapis.adsgoat.in/campaignStatusActive/'; // Activate campaign
                
                    try {
                        const response = await axios.post(apiEndpoint, 
                            { campaignId: groupedData[0]?.campaignid }, 
                            { headers: { Authorization: token } }
                        );
                        if (response.status === 200) {
                            message.success(`Campaign ${groupedData[0]?.campaignid} status updated to ${campaignStatus ? 'Paused' : 'Active'}`);
                            setCampaignStatus((prev) => !prev); // Toggle the status
                        } else {
                            message.error('Failed to update campaign status.');
                        }
                    } catch (error) {
                        console.error('Error updating campaign status:', error);
                        message.error('Error updating campaign status.');
                    }
                };

                return (
                    <div>
                        <div onClick={onChangeSpendAndStatus}>
                            <span>{params.value || "..."}</span> {/* Fallback to '...' if status is not available */}
                        </div>
                        {/* Modal should only be shown for non-footer rows and when groupedData length is greater than 0 */}
                        {isModalVisible && (
                            <Modal
                                title={groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignname : groupedData?.campaignname}
                                visible={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                width={600}  // Set a custom width for the modal
                                style={{ padding: '20px' }}  // Adjust body padding
                                okButtonProps={{ style: { backgroundColor: '#C7F39A', borderColor: '#C7F39A' } }} 
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#C7F39A"}} onChange={onChangeCampaignStatus} />
                                    </div>

                                    {/* Input Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>

                                    {/* Campaign ID */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong>Campaign ID:</Typography.Text>
                                        <p>{campaignActualSpend?.id}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
            filterParams: { filterEnabled: false },

        },
        adid: {
            headerName: 'AdID',
            field: 'adid',
            sortable: true,
            minWidth: 350,
            filter: 'agSetColumnFilter',
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // },
            // suppressMenu: true,    // Suppress the column menu
            // hide: true,
            
        },
        from:{
            headerName: 'From',
            field: 'from',
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                // const {  start } = campaignStatus;
                // console.log(params.node.groupData?.campaignname, "groupData");
                // console.log(params.node.key, "start");
                return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            minWidth: 110,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profitloss:{
            headerName: 'P/L',
            field: 'profitloss',
            minWidth: 110,
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                const campaignData = allProfitLossArray?.items?.filter(obj => obj.campaign_name === campaignName);
                const revenue = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.estimated_revenue) || 0), 0);
                const spend = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.spend) || 0), 0);
                // const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                // const {  start } = campaignStatus;
                // console.log(params.node.groupData?.campaignname, "groupData");
                // console.log(params.node.key, "start");
                // return campaignStatus?.start || 'Unknown';
                return (revenue - spend) ? (revenue - spend).toFixed(2) : "" || "";
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            cellStyle: { fontWeight: 'bold' },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        adsetname: {
            headerName: 'AdsetName', field: 'adsetname',
            // resizeble: true,
            sortable: true,
            width: 350,
            rowGroup: true, 
            rowGroupIndex: 0, // Level 1
            hide: true,
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            }, 
        },
        adname: {
            headerName: 'AdName', field: 'adname',
            // resizeble: true,
            sortable: true,
            width: 300,
            rowGroup: true, 
            rowGroupIndex: 1, // Level 2
            hide: true,
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            }, 
        },
        date: {
            headerName: 'Date', field: 'date', minWidth: 110, sortable: true,
            filter: "agDateColumnFilter",
            sort: "asc",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    const dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    const dateParts = dateAsString.split("/");
                    const cellDate = new Date(
                        Number(dateParts[2]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[0])
                    );

                    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                        return 0;
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                    return 0;
                }
            },
        },
        'fb-hour': { headerName: 'F-H', field: 'fb-hour', minWidth: 85, sortable: true, hide: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        'mnet-hour': { headerName: 'M-H', field: 'mnet-hour', minWidth: 95, sortable: true, hide: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        spend: {
            headerName: 'Spend',
            field: 'spend',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter, // Format display as currency
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            cellClassRules: {
                'font-red': p => p.value < 0 // Conditional formatting for negative profit
            },
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: 'Profit = Revenue - Spend',
        },
        margin: {
            headerName: 'Margin', field: 'margin', valueGetter: getMargin, sortable: true, headerTooltip: '(Profit/Revenue)*100', filter: 'agNumberColumnFilter',
            minWidth: 100,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class

        },
        fbleads: { headerName: 'FBLeads', field: 'fbleads', minWidth: 105, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        conversions: { headerName: 'Conv', field: 'conversions', headerTooltip: "Conversions", minWidth: 85, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        cpc: {
            headerName: 'CPC', field: 'cpc',
            minWidth: 80,
            aggFunc: (params) => {
                const sum = params.values.reduce((sum, value) => sum + parseFloat(value), 0);
                return sum / params.values.length;
            },
            valueFormatter: params => params.value !== undefined ? Math.round(params.value * 100) / 100 : '',
            sortable: true, filter: 'agNumberColumnFilter',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CPC = Spend / FBClicks",

        },
        cpclinkclicks: {
            headerName: 'CPC_LC',
            field: 'cpclinkclicks',
            // aggFunc: cpcSpender,
            valueGetter:getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
            
        },
        fbclicks: { headerName: 'FBClicks', field: 'fbclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        fblinkclicks: { headerName: 'FB_LC', field: 'fblinkclicks', headerTooltip:'fblinkclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        impressions: { headerName: 'IMP', field: 'impressions', headerTooltip:"Impressions", minWidth: 80, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        ctr: {
            headerName: 'CTR', field: 'ctr', valueGetter: getCtr, sortable: true,
            minWidth: 100,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CTR = (FBClicks / Impressions) * 100",
        },
        rpc: {
            headerName: 'RPC', field: 'rpc', valueGetter: getRpc, sortable: true, filter: 'agNumberColumnFilter',
            minWidth: 80,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "RPC = Revenue / Conversions",
            cellStyle: { fontWeight: 'bold' }
        },
        cpl: { headerName: 'CPL', field: 'cpl', minWidth:80, valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "CPL = Spend / FBLeads" },
        ncpl: { headerName: 'NCPL', field: 'ncpl', minWidth:90, valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "NCPL = Spend / Conversions" },
        fmargin: {
            headerName: 'FMargin', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: true,
            minWidth: 120,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "FMargin = (Profit / Spend) * 100",
        },
        roi: {
            headerName: 'ROI', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: '(Profit/Spend)*100', filter: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            minWidth: 100,
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "ROI = (Revenue - Spend) / Spend",
        },
        adsetid: { headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter", hide: false, suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        campaignid: { headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter",  suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    };

    // const columnDefsObjectOfAdIDCampaignLevel = {
    //     campaignname: {
    //         headerName: 'CampaignName',
    //         field: 'campaignname',
    //         resizable: true,
    //         sortable: true,
    //         width: 500,
    //         hide: true,
    //         // rowGroup: true,
    //         // rowGroupIndex: 0, // Level 0
    //         // pinned: 'left',
    //         // enableRowGroup: true,
    //         // onClick: (event) => {
    //         //     const url = `/history/${event}-${account}-${time}`;
    //         //     window.open(url, '_blank', 'noopener,noreferrer');
    //         // },
    //         // cellRenderer: campaignNameRenderer,
    //     },
    //     adsetname: {
    //         headerName: 'AdsetName', field: 'adsetname',
    //         // resizeble: true,
    //         sortable: true,
    //         width: 350,
    //         rowGroup: true, 
    //         rowGroupIndex: 0, // Level 1
    //         hide: true,
    //         filter: 'agSetColumnFilter',
    //         filterParams: {
    //             comparator: (a, b) => a.localeCompare(b),
    //             suppressAndOrCondition: true,
    //         }, 
    //         // showRowGroup: 'adsetname'
    //     },
    //     adname: {
    //         headerName: 'AdName', field: 'adname',
    //         // resizeble: true,
    //         sortable: true,
    //         width: 300,
    //         rowGroup: true, 
    //         rowGroupIndex: 1, // Level 2
    //         hide: true,
    //         filter: 'agSetColumnFilter',
    //         filterParams: {
    //             comparator: (a, b) => a.localeCompare(b),
    //             suppressAndOrCondition: true,
    //         }, 
    //         showRowGroup: 'adname',
    //     },
    //     adid: {
    //         headerName: 'AdID',
    //         field: 'adid',
    //         sortable: true,
    //         minWidth: 200,
    //         filter: 'agSetColumnFilter',
    //         // filterParams: {
    //         //     comparator: (a, b) => a.localeCompare(b),
    //         //     suppressAndOrCondition: true,
    //         // },
    //         // suppressMenu: true,    // Suppress the column menu
            
    //     },
    //     from:{
    //         headerName: 'From',
    //         field: 'from',
    //         valueGetter: (params) => {
    //           if (params.node.group) {
    //             const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
    //             const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
    //             // const {  start } = campaignStatus;
    //             // console.log(params.node.groupData?.campaignname, "groupData");
    //             // console.log(params.node.key, "start");
    //             return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
    //           }
    //           return '';
    //         },
    //         cellClassRules: {
    //           'hide-leaf-cell': (params) => !params.node.group,
    //         },
    //         minWidth: 110,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //     },
    //     profitloss:{
    //           headerName: 'P/L',
    //           minWidth: 110,
    //           field: 'profitloss',
    //           valueGetter: (params) => {
    //             if (params.node.group) {
    //               const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
    //               const campaignData = allProfitLossArray?.items?.filter(obj => obj.campaign_name === campaignName);
    //               const revenue = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.estimated_revenue) || 0), 0);
    //               const spend = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.spend) || 0), 0);
    //               // const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
    //               // const {  start } = campaignStatus;
    //               // console.log(params.node.groupData?.campaignname, "groupData");
    //               // console.log(params.node.key, "start");
    //               // return campaignStatus?.start || 'Unknown';
    //               return (revenue - spend) ? (revenue - spend).toFixed(2) : "" || "";
    //             }
    //             return '';
    //           },
    //           cellClassRules: {
    //             'hide-leaf-cell': (params) => !params.node.group,
    //           },
    //           cellStyle: { fontWeight: 'bold' },
    //           suppressMenu: true,
    //           menuTabs: [],
    //           headerClass: 'hide-menu', // Add a custom class
    //     },
    //     actions: {
    //         headerName: 'Actions',
    //         field: 'actions',
    //         minWidth: 90,
    //         // sortable: true,
    //         // filter: true,
    //         sortable: false,    // Ensure sorting is disabled
    //         filter: false,      // Ensure filtering is disabled
    //         enableSorting: false,  // Disable sorting at the column level
    //         enableFilter: false,
    //         suppressMenu: true,    // Suppress the column menu
    //         menuTabs: [],
    //         hide: !isYesterday(),
    //         cellRenderer: (params) => {
    //             const [isModalVisible, setIsModalVisible] = useState(false);
    //             const [groupedData, setGroupedData] = useState([]);
    //             const [newgroupedData, setNewGroupedData] = useState([]);
    //             const [changeBudget, onChangeBudget] = useState();
    //             const [campaignStatus, setCampaignStatus] = useState(true);
    //             const [campaignActualSpend, setCampaignActualSpend] = useState({});

    //             const onChangeSpendAndStatus = async () => {
    //                 if (params?.node?.rowPinned === 'bottom') {
    //                     return ""; // Return empty string to remove "..."
    //                 }
    //                 if (params?.node?.footer) {
    //                     return ""; // Prevent modal from opening for group footer rows
    //                 }
    //                 const allLeafChildren = params.node?.allLeafChildren || [];

    //                 // Fetch all the rows under the current group
    //                 const groupedData = allLeafChildren.map(node => node.data) || [];
    //                 // console.log(groupedData, "groupedData");
    //                 setNewGroupedData(groupedData);
    //                 const campaignId = groupedData[0]?.campaignid;

    //                 // Only show the modal if there is data (groupedData length is greater than 0)
    //                 if (groupedData.length > 0) {
    //                     const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
    //                     const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
    //                     if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
    //                         setGroupedData(getCampaignResponse.data);
    //                         setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
    //                         onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
    //                     }
    //                     if(getCampaignActualSpend.status === 200){
    //                         console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
    //                         setCampaignActualSpend(getCampaignActualSpend.data);
    //                     }
    //                     else {
    //                         setGroupedData(groupedData);
    //                     }
    //                     // Set the grouped data for the modal
    //                     setIsModalVisible(true); // Show the modal for non-footer rows
    //                 }
    //             };

    //             const handleOk = async () => {
    //                 setIsModalVisible(false); // Close the modal
    //                 const object = {
    //                     campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
    //                     adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
    //                     campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
    //                     usercommit: userdetails?.email,
    //                     accountNumber: newaccount,
    //                     budget: changeBudget * 100,
    //                     status: campaignStatus
    //                 };
    //                 // console.log(object);
    //                 const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
    //                 const responseData = requestResponse.data;
    //                 // console.log(responseData, "response");
    //                 message.success("Budget and Status Updated");
    //                 changeRRefrst();
    //             };

    //             const handleCancel = () => {
    //                 setIsModalVisible(false);
    //                 // console.log(changeBudget); // Close the modal
    //             };

    //             const getTotalSpend = (data) => {
    //                 if (!data || data.length === 0) return 0;
    //                 const total = data.reduce((total, item) => {
    //                     return total + (parseFloat(item?.spend) || 0);
    //                 }, 0);
    //                 return Math.round(total * 100) / 100; // Round to 2 decimal places
    //             };

    //             const onChangeBudgetValue = event => {
    //                 onChangeBudget(event.target.value)
    //             }

    //             const onChangeCampaignStatus = async () => {
    //                 const apiEndpoint = campaignStatus
    //                     ? '/campaignStatusPause/' // Pause campaign
    //                     : '/campaignStatusActive/'; // Activate campaign
                
    //                 try {
    //                     const response = await apiClient.post(apiEndpoint, 
    //                         { campaignId: groupedData[0]?.campaignid }
    //                     );
    //                     if (response.status === 200) {
    //                         message.success(`Campaign ${groupedData[0]?.campaignid} status updated to ${campaignStatus ? 'Paused' : 'Active'}`);
    //                         setCampaignStatus((prev) => !prev); // Toggle the status
    //                     } else {
    //                         message.error('Failed to update campaign status.');
    //                     }
    //                 } catch (error) {
    //                     console.error('Error updating campaign status:', error);
    //                     message.error('Error updating campaign status.');
    //                 }
    //             };

    //             return (
    //                 <div>
    //                     <div onClick={onChangeSpendAndStatus}>
    //                         <span>{params.value || "..."}</span> 
    //                     </div>
    //                     {isModalVisible && (
    //                         <Modal
    //                             title={groupedData?.length > 0 && groupedData?.length !== 1 ? groupedData[0]?.campaignname : groupedData?.campaignname}
    //                             visible={isModalVisible}
    //                             onOk={handleOk}
    //                             onCancel={handleCancel}
    //                             width={600}  
    //                             style={{ padding: '20px' }} 
    //                             okButtonProps={{ style: { backgroundColor: '#C7F39A', borderColor: '#C7F39A' } }} 
    //                         >
    //                             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    
    //                                 <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
    //                                     <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
    //                                     <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#C7F39A"}} onChange={onChangeCampaignStatus} />
    //                                 </div>
    //                                 <div style={{ display: 'flex', flexDirection: 'column' }}>
    //                                     <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
    //                                     <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
    //                                 </div>
    //                                 <div style={{ display: 'flex', flexDirection: 'column' }}>
    //                                     <Typography.Text strong>Campaign ID:</Typography.Text>
    //                                     <p>{campaignActualSpend?.id}</p>
    //                                 </div>
    //                             </div>
    //                         </Modal>
    //                     )}
    //                 </div>
    //             );
    //         },
    //     },
    //     date: {
    //         headerName: 'Date',
    //         field: 'date',
    //         minWidth: 110,
    //         sortable: true,
    //         sort: "asc",
    //         filter: "agDateColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         filterParams: {
    //             comparator: (filterLocalDateAtMidnight, cellValue) => {
    //                 const dateAsString = cellValue;
    //                 if (dateAsString == null) return -1;
    //                 const dateParts = dateAsString.split("/");
    //                 const cellDate = new Date(
    //                     Number(dateParts[2]),
    //                     Number(dateParts[1]) - 1,
    //                     Number(dateParts[0])
    //                 );

    //                 if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
    //                     return 0;
    //                 }

    //                 if (cellDate < filterLocalDateAtMidnight) {
    //                     return -1;
    //                 }

    //                 if (cellDate > filterLocalDateAtMidnight) {
    //                     return 1;
    //                 }
    //                 return 0;
    //             },
    //         },
    //     },
    //     'fb-hour': {
    //         headerName: 'F-H',
    //         field: 'fb-hour',
    //         width: 85,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu' // Add a custom class
            
    //     },
    //     'mnet-hour': {
    //         headerName: 'N-H',
    //         field: 'mnet-hour',
    //         minWidth: 95,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu' // Add a custom class
            
    //     },
    //     spend: {
    //         headerName: 'Spend',
    //         field: 'spend',
    //         minWidth: 105,
    //         aggFunc: liveSpender,
    //         sortable: true,
    //         filter: "agTextColumnFilter", // Keep filter active
    //         valueFormatter: currencyFormatter,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "Total amount spent",
    //     },       
    //     revenue: {
    //         headerName: 'Revenue',
    //         field: 'revenue',
    //         minWidth: 105,
    //         aggFunc: liveSpender,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         valueFormatter: currencyFormatter,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu' // Add a custom class
            
    //     },
    //     profit: {
    //         headerName: 'Profit',
    //         field: 'profit',
    //         minWidth: 105,
    //         sortable: true,
    //         aggFunc: liveSpender,
    //         cellClassRules: {
    //             'font-red': p => p.value < 0
    //         },
    //         filter: "agNumberColumnFilter",
    //         valueFormatter: currencyFormatter,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "Profit = Revenue - Spend",
            
    //     },
    //     margin: {
    //         headerName: 'Margin',
    //         field: 'margin',
    //         minWidth: 100,
    //         valueGetter: getMargin,
    //         sortable: true,
    //         filter: "agTextColumnFilter",
    //         comparator: (valueA, valueB) => {
    //             // Handle sorting based on the computed margin value
    //             if (valueA == null) return -1;
    //             if (valueB == null) return 1;
    //             return valueA - valueB;
    //         },
    //         valueFormatter: (params) => `${params.value}%`,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "Margin = (Profit / Revenue) * 100",
            
    //     },
    //     fbleads: {
    //         headerName: 'FBLeads',
    //         field: 'fbleads',
    //         minWidth: 105,
    //         aggFunc: newSpender,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu' // Add a custom class
            
    //     },
    //     conversions: {
    //         headerName: 'Conv',
    //         field: 'conversions',
    //         minWidth: 85,
    //         aggFunc: newSpender,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
            
    //         headerTooltip: "Conversions",
            
    //     },
    //     cpc: {
    //         headerName: 'CPC',
    //         field: 'cpc',
    //         aggFunc: cpcSpender,
    //         minWidth: 80,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "CPC = Spend / FBClicks",
            
    //     },
    //     cpclinkclicks: {
    //         headerName: 'CPC_LC',
    //         field: 'cpclinkclicks',
    //         // aggFunc: cpcSpender,
    //         valueGetter:getCpcLc,
    //         minWidth: 80,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
            
    //     },
    //     fbclicks: {
    //         headerName: 'FBClicks',
    //         field: 'fbclicks',
    //         minWidth: 110,
    //         aggFunc: newSpender,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu' // Add a custom class
            
    //     },
    //     fblinkclicks: {
    //         headerName: 'FB_LC',
    //         field: 'fblinkclicks',
    //         headerTooltip:'fblinkclicks',
    //         minWidth: 110,
    //         aggFunc: newSpender,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu' // Add a custom class
            
    //     },
    //     impressions: {
    //         headerName: 'IMP',
    //         field: 'impressions',
    //         minWidth: 80,
    //         aggFunc: newSpender,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "Impressions",
    //     },
    //     ctr: {
    //         headerName: 'CTR',
    //         field: 'ctr',
    //         valueGetter: getCtr,
    //         minWidth: 100,
    //         sortable: true,
    //         filter: "agTextColumnFilter",
    //         comparator: (valueA, valueB) => {
    //             // Handle sorting based on the computed margin value
    //             if (valueA == null) return -1;
    //             if (valueB == null) return 1;
    //             return valueA - valueB;
    //         },
    //         valueFormatter: (params) => `${params.value}%`,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu' // Add a custom class
            
    //     },
    //     rpc: {
    //         headerName: 'RPC',
    //         field: 'rpc',
    //         minWidth: 80,
    //         valueGetter: getRpc,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "RPC = Revenue / Conversions",
    //         cellStyle: { fontWeight: 'bold' }
    //     },
    //     cpl: {
    //         headerName: 'CPL',
    //         field: 'cpl',
    //         minWidth: 80,
    //         valueGetter: getCpl,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "CPL = Spend / FBLeads",
            
    //     },
    //     ncpl: {
    //         headerName: 'NCPL',
    //         field: 'ncpl',
    //         minWidth: 90,
    //         valueGetter: getNcpl,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "NCPL = Spend / Conversions",
            
    //     },
    //     fmargin: {
    //         headerName: 'FMargin',
    //         field: 'fmargin',
    //         minWidth: 120,
    //         valueGetter: getFmargin,
    //         sortable: true,
    //         filter: "agTextColumnFilter",
    //         comparator: (valueA, valueB) => {
    //             // Handle sorting based on the computed margin value
    //             if (valueA == null) return -1;
    //             if (valueB == null) return 1;
    //             return valueA - valueB;
    //         },
    //         valueFormatter: (params) => `${params.value}%`,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "FMargin = (Profit / Spend) * 100",
            
    //     },
    //     roi: {
    //         headerName: 'ROI',
    //         field: 'roi',
    //         minWidth: 100,
    //         valueGetter: getROI,
    //         filter: "agNumberColumnFilter",
    //         comparator: (valueA, valueB) => {
    //             // Handle sorting based on the computed margin value
    //             if (valueA == null) return -1;
    //             if (valueB == null) return 1;
    //             return valueA - valueB;
    //         },
    //         valueFormatter: (params) => `${params.value}%`,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "ROI = ((Revenue - Spend) / Spend) * 100",
            
    //     },
    //     adsetid: {
    //         headerName: 'AdsetId',
    //         field: 'adsetid',
    //         sortable: true,
    //         filter: "agTextColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu' 
    //     },
    //     campaignid: {
    //         headerName: 'CampaignId',
    //         field: 'campaignid',
    //         sortable: true,
    //         filter: "agTextColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu' 
    //     },
    //     timezone: {
    //         headerName: 'TimeZone',
    //         field: 'timezone',
    //         filter: "agTextColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu' 
    //     },
    // };

    // const columnDefsObjectOfDailyAdIDAdsetLevel = {
    //     campaignname: {
    //         headerName: 'CampaignName',
    //         field: 'campaignname',
    //         resizable: true,
    //         sortable: true,
    //         width: 500,
    //         hide: true,
    //         // rowGroup: true,
    //         // rowGroupIndex: 0, // Level 0
    //         // pinned: 'left',
    //         // enableRowGroup: true,
    //         // onClick: (event) => {
    //         //     const url = `/history/${event}-${account}-${time}`;
    //         //     window.open(url, '_blank', 'noopener,noreferrer');
    //         // },
    //         // cellRenderer: campaignNameRenderer,
    //     },
    //     actions: {
    //         headerName: 'Actions',
    //         field: 'actions',
    //         minWidth: 90,
    //         sortable: false,    // Ensure sorting is disabled
    //         filter: false,      // Ensure filtering is disabled
    //         enableSorting: false,  // Disable sorting at the column level
    //         enableFilter: false,
    //         hide: false,
    //         suppressMenu: true,
    //         hide: !isYesterday(),
    //         cellRenderer: (params) => {
    //             const [isModalVisible, setIsModalVisible] = useState(false);
    //             const [newgroupedData, setNewGroupedData] = useState([]);
    //             const [groupedData, setGroupedData] = useState([]);
    //             const [changeBudget, onChangeBudget] = useState();
    //             const [campaignStatus, setCampaignStatus] = useState(true);
    //             const [campaignActualSpend, setCampaignActualSpend] = useState({});

    //             const onChangeSpendAndStatus = async () => {
    //                 // Check if it's a group footer row (for groupIncludeFooter)
    //                 if (params?.node?.footer) {
    //                     // console.log("This is a groupIncludeFooter row. Modal will not open.");
    //                     return; // Prevent modal from opening for group footer rows
    //                 }

    //                 // Ensure allLeafChildren exists and is an array before proceeding
    //                 const allLeafChildren = params.node?.allLeafChildren || [];
    //                 setNewGroupedData(groupedData);
    //                 // Fetch all the rows under the current group
    //                 const groupedData = allLeafChildren.map(node => node.data) || [];
    //                 const campaignId = groupedData[0]?.campaignid;

    //                 // Only show the modal if there is data (groupedData length is greater than 0)
    //                 if (groupedData.length > 0) {
    //                     const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
    //                     const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
    //                     if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
    //                         setGroupedData(getCampaignResponse.data);
    //                         setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
    //                         onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
    //                     }
    //                     if(getCampaignActualSpend.status === 200){
    //                         console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
    //                         setCampaignActualSpend(getCampaignActualSpend.data);
    //                     }
    //                     else {
    //                         setGroupedData(groupedData);
    //                         // console.log("dailyadd");
    //                     }
    //                     // Set the grouped data for the modal
    //                     setIsModalVisible(true); // Show the modal for non-footer rows
    //                 }
    //             };

    //             const handleOk = async () => {
    //                 setIsModalVisible(false); // Close the modal
    //                 const object = {
    //                     campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
    //                     adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
    //                     campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
    //                     usercommit: userdetails?.email,
    //                     accountNumber: newaccount,
    //                     budget: changeBudget * 100,
    //                     status: campaignStatus
    //                 };
    //                 console.log(object);
    //                 const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
    //                 const responseData = requestResponse.data;
    //                 // console.log(responseData, "response");
    //                 message.success("Budget and Status Updated");
    //                 changeRRefrst();
    //             };

    //             const handleCancel = () => {
    //                 setIsModalVisible(false);
    //                 // console.log(changeBudget); // Close the modal
    //             };

    //             const getTotalSpend = (data) => {
    //                 if (!data || data.length === 0) return 0;
    //                 const total = data.reduce((total, item) => {
    //                     return total + (parseFloat(item?.spend) || 0);
    //                 }, 0);
    //                 return Math.round(total * 100) / 100; // Round to 2 decimal places
    //             };

    //             const onChangeBudgetValue = event => {
    //                 onChangeBudget(event.target.value)
    //             }
    //             const onChangeCampaignStatus = async () => {
    //                 const apiEndpoint = campaignStatus
    //                     ? 'https://prodapis.adsgoat.in/campaignStatusPause/' // Pause campaign
    //                     : 'https://prodapis.adsgoat.in/campaignStatusActive/'; // Activate campaign
                
    //                 try {
    //                     const response = await axios.post(apiEndpoint, 
    //                         { campaignId: groupedData[0]?.campaignid }, 
    //                         { headers: { Authorization: token } }
    //                     );
    //                     if (response.status === 200) {
    //                         message.success(`Campaign ${groupedData[0]?.campaignid} status updated to ${campaignStatus ? 'Paused' : 'Active'}`);
    //                         setCampaignStatus((prev) => !prev); // Toggle the status
    //                     } else {
    //                         message.error('Failed to update campaign status.');
    //                     }
    //                 } catch (error) {
    //                     console.error('Error updating campaign status:', error);
    //                     message.error('Error updating campaign status.');
    //                 }
    //             };

    //             return (
    //                 <div>
    //                     <div onClick={onChangeSpendAndStatus}>
    //                         <span>{params.value || "..."}</span> {/* Fallback to '...' if status is not available */}
    //                     </div>
    //                     {/* Modal should only be shown for non-footer rows and when groupedData length is greater than 0 */}
    //                     {isModalVisible && (
    //                         <Modal
    //                             title={groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignname : groupedData?.campaignname}
    //                             visible={isModalVisible}
    //                             onOk={handleOk}
    //                             onCancel={handleCancel}
    //                             width={600}  // Set a custom width for the modal
    //                             style={{ padding: '20px' }}  // Adjust body padding
    //                             okButtonProps={{ style: { backgroundColor: '#C7F39A', borderColor: '#C7F39A' } }} 
    //                         >
    //                             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    //                                 <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
    //                                     <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
    //                                     <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#C7F39A"}} onChange={onChangeCampaignStatus} />
    //                                 </div>

    //                                 {/* Input Field */}
    //                                 <div style={{ display: 'flex', flexDirection: 'column' }}>
    //                                     <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
    //                                     <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
    //                                 </div>

    //                                 {/* Campaign ID */}
    //                                 <div style={{ display: 'flex', flexDirection: 'column' }}>
    //                                     <Typography.Text strong>Campaign ID:</Typography.Text>
    //                                     <p>{campaignActualSpend?.id}</p>
    //                                 </div>
    //                             </div>
    //                         </Modal>
    //                     )}
    //                 </div>
    //             );
    //         },
    //         filterParams: { filterEnabled: false },

    //     },
    //     adid: {
    //         headerName: 'AdID',
    //         field: 'adid',
    //         sortable: true,
    //         minWidth: 350,
    //         filter: 'agSetColumnFilter',
    //         // filterParams: {
    //         //     comparator: (a, b) => a.localeCompare(b),
    //         //     suppressAndOrCondition: true,
    //         // },
    //         // suppressMenu: true,    // Suppress the column menu
    //         // hide: true,
            
    //     },
    //     from:{
    //         headerName: 'From',
    //         field: 'from',
    //         valueGetter: (params) => {
    //           if (params.node.group) {
    //             const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
    //             const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
    //             // const {  start } = campaignStatus;
    //             // console.log(params.node.groupData?.campaignname, "groupData");
    //             // console.log(params.node.key, "start");
    //             return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
    //           }
    //           return '';
    //         },
    //         cellClassRules: {
    //           'hide-leaf-cell': (params) => !params.node.group,
    //         },
    //         minWidth: 110,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //     },
    //     profitloss:{
    //         headerName: 'P/L',
    //         field: 'profitloss',
    //         minWidth: 110,
    //         valueGetter: (params) => {
    //           if (params.node.group) {
    //             const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
    //             const campaignData = allProfitLossArray?.items?.filter(obj => obj.campaign_name === campaignName);
    //             const revenue = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.estimated_revenue) || 0), 0);
    //             const spend = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.spend) || 0), 0);
    //             // const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
    //             // const {  start } = campaignStatus;
    //             // console.log(params.node.groupData?.campaignname, "groupData");
    //             // console.log(params.node.key, "start");
    //             // return campaignStatus?.start || 'Unknown';
    //             return (revenue - spend) ? (revenue - spend).toFixed(2) : "" || "";
    //           }
    //           return '';
    //         },
    //         cellClassRules: {
    //           'hide-leaf-cell': (params) => !params.node.group,
    //         },
    //         cellStyle: { fontWeight: 'bold' },
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //     },
    //     adsetname: {
    //         headerName: 'AdsetName', field: 'adsetname',
    //         // resizeble: true,
    //         sortable: true,
    //         width: 350,
    //         rowGroup: true, 
    //         rowGroupIndex: 0, // Level 1
    //         hide: true,
    //         filter: 'agSetColumnFilter',
    //         filterParams: {
    //             comparator: (a, b) => a.localeCompare(b),
    //             suppressAndOrCondition: true,
    //         }, 
    //     },
    //     adname: {
    //         headerName: 'AdName', field: 'adname',
    //         // resizeble: true,
    //         sortable: true,
    //         width: 300,
    //         rowGroup: true, 
    //         rowGroupIndex: 1, // Level 2
    //         hide: true,
    //         filter: 'agSetColumnFilter',
    //         filterParams: {
    //             comparator: (a, b) => a.localeCompare(b),
    //             suppressAndOrCondition: true,
    //         }, 
    //     },
    //     date: {
    //         headerName: 'Date', field: 'date', minWidth: 110, sortable: true,
    //         filter: "agDateColumnFilter",
    //         sort: "asc",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         filterParams: {
    //             comparator: (filterLocalDateAtMidnight, cellValue) => {
    //                 const dateAsString = cellValue;
    //                 if (dateAsString == null) return -1;
    //                 const dateParts = dateAsString.split("/");
    //                 const cellDate = new Date(
    //                     Number(dateParts[2]),
    //                     Number(dateParts[1]) - 1,
    //                     Number(dateParts[0])
    //                 );

    //                 if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
    //                     return 0;
    //                 }

    //                 if (cellDate < filterLocalDateAtMidnight) {
    //                     return -1;
    //                 }

    //                 if (cellDate > filterLocalDateAtMidnight) {
    //                     return 1;
    //                 }
    //                 return 0;
    //             }
    //         },
    //     },
    //     'fb-hour': { headerName: 'F-H', field: 'fb-hour', minWidth: 85, sortable: true, hide: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    //     'mnet-hour': { headerName: 'M-H', field: 'mnet-hour', minWidth: 95, sortable: true, hide: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    //     spend: {
    //         headerName: 'Spend',
    //         field: 'spend',
    //         minWidth: 105,
    //         aggFunc: liveSpender,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         valueFormatter: currencyFormatter, // Format display as currency
    //         comparator: numberComparator,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //     },
    //     revenue: {
    //         headerName: 'Revenue',
    //         field: 'revenue',
    //         minWidth: 105,
    //         aggFunc: liveSpender,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         valueFormatter: currencyFormatter,
    //         comparator: numberComparator,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //     },
    //     profit: {
    //         headerName: 'Profit',
    //         field: 'profit',
    //         minWidth: 105,
    //         aggFunc: liveSpender,
    //         sortable: true,
    //         cellClassRules: {
    //             'font-red': p => p.value < 0 // Conditional formatting for negative profit
    //         },
    //         filter: "agNumberColumnFilter",
    //         valueFormatter: currencyFormatter,
    //         comparator: numberComparator,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: 'Profit = Revenue - Spend',
    //     },
    //     margin: {
    //         headerName: 'Margin', field: 'margin', valueGetter: getMargin, sortable: true, headerTooltip: '(Profit/Revenue)*100', filter: 'agNumberColumnFilter',
    //         minWidth: 100,
    //         comparator: (valueA, valueB) => {
    //             // Handle sorting based on the computed margin value
    //             if (valueA == null) return -1;
    //             if (valueB == null) return 1;
    //             return valueA - valueB;
    //         },
    //         valueFormatter: (params) => `${params.value}%`,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class

    //     },
    //     fbleads: { headerName: 'FBLeads', field: 'fbleads', minWidth: 105, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    //     conversions: { headerName: 'Conv', field: 'conversions', headerTooltip: "Conversions", minWidth: 85, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    //     cpc: {
    //         headerName: 'CPC', field: 'cpc',
    //         minWidth: 80,
    //         aggFunc: (params) => {
    //             const sum = params.values.reduce((sum, value) => sum + parseFloat(value), 0);
    //             return sum / params.values.length;
    //         },
    //         valueFormatter: params => params.value !== undefined ? Math.round(params.value * 100) / 100 : '',
    //         sortable: true, filter: 'agNumberColumnFilter',
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "CPC = Spend / FBClicks",

    //     },
    //     cpclinkclicks: {
    //         headerName: 'CPC_LC',
    //         field: 'cpclinkclicks',
    //         // aggFunc: cpcSpender,
    //         valueGetter:getCpcLc,
    //         minWidth: 80,
    //         sortable: true,
    //         filter: "agNumberColumnFilter",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
            
    //     },
    //     fbclicks: { headerName: 'FBClicks', field: 'fbclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    //     fblinkclicks: { headerName: 'FB_LC', field: 'fblinkclicks', headerTooltip:'fblinkclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    //     impressions: { headerName: 'IMP', field: 'impressions', headerTooltip:"Impressions", minWidth: 80, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    //     ctr: {
    //         headerName: 'CTR', field: 'ctr', valueGetter: getCtr, sortable: true,
    //         minWidth: 100,
    //         comparator: (valueA, valueB) => {
    //             // Handle sorting based on the computed margin value
    //             if (valueA == null) return -1;
    //             if (valueB == null) return 1;
    //             return valueA - valueB;
    //         },
    //         valueFormatter: (params) => `${params.value}%`,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "CTR = (FBClicks / Impressions) * 100",
    //     },
    //     rpc: {
    //         headerName: 'RPC', field: 'rpc', valueGetter: getRpc, sortable: true, filter: 'agNumberColumnFilter',
    //         minWidth: 80,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "RPC = Revenue / Conversions",
    //         cellStyle: { fontWeight: 'bold' }
    //     },
    //     cpl: { headerName: 'CPL', field: 'cpl', minWidth:80, valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "CPL = Spend / FBLeads" },
    //     ncpl: { headerName: 'NCPL', field: 'ncpl', minWidth:90, valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "NCPL = Spend / Conversions" },
    //     fmargin: {
    //         headerName: 'FMargin', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: true,
    //         minWidth: 120,
    //         comparator: (valueA, valueB) => {
    //             // Handle sorting based on the computed margin value
    //             if (valueA == null) return -1;
    //             if (valueB == null) return 1;
    //             return valueA - valueB;
    //         },
    //         valueFormatter: (params) => `${params.value}%`,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "FMargin = (Profit / Spend) * 100",
    //     },
    //     roi: {
    //         headerName: 'ROI', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: '(Profit/Spend)*100', filter: true,
    //         comparator: (valueA, valueB) => {
    //             // Handle sorting based on the computed margin value
    //             if (valueA == null) return -1;
    //             if (valueB == null) return 1;
    //             return valueA - valueB;
    //         },
    //         minWidth: 100,
    //         valueFormatter: (params) => `${params.value}%`,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu', // Add a custom class
    //         headerTooltip: "ROI = (Revenue - Spend) / Spend",
    //     },
    //     adsetid: { headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter", hide: false, suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    //     campaignid: { headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter",  suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    //     timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    // };


    const columnDefsObjectAdsetLevel = {
        M_tq: {
            headerName: 'M_TQ',
            field: 'M_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },             
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        },
          D_tq: {
            headerName: 'D_TQ',
            field: 'D_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        },  
        campaignname: {
            headerName: 'CampaignName',
            field: 'campaignname',
            resizable: true,
            sortable: true,
            hide: true,
            
        },
        actions: {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 90,
            // sortable: true,
            // filter: true,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            suppressMenu: true,    // Suppress the column menu
            menuTabs: [],
            hide: !isYesterday(),
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [newgroupedData, setNewGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignStatus, setCampaignStatus] = useState(true);
                const [campaignActualSpend, setCampaignActualSpend] = useState({});

                const onChangeSpendAndStatus = async () => {
                    if (params?.node?.rowPinned === 'bottom') {
                        return ""; // Return empty string to remove "..."
                    }
                    if (params?.node?.footer) {
                        return ""; // Prevent modal from opening for group footer rows
                    }
                    const allLeafChildren = params.node?.allLeafChildren || [];

                    // Fetch all the rows under the current group
                    const groupedData = allLeafChildren.map(node => node.data) || [];
                    setNewGroupedData(groupedData);
                    const campaignId = groupedData[0]?.campaignid;
                    // console.log(groupedData, "groupedData");

                    // Only show the modal if there is data (groupedData length is greater than 0)
                    if (groupedData.length > 0) {
                        const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
                        const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
                        if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
                            
                            setGroupedData(getCampaignResponse.data);
                            setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
                            onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
                        }
                        if(getCampaignActualSpend.status === 200){
                            // console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
                            setCampaignActualSpend(getCampaignActualSpend.data);
                        }
                        else {
                            setGroupedData(groupedData);
                        }
                        // Set the grouped data for the modal
                        setIsModalVisible(true); // Show the modal for non-footer rows
                    }
                    // if(groupedData.length > 0) {
                        
                    //     const getCampaignActualSpend = await apiClient.get(`http://localhost:8000/get/ActualCampaginSpend?campaignId=${campaignId}`);
                    //     if (getCampaignActualSpend.status === 200){
                    //         setCampaignActualSpend(getCampaignActualSpend.data);
                    //     }
                    // }
                };

                const handleOk = async () => {
                    setIsModalVisible(false); // Close the modal
                    const object = {
                        campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
                        adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
                        campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
                        usercommit: userdetails?.email,
                        accountNumber: newaccount,
                        budget: changeBudget * 100,
                        status: campaignStatus
                    };
                    // console.log(object);
                    const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
                    const responseData = requestResponse.data;
                    // console.log(responseData, "response");
                    message.success("Budget and Status Updated");
                    changeRRefrst();
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                    // console.log(changeBudget); // Close the modal
                };

                const getTotalSpend = (data) => {
                    if (!data || data.length === 0) return 0;
                    const total = data.reduce((total, item) => {
                        return total + (parseFloat(item?.spend) || 0);
                    }, 0);
                    console.log(total, "total");
                    return Math.round(total * 100) / 100; // Round to 2 decimal places
                };

                const onChangeBudgetValue = event => {
                    onChangeBudget(event.target.value)
                }

                const onChangeCampaignStatus = async () => {
                    const apiEndpoint = campaignStatus
                        ? '/campaignStatusPause/' // Pause campaign
                        : '/campaignStatusActive/'; // Activate campaign
                
                    try {
                        const response = await apiClient.post(apiEndpoint, 
                            { campaignId: groupedData[0]?.campaignid }
                        );
                        if (response.status === 200) {
                            message.success(`Campaign ${groupedData[0]?.campaignid} status updated to ${campaignStatus ? 'Paused' : 'Active'}`);
                            setCampaignStatus((prev) => !prev); // Toggle the status
                        } else {
                            message.error('Failed to update campaign status.');
                        }
                    } catch (error) {
                        console.error('Error updating campaign status:', error);
                        message.error('Error updating campaign status.');
                    }
                };
                // console.log()

                return (
                    <div>
                        <div onClick={onChangeSpendAndStatus}>
                            <span>{params.value || "..."}</span> 
                        </div>
                        {isModalVisible && (
                            <Modal
                                title={groupedData?.length > 0 && groupedData?.length !== 1 ? groupedData[0]?.campaignname : groupedData?.campaignname}
                                visible={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                width={600}  
                                style={{ padding: '20px' }}
                                okButtonProps={{ style: { backgroundColor: '#C7F39A', borderColor: '#C7F39A' } }} 
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#C7F39A"}} onChange={onChangeCampaignStatus} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong>Campaign ID:</Typography.Text>
                                        <p>{campaignActualSpend?.id}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
        },
        adsetname: {
            headerName: 'AdsetName',
            field: 'adsetname',
            sortable: true,
            minWidth: 450,
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            },
            suppressMenu: true,    // Suppress the column menu
            width: 500,
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
            pinned: 'left',
            
        },
        adname: {
            headerName: 'AdName', field: 'adname',
            // resizeble: true,
            // sortable: true,
            // width: 300,
            // rowGroup: true, 
            // rowGroupIndex: 1, // Level 2
            // hide: true,
            // filter: 'agSetColumnFilter',
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // }, 
            // showRowGroup: 'adname',
            hide: true,
        },
        adid: {
            headerName: 'AdID',
            field: 'adid',
            // sortable: true,
            // minWidth: 200,
            // filter: 'agSetColumnFilter',
            hide: true,
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // },
            // suppressMenu: true,    // Suppress the column menu
            
        },
        from: {
            headerName: 'From',
            field: 'from',
            minWidth: 110,
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName =
                  params.node.groupData?.campaignname || params.node.key;
                return moment(campaignMap.get(campaignName), "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profitloss:{
              headerName: 'P/L',
              field: 'profitloss',
              valueGetter: (params) => {
                if (params.node.group) {
                  const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                  const campaignData = allProfitLossArray?.items?.filter(obj => obj.campaign_name === campaignName);
                  const revenue = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.estimated_revenue) || 0), 0);
                  const spend = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.spend) || 0), 0);
                //   console.log(revenue, "revenue");
                //   console.log(spend, "spend");
                  // const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                  // const {  start } = campaignStatus;
                  // console.log(params.node.groupData?.campaignname, "groupData");
                  // console.log(params.node.key, "start");
                  // return campaignStatus?.start || 'Unknown';
                  return (revenue - spend) ? (revenue - spend).toFixed(2) : ""  || "";
                }
                return '';
              },
              minWidth: 110,
              cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
              },
              cellStyle: { fontWeight: 'bold' },
              suppressMenu: true,
              menuTabs: [],
              headerClass: 'hide-menu', // Add a custom class
          },
        date: {
            headerName: 'Date',
            field: 'date',
            minWidth: 110,
            sortable: true,
            sort: "asc",
            filter: "agDateColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    const dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    const dateParts = dateAsString.split("/");
                    const cellDate = new Date(
                        Number(dateParts[2]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[0])
                    );

                    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                        return 0;
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                    return 0;
                },
            },
        },
        'fb-hour': {
            headerName: 'F-H',
            field: 'fb-hour',
            width: 85,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        'mnet-hour': {
            headerName: 'N-H',
            field: 'mnet-hour',
            minWidth: 95,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        spend: {
            headerName: 'Spend',
            field: 'spend',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agTextColumnFilter", // Keep filter active
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Total amount spent",
        },       
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            sortable: true,
            aggFunc: liveSpender,
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Profit = Revenue - Spend",
            
        },
        margin: {
            headerName: 'Margin',
            field: 'margin',
            minWidth: 100,
            valueGetter: getMargin,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Margin = (Profit / Revenue) * 100",
            
        },
        fbleads: {
            headerName: 'FBLeads',
            field: 'fbleads',
            minWidth: 105,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        conversions: {
            headerName: 'Conv',
            field: 'conversions',
            minWidth: 85,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            
            headerTooltip: "Conversions",
            
        },
        cpc: {
            headerName: 'CPC',
            field: 'cpc',
            // valueGetter: (params) => {
            //     if (params.node.group && params.node.aggData) {
            //         return sanitizeNumericValue(params.node.aggData["cpc"]) || 0;
            //     }
            //     return sanitizeNumericValue(params.data?.cpc);
            // },
            aggFunc: cpcSpender,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CPC = Spend / FBClicks",
            
        },
        cpclinkclicks: {
            headerName: 'CPC_LC',
            field: 'cpclinkclicks',
            // aggFunc: cpcSpender,
            valueGetter:getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
            
        },
        fbclicks: {
            headerName: 'FBClicks',
            field: 'fbclicks',
            minWidth: 110,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        fblinkclicks: {
            headerName: 'FB_LC',
            field: 'fblinkclicks', 
            headerTooltip:'fblinkclicks',
            minWidth: 110,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        impressions: {
            headerName: 'IMP',
            field: 'impressions',
            minWidth: 100,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Impressions",
        },
        ctr: {
            headerName: 'CTR',
            field: 'ctr',
            valueGetter: getCtr,
            minWidth: 100,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        rpc: {
            headerName: 'RPC',
            field: 'rpc',
            minWidth: 80,
            valueGetter: getRpc,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "RPC = Revenue / Conversions",
            cellStyle: { fontWeight: 'bold' } // Make text bold
        },
        cpl: {
            headerName: 'CPL',
            field: 'cpl',
            minWidth: 80,
            valueGetter: getCpl,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CPL = Spend / FBLeads",
            
        },
        ncpl: {
            headerName: 'NCPL',
            field: 'ncpl',
            minWidth: 90,
            valueGetter: getNcpl,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "NCPL = Spend / Conversions",
            
        },
        fmargin: {
            headerName: 'FMargin',
            field: 'fmargin',
            minWidth: 120,
            valueGetter: getFmargin,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "FMargin = (Profit / Spend) * 100",
            
        },
        roi: {
            headerName: 'ROI',
            field: 'roi',
            minWidth: 100,
            valueGetter: getROI,
            filter: "agNumberColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "ROI = ((Revenue - Spend) / Spend) * 100",
            
        },
        adsetid: {
            headerName: 'AdsetId',
            field: 'adsetid',
            sortable: true,
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' 
        },
        campaignid: {
            headerName: 'CampaignId',
            field: 'campaignid',
            sortable: true,
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' 
        },
        timezone: {
            headerName: 'TimeZone',
            field: 'timezone',
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' 
        },
    };

    const columnDefsObjectAdLevel = {
        M_tq: {
            headerName: 'M_TQ',
            field: 'M_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },             
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        },
          D_tq: {
            headerName: 'D_TQ',
            field: 'D_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        },  
        campaignname: {
            headerName: 'CampaignName',
            field: 'campaignname',
            resizable: true,
            sortable: true,
            hide: true,
            
        },
        actions: {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 90,
            // sortable: true,
            // filter: true,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            suppressMenu: true,    // Suppress the column menu
            menuTabs: [],
            hide: !isYesterday(),
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [newgroupedData, setNewGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignStatus, setCampaignStatus] = useState(true);
                const [campaignActualSpend, setCampaignActualSpend] = useState({});

                const onChangeSpendAndStatus = async () => {
                    if (params?.node?.rowPinned === 'bottom') {
                        return ""; // Return empty string to remove "..."
                    }
                    if (params?.node?.footer) {
                        return ""; // Prevent modal from opening for group footer rows
                    }
                    const allLeafChildren = params.node?.allLeafChildren || [];

                    // Fetch all the rows under the current group
                    const groupedData = allLeafChildren.map(node => node.data) || [];
                    setNewGroupedData(groupedData);
                    const campaignId = groupedData[0]?.campaignid;
                    // console.log(groupedData, "groupedData");

                    // Only show the modal if there is data (groupedData length is greater than 0)
                    if (groupedData.length > 0) {
                        const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
                        const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
                        if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
                            
                            setGroupedData(getCampaignResponse.data);
                            setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
                            onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
                        }
                        if(getCampaignActualSpend.status === 200){
                            // console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
                            setCampaignActualSpend(getCampaignActualSpend.data);
                        }
                        else {
                            setGroupedData(groupedData);
                        }
                        // Set the grouped data for the modal
                        setIsModalVisible(true); // Show the modal for non-footer rows
                    }
                    // if(groupedData.length > 0) {
                        
                    //     const getCampaignActualSpend = await apiClient.get(`http://localhost:8000/get/ActualCampaginSpend?campaignId=${campaignId}`);
                    //     if (getCampaignActualSpend.status === 200){
                    //         setCampaignActualSpend(getCampaignActualSpend.data);
                    //     }
                    // }
                };

                const handleOk = async () => {
                    setIsModalVisible(false); // Close the modal
                    const object = {
                        campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
                        adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
                        campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
                        usercommit: userdetails?.email,
                        accountNumber: newaccount,
                        budget: changeBudget * 100,
                        status: campaignStatus
                    };
                    // console.log(object);
                    const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
                    const responseData = requestResponse.data;
                    // console.log(responseData, "response");
                    message.success("Budget and Status Updated");
                    changeRRefrst();
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                    // console.log(changeBudget); // Close the modal
                };

                const getTotalSpend = (data) => {
                    if (!data || data.length === 0) return 0;
                    const total = data.reduce((total, item) => {
                        return total + (parseFloat(item?.spend) || 0);
                    }, 0);
                    // console.log(total, "total");
                    return Math.round(total * 100) / 100; // Round to 2 decimal places
                };

                const onChangeBudgetValue = event => {
                    onChangeBudget(event.target.value)
                }

                const onChangeCampaignStatus = async () => {
                    const apiEndpoint = campaignStatus
                        ? '/campaignStatusPause/' // Pause campaign
                        : '/campaignStatusActive/'; // Activate campaign
                
                    try {
                        const response = await apiClient.post(apiEndpoint, 
                            { campaignId: groupedData[0]?.campaignid }
                        );
                        if (response.status === 200) {
                            message.success(`Campaign ${groupedData[0]?.campaignid} status updated to ${campaignStatus ? 'Paused' : 'Active'}`);
                            setCampaignStatus((prev) => !prev); // Toggle the status
                        } else {
                            message.error('Failed to update campaign status.');
                        }
                    } catch (error) {
                        console.error('Error updating campaign status:', error);
                        message.error('Error updating campaign status.');
                    }
                };
                // console.log()

                return (
                    <div>
                        <div onClick={onChangeSpendAndStatus}>
                            <span>{params.value || "..."}</span> 
                        </div>
                        {isModalVisible && (
                            <Modal
                                title={groupedData?.length > 0 && groupedData?.length !== 1 ? groupedData[0]?.campaignname : groupedData?.campaignname}
                                visible={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                width={600}  
                                style={{ padding: '20px' }}
                                okButtonProps={{ style: { backgroundColor: '#C7F39A', borderColor: '#C7F39A' } }} 
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#C7F39A"}} onChange={onChangeCampaignStatus} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong>Campaign ID:</Typography.Text>
                                        <p>{campaignActualSpend?.id}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
        },
        adsetname: {
            headerName: 'AdsetName',
            field: 'adsetname',
            sortable: true,
            minWidth: 450,
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            },
            suppressMenu: true,    // Suppress the column menu
            hide: true,
            
        },
        adname: {
            headerName: 'AdName', field: 'adname',
            // resizeble: true,
            // sortable: true,
            // width: 300,
            // rowGroup: true, 
            // rowGroupIndex: 1, // Level 2
            // hide: true,
            // filter: 'agSetColumnFilter',
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // }, 
            // showRowGroup: 'adname',
            width: 500,
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
            pinned: 'left',
        },
        adid: {
            headerName: 'AdID',
            field: 'adid',
            // sortable: true,
            // minWidth: 200,
            // filter: 'agSetColumnFilter',
            // hide: true,
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            },
            // suppressMenu: true,    // Suppress the column menu
            
        },
        from: {
            headerName: 'From',
            field: 'from',
            minWidth: 110,
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName =
                  params.node.groupData?.campaignname || params.node.key;
                return moment(campaignMap.get(campaignName), "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profitloss:{
              headerName: 'P/L',
              field: 'profitloss',
              valueGetter: (params) => {
                if (params.node.group) {
                  const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                  const campaignData = allProfitLossArray?.items?.filter(obj => obj.campaign_name === campaignName);
                  const revenue = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.estimated_revenue) || 0), 0);
                  const spend = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.spend) || 0), 0);
                //   console.log(revenue, "revenue");
                //   console.log(spend, "spend");
                  // const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                  // const {  start } = campaignStatus;
                  // console.log(params.node.groupData?.campaignname, "groupData");
                  // console.log(params.node.key, "start");
                  // return campaignStatus?.start || 'Unknown';
                  return (revenue - spend) ? (revenue - spend).toFixed(2) : ""  || "";
                }
                return '';
              },
              minWidth: 110,
              cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
              },
              cellStyle: { fontWeight: 'bold' },
              suppressMenu: true,
              menuTabs: [],
              headerClass: 'hide-menu', // Add a custom class
          },
        date: {
            headerName: 'Date',
            field: 'date',
            minWidth: 110,
            sortable: true,
            sort: "asc",
            filter: "agDateColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    const dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    const dateParts = dateAsString.split("/");
                    const cellDate = new Date(
                        Number(dateParts[2]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[0])
                    );

                    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                        return 0;
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                    return 0;
                },
            },
        },
        'fb-hour': {
            headerName: 'F-H',
            field: 'fb-hour',
            width: 85,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        'mnet-hour': {
            headerName: 'N-H',
            field: 'mnet-hour',
            minWidth: 95,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        spend: {
            headerName: 'Spend',
            field: 'spend',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agTextColumnFilter", // Keep filter active
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Total amount spent",
        },       
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            sortable: true,
            aggFunc: liveSpender,
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Profit = Revenue - Spend",
            
        },
        margin: {
            headerName: 'Margin',
            field: 'margin',
            minWidth: 100,
            valueGetter: getMargin,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Margin = (Profit / Revenue) * 100",
            
        },
        fbleads: {
            headerName: 'FBLeads',
            field: 'fbleads',
            minWidth: 105,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        conversions: {
            headerName: 'Conv',
            field: 'conversions',
            minWidth: 85,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            
            headerTooltip: "Conversions",
            
        },
        cpc: {
            headerName: 'CPC',
            field: 'cpc',
            // valueGetter: (params) => {
            //     if (params.node.group && params.node.aggData) {
            //         return sanitizeNumericValue(params.node.aggData["cpc"]) || 0;
            //     }
            //     return sanitizeNumericValue(params.data?.cpc);
            // },
            aggFunc: cpcSpender,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CPC = Spend / FBClicks",
            
        },
        cpclinkclicks: {
            headerName: 'CPC_LC',
            field: 'cpclinkclicks',
            // aggFunc: cpcSpender,
            valueGetter:getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
            
        },
        fbclicks: {
            headerName: 'FBClicks',
            field: 'fbclicks',
            minWidth: 110,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        fblinkclicks: {
            headerName: 'FB_LC',
            field: 'fblinkclicks', 
            headerTooltip:'fblinkclicks',
            minWidth: 110,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        impressions: {
            headerName: 'IMP',
            field: 'impressions',
            minWidth: 100,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Impressions",
        },
        ctr: {
            headerName: 'CTR',
            field: 'ctr',
            valueGetter: getCtr,
            minWidth: 100,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        rpc: {
            headerName: 'RPC',
            field: 'rpc',
            minWidth: 80,
            valueGetter: getRpc,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "RPC = Revenue / Conversions",
            cellStyle: { fontWeight: 'bold' } // Make text bold
        },
        cpl: {
            headerName: 'CPL',
            field: 'cpl',
            minWidth: 80,
            valueGetter: getCpl,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CPL = Spend / FBLeads",
            
        },
        ncpl: {
            headerName: 'NCPL',
            field: 'ncpl',
            minWidth: 90,
            valueGetter: getNcpl,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "NCPL = Spend / Conversions",
            
        },
        fmargin: {
            headerName: 'FMargin',
            field: 'fmargin',
            minWidth: 120,
            valueGetter: getFmargin,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "FMargin = (Profit / Spend) * 100",
            
        },
        roi: {
            headerName: 'ROI',
            field: 'roi',
            minWidth: 100,
            valueGetter: getROI,
            filter: "agNumberColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "ROI = ((Revenue - Spend) / Spend) * 100",
            
        },
        adsetid: {
            headerName: 'AdsetId',
            field: 'adsetid',
            sortable: true,
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' 
        },
        campaignid: {
            headerName: 'CampaignId',
            field: 'campaignid',
            sortable: true,
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' 
        },
        timezone: {
            headerName: 'TimeZone',
            field: 'timezone',
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' 
        },
    };

    const columnDefsObject = {
        M_tq: {
            headerName: 'M_TQ',
            field: 'M_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },             
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        },
          D_tq: {
            headerName: 'D_TQ',
            field: 'D_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        },  
        campaignname: {
            headerName: 'CampaignName',
            field: 'campaignname',
            resizable: true,
            sortable: true,
            width: 500,
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
            pinned: 'left',
        },
        actions: {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 90,
            // sortable: true,
            // filter: true,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            suppressMenu: true,    // Suppress the column menu
            menuTabs: [],
            hide: !isYesterday(),
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [newgroupedData, setNewGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignStatus, setCampaignStatus] = useState(true);
                const [campaignActualSpend, setCampaignActualSpend] = useState({});

                const onChangeSpendAndStatus = async () => {
                    if (params?.node?.rowPinned === 'bottom') {
                        return ""; // Return empty string to remove "..."
                    }
                    if (params?.node?.footer) {
                        return ""; // Prevent modal from opening for group footer rows
                    }
                    const allLeafChildren = params.node?.allLeafChildren || [];

                    // Fetch all the rows under the current group
                    const groupedData = allLeafChildren.map(node => node.data) || [];
                    setNewGroupedData(groupedData);
                    const campaignId = groupedData[0]?.campaignid;
                    // console.log(groupedData, "groupedData");

                    // Only show the modal if there is data (groupedData length is greater than 0)
                    if (groupedData.length > 0) {
                        const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
                        const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
                        if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
                            
                            setGroupedData(getCampaignResponse.data);
                            setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
                            onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
                        }
                        if(getCampaignActualSpend.status === 200){
                            // console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
                            setCampaignActualSpend(getCampaignActualSpend.data);
                        }
                        else {
                            setGroupedData(groupedData);
                        }
                        // Set the grouped data for the modal
                        setIsModalVisible(true); // Show the modal for non-footer rows
                    }
                    // if(groupedData.length > 0) {
                        
                    //     const getCampaignActualSpend = await apiClient.get(`http://localhost:8000/get/ActualCampaginSpend?campaignId=${campaignId}`);
                    //     if (getCampaignActualSpend.status === 200){
                    //         setCampaignActualSpend(getCampaignActualSpend.data);
                    //     }
                    // }
                };

                const handleOk = async () => {
                    setIsModalVisible(false); // Close the modal
                    const object = {
                        campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
                        adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
                        campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
                        usercommit: userdetails?.email,
                        accountNumber: newaccount,
                        budget: changeBudget * 100,
                        status: campaignStatus
                    };
                    // console.log(object);
                    const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
                    const responseData = requestResponse.data;
                    // console.log(responseData, "response");
                    message.success("Budget and Status Updated");
                    changeRRefrst();
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                    // console.log(changeBudget); // Close the modal
                };

                const getTotalSpend = (data) => {
                    if (!data || data.length === 0) return 0;
                    const total = data.reduce((total, item) => {
                        return total + (parseFloat(item?.spend) || 0);
                    }, 0);
                    // console.log(total, "total");
                    return Math.round(total * 100) / 100; // Round to 2 decimal places
                };

                const onChangeBudgetValue = event => {
                    onChangeBudget(event.target.value)
                }

                const onChangeCampaignStatus = async () => {
                    const apiEndpoint = campaignStatus
                        ? '/campaignStatusPause/' // Pause campaign
                        : '/campaignStatusActive/'; // Activate campaign
                
                    try {
                        const response = await apiClient.post(apiEndpoint, 
                            { campaignId: groupedData[0]?.campaignid }
                        );
                        if (response.status === 200) {
                            message.success(`Campaign ${groupedData[0]?.campaignid} status updated to ${campaignStatus ? 'Paused' : 'Active'}`);
                            setCampaignStatus((prev) => !prev); // Toggle the status
                        } else {
                            message.error('Failed to update campaign status.');
                        }
                    } catch (error) {
                        console.error('Error updating campaign status:', error);
                        message.error('Error updating campaign status.');
                    }
                };
                // console.log()

                return (
                    <div>
                        <div onClick={onChangeSpendAndStatus}>
                            <span>{params.value || "..."}</span> 
                        </div>
                        {isModalVisible && (
                            <Modal
                                title={groupedData?.length > 0 && groupedData?.length !== 1 ? groupedData[0]?.campaignname : groupedData?.campaignname}
                                visible={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                width={600}  
                                style={{ padding: '20px' }}
                                okButtonProps={{ style: { backgroundColor: '#C7F39A', borderColor: '#C7F39A' } }} 
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#C7F39A"}} onChange={onChangeCampaignStatus} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong>Campaign ID:</Typography.Text>
                                        <p>{campaignActualSpend?.id}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
        },
        adsetname: {
            headerName: 'AdsetName',
            field: 'adsetname',
            sortable: true,
            minWidth: 450,
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            },
            suppressMenu: true,    // Suppress the column menu
            
        },
        adname: {
            headerName: 'AdName', field: 'adname',
            // resizeble: true,
            // sortable: true,
            // width: 300,
            // rowGroup: true, 
            // rowGroupIndex: 1, // Level 2
            // hide: true,
            // filter: 'agSetColumnFilter',
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // }, 
            // showRowGroup: 'adname',
            hide: true,
        },
        adid: {
            headerName: 'AdID',
            field: 'adid',
            // sortable: true,
            // minWidth: 200,
            // filter: 'agSetColumnFilter',
            hide: true,
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // },
            // suppressMenu: true,    // Suppress the column menu
            
        },
        from: {
            headerName: 'From',
            field: 'from',
            minWidth: 110,
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName =
                  params.node.groupData?.campaignname || params.node.key;
                return moment(campaignMap.get(campaignName), "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profitloss:{
              headerName: 'P/L',
              field: 'profitloss',
              valueGetter: (params) => {
                if (params.node.group) {
                  const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                  const campaignData = allProfitLossArray?.items?.filter(obj => obj.campaign_name === campaignName);
                  const revenue = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.estimated_revenue) || 0), 0);
                  const spend = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.spend) || 0), 0);
                //   console.log(revenue, "revenue");
                //   console.log(spend, "spend");
                  // const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                  // const {  start } = campaignStatus;
                  // console.log(params.node.groupData?.campaignname, "groupData");
                  // console.log(params.node.key, "start");
                  // return campaignStatus?.start || 'Unknown';
                  return (revenue - spend) ? (revenue - spend).toFixed(2) : ""  || "";
                }
                return '';
              },
              minWidth: 110,
              cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
              },
              cellStyle: { fontWeight: 'bold' },
              suppressMenu: true,
              menuTabs: [],
              headerClass: 'hide-menu', // Add a custom class
          },
        date: {
            headerName: 'Date',
            field: 'date',
            minWidth: 110,
            sortable: true,
            sort: "asc",
            filter: "agDateColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    const dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    const dateParts = dateAsString.split("/");
                    const cellDate = new Date(
                        Number(dateParts[2]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[0])
                    );

                    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                        return 0;
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                    return 0;
                },
            },
        },
        'fb-hour': {
            headerName: 'F-H',
            field: 'fb-hour',
            width: 85,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        'mnet-hour': {
            headerName: 'N-H',
            field: 'mnet-hour',
            minWidth: 95,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        spend: {
            headerName: 'Spend',
            field: 'spend',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agTextColumnFilter", // Keep filter active
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Total amount spent",
        },       
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            sortable: true,
            aggFunc: liveSpender,
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Profit = Revenue - Spend",
            
        },
        margin: {
            headerName: 'Margin',
            field: 'margin',
            minWidth: 100,
            valueGetter: getMargin,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Margin = (Profit / Revenue) * 100",
            
        },
        fbleads: {
            headerName: 'FBLeads',
            field: 'fbleads',
            minWidth: 105,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        conversions: {
            headerName: 'Conv',
            field: 'conversions',
            minWidth: 85,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            
            headerTooltip: "Conversions",
            
        },
        cpc: {
            headerName: 'CPC',
            field: 'cpc',
            // valueGetter: (params) => {
            //     if (params.node.group && params.node.aggData) {
            //         return sanitizeNumericValue(params.node.aggData["cpc"]) || 0;
            //     }
            //     return sanitizeNumericValue(params.data?.cpc);
            // },
            aggFunc: cpcSpender,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CPC = Spend / FBClicks",
            
        },
        cpclinkclicks: {
            headerName: 'CPC_LC',
            field: 'cpclinkclicks',
            // aggFunc: cpcSpender,
            valueGetter:getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
            
        },
        fbclicks: {
            headerName: 'FBClicks',
            field: 'fbclicks',
            minWidth: 110,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        fblinkclicks: {
            headerName: 'FB_LC',
            field: 'fblinkclicks', 
            headerTooltip:'fblinkclicks',
            minWidth: 110,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        impressions: {
            headerName: 'IMP',
            field: 'impressions',
            minWidth: 100,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Impressions",
        },
        ctr: {
            headerName: 'CTR',
            field: 'ctr',
            valueGetter: getCtr,
            minWidth: 100,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
            
        },
        rpc: {
            headerName: 'RPC',
            field: 'rpc',
            minWidth: 80,
            valueGetter: getRpc,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "RPC = Revenue / Conversions",
            cellStyle: { fontWeight: 'bold' } // Make text bold
        },
        cpl: {
            headerName: 'CPL',
            field: 'cpl',
            minWidth: 80,
            valueGetter: getCpl,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CPL = Spend / FBLeads",
            
        },
        ncpl: {
            headerName: 'NCPL',
            field: 'ncpl',
            minWidth: 90,
            valueGetter: getNcpl,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "NCPL = Spend / Conversions",
            
        },
        fmargin: {
            headerName: 'FMargin',
            field: 'fmargin',
            minWidth: 120,
            valueGetter: getFmargin,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "FMargin = (Profit / Spend) * 100",
            
        },
        roi: {
            headerName: 'ROI',
            field: 'roi',
            minWidth: 100,
            valueGetter: getROI,
            filter: "agNumberColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "ROI = ((Revenue - Spend) / Spend) * 100",
            
        },
        adsetid: {
            headerName: 'AdsetId',
            field: 'adsetid',
            sortable: true,
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' 
        },
        campaignid: {
            headerName: 'CampaignId',
            field: 'campaignid',
            sortable: true,
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' 
        },
        timezone: {
            headerName: 'TimeZone',
            field: 'timezone',
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' 
        },
    };

    const columnDefsObjectAdsetLevelDaily = {
        M_tq: {
            headerName: 'M_TQ',
            field: 'M_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },             
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        },
          D_tq: {
            headerName: 'D_TQ',
            field: 'D_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        }, 
        campaignname: {
            headerName: 'CampaignName',
            field: 'campaignname',
            resizable: true,
            sortable: true,
            hide: true,
            
            // onClick: (event) => {
            //     const url = `/history/${event}-${account}-${time}`;
            //     window.open(url, '_blank', 'noopener,noreferrer');
            // },
            // cellRenderer: campaignNameRenderer,
        },
        actions: {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 90,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            hide: false,
            suppressMenu: true,
            hide: !isYesterday(),
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [newgroupedData, setNewGroupedData] = useState([]);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignStatus, setCampaignStatus] = useState(true);
                const [campaignActualSpend, setCampaignActualSpend] = useState({});

                const onChangeSpendAndStatus = async () => {
                    // Check if it's a group footer row (for groupIncludeFooter)
                    if (params?.node?.footer) {
                        // console.log("This is a groupIncludeFooter row. Modal will not open.");
                        return; // Prevent modal from opening for group footer rows
                    }

                    // Ensure allLeafChildren exists and is an array before proceeding
                    const allLeafChildren = params.node?.allLeafChildren || [];
                    setNewGroupedData(groupedData);

                    // Fetch all the rows under the current group
                    const groupedData = allLeafChildren.map(node => node.data) || [];
                    const campaignId = groupedData[0]?.campaignid;

                    // Only show the modal if there is data (groupedData length is greater than 0)
                    if (groupedData.length > 0) {
                        const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
                        const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
                        if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
                            setGroupedData(getCampaignResponse.data);
                            setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
                            onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
                        }
                        if(getCampaignActualSpend.status === 200){
                            // console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
                            setCampaignActualSpend(getCampaignActualSpend.data);
                        }

                        else {
                            setGroupedData(groupedData);
                            // console.log("dailyadd");
                        }
                        // Set the grouped data for the modal
                        setIsModalVisible(true); // Show the modal for non-footer rows
                    }
                };

                const handleOk = async () => {
                    setIsModalVisible(false); // Close the modal
                    const object = {
                        campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
                        adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
                        campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
                        usercommit: userdetails?.email,
                        accountNumber: newaccount,
                        budget: changeBudget * 100,
                        status: campaignStatus
                    };
                    // console.log(object);
                    const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
                    const responseData = requestResponse.data;
                    // console.log(responseData, "response");
                    message.success("Budget and Status Updated");
                    changeRRefrst();
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                    // console.log(changeBudget); // Close the modal
                };

                const getTotalSpend = (data) => {
                    if (!data || data.length === 0) return 0;
                    const total = data.reduce((total, item) => {
                        return total + (parseFloat(item?.spend) || 0);
                    }, 0);
                    return Math.round(total * 100) / 100; // Round to 2 decimal places
                };

                const onChangeBudgetValue = event => {
                    onChangeBudget(event.target.value)
                }
                const onChangeCampaignStatus = async () => {
                    const apiEndpoint = campaignStatus
                        ? 'https://prodapis.adsgoat.in/campaignStatusPause/' // Pause campaign
                        : 'https://prodapis.adsgoat.in/campaignStatusActive/'; // Activate campaign
                
                    try {
                        const response = await axios.post(apiEndpoint, 
                            { campaignId: groupedData[0]?.campaignid }, 
                            { headers: { Authorization: token } }
                        );
                        if (response.status === 200) {
                            message.success(`Campaign ${groupedData[0]?.campaignid} status updated to ${campaignStatus ? 'Paused' : 'Active'}`);
                            setCampaignStatus((prev) => !prev); // Toggle the status
                        } else {
                            message.error('Failed to update campaign status.');
                        }
                    } catch (error) {
                        console.error('Error updating campaign status:', error);
                        message.error('Error updating campaign status.');
                    }
                };

                return (
                    <div>
                        <div onClick={onChangeSpendAndStatus}>
                            <span>{params.value || "..."}</span> {/* Fallback to '...' if status is not available */}
                        </div>
                        {/* Modal should only be shown for non-footer rows and when groupedData length is greater than 0 */}
                        {isModalVisible && (
                            <Modal
                                title={groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignname : groupedData?.campaignname}
                                visible={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                width={600}  // Set a custom width for the modal
                                style={{ padding: '20px' }}  // Adjust body padding
                                okButtonProps={{ style: { backgroundColor: '#C7F39A', borderColor: '#C7F39A' } }} 
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#C7F39A"}} onChange={onChangeCampaignStatus} />
                                    </div>

                                    {/* Input Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>

                                    {/* Campaign ID */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong>Campaign ID:</Typography.Text>
                                        <p>{campaignActualSpend?.id}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
            filterParams: { filterEnabled: false },

        },

        adsetname: {
            headerName: 'AdsetName', field: 'adsetname',
            // resizeble: true,
            sortable: true,
            minWidth: 450,
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            }, 
            width: 500,
            hide: true,
            rowGroup: true,
            pinned: 'left',
            enableRowGroup: true,
        },
        adname: {
            headerName: 'AdName', field: 'adname',
            // resizeble: true,
            // sortable: true,
            // width: 300,
            // rowGroup: true, 
            // rowGroupIndex: 1, // Level 2
            // hide: true,
            // filter: 'agSetColumnFilter',
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // }, 
            // showRowGroup: 'adname',
            hide: true,
        },
        adid: {
            headerName: 'AdID',
            field: 'adid',
            // sortable: true,
            // minWidth: 200,
            // filter: 'agSetColumnFilter',
            hide: true,
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // },
            // suppressMenu: true,    // Suppress the column menu
            
        },
        from:{
            headerName: 'From',
            field: 'from',
            minWidth: 110,
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                // const {  start } = campaignStatus;
                // console.log(params.node.groupData?.campaignname, "groupData");
                // console.log(params.node.key, "start");
                return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profitloss:{
            headerName: 'P/L',
            field: 'profitloss',
            minWidth: 110,
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                const campaignData = allProfitLossArray?.items?.filter(obj => obj.campaign_name === campaignName);
                const revenue = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.estimated_revenue) || 0), 0);
                const spend = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.spend) || 0), 0);
                // const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                // const {  start } = campaignStatus;
                // console.log(params.node.groupData?.campaignname, "groupData");
                // console.log(params.node.key, "start");
                // return campaignStatus?.start || 'Unknown';
                return (revenue - spend) ? (revenue - spend).toFixed(2) : "" || "";
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            cellStyle: { fontWeight: 'bold' },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        date: {
            headerName: 'Date', field: 'date', minWidth: 110, sortable: true,
            filter: "agDateColumnFilter",
            sort: "asc",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    const dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    const dateParts = dateAsString.split("/");
                    const cellDate = new Date(
                        Number(dateParts[2]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[0])
                    );

                    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                        return 0;
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                    return 0;
                }
            },
        },
        'fb-hour': { headerName: 'F-H', field: 'fb-hour', minWidth: 85, sortable: true, hide: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        'mnet-hour': { headerName: 'M-H', field: 'mnet-hour', minWidth: 95, sortable: true, hide: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        spend: {
            headerName: 'Spend',
            field: 'spend',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter, // Format display as currency
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            cellClassRules: {
                'font-red': p => p.value < 0 // Conditional formatting for negative profit
            },
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: 'Profit = Revenue - Spend',
        },
        margin: {
            headerName: 'Margin', field: 'margin', valueGetter: getMargin, sortable: true, headerTooltip: '(Profit/Revenue)*100', filter: 'agNumberColumnFilter',
            minWidth: 100,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class

        },
        fbleads: { headerName: 'FBLeads', field: 'fbleads', minWidth: 105, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        conversions: { headerName: 'Conv', field: 'conversions', headerTooltip: "Conversions", minWidth: 85, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        cpc: {
            headerName: 'CPC', field: 'cpc',
            minWidth: 80,
            aggFunc: (params) => {
                const sum = params.values.reduce((sum, value) => sum + parseFloat(value), 0);
                return sum / params.values.length;
            },
            valueFormatter: params => params.value !== undefined ? Math.round(params.value * 100) / 100 : '',
            sortable: true, filter: 'agNumberColumnFilter',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CPC = Spend / FBClicks",

        },
        cpclinkclicks: {
            headerName: 'CPC_LC',
            field: 'cpclinkclicks',
            // aggFunc: cpcSpender,
            valueGetter:getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
            
        },
        fblinkclicks: { headerName: 'FB_LC', field: 'fblinkclicks', headerTooltip:'fblinkclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        fbclicks: { headerName: 'FBClicks', field: 'fbclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        impressions: { headerName: 'IMP', field: 'impressions', headerTooltip:"Impressions", minWidth: 100, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        ctr: {
            headerName: 'CTR', field: 'ctr', valueGetter: getCtr, sortable: true,
            minWidth: 100,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CTR = (FBClicks / Impressions) * 100",
        },
        rpc: {
            headerName: 'RPC', field: 'rpc', valueGetter: getRpc, sortable: true, filter: 'agNumberColumnFilter',
            minWidth: 80,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "RPC = Revenue / Conversions",
            cellStyle: { fontWeight: 'bold' } // Make text bold
        },
        cpl: { headerName: 'CPL', field: 'cpl', minWidth:80, valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "CPL = Spend / FBLeads" },
        ncpl: { headerName: 'NCPL', field: 'ncpl', minWidth:90, valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "NCPL = Spend / Conversions" },
        fmargin: {
            headerName: 'FMargin', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: true,
            minWidth: 120,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "FMargin = (Profit / Spend) * 100",
        },
        roi: {
            headerName: 'ROI', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: '(Profit/Spend)*100', filter: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            minWidth: 100,
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "ROI = (Revenue - Spend) / Spend",
        },
        adsetid: { headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter", hide: false, suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        campaignid: { headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter",  suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', hide: true },
        timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    };

    const columnDefsObjectAdLevelDaily = {
        M_tq: {
            headerName: 'M_TQ',
            field: 'M_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },             
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
        },
          D_tq: {
            headerName: 'D_TQ',
            field: 'D_tq',
            aggFunc: 'sum',
            // valueFormatter: currencyFormatter, 
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
        },          
        campaignname: {
            headerName: 'CampaignName',
            field: 'campaignname',
            resizable: true,
            sortable: true,
            hide: true,
            // onClick: (event) => {
            //     const url = `/history/${event}-${account}-${time}`;
            //     window.open(url, '_blank', 'noopener,noreferrer');
            // },
            // cellRenderer: campaignNameRenderer,
        },
        actions: {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 90,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            hide: false,
            suppressMenu: true,
            hide: !isYesterday(),
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [newgroupedData, setNewGroupedData] = useState([]);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignStatus, setCampaignStatus] = useState(true);
                const [campaignActualSpend, setCampaignActualSpend] = useState({});

                const onChangeSpendAndStatus = async () => {
                    // Check if it's a group footer row (for groupIncludeFooter)
                    if (params?.node?.footer) {
                        // console.log("This is a groupIncludeFooter row. Modal will not open.");
                        return; // Prevent modal from opening for group footer rows
                    }

                    // Ensure allLeafChildren exists and is an array before proceeding
                    const allLeafChildren = params.node?.allLeafChildren || [];
                    setNewGroupedData(groupedData);

                    // Fetch all the rows under the current group
                    const groupedData = allLeafChildren.map(node => node.data) || [];
                    const campaignId = groupedData[0]?.campaignid;

                    // Only show the modal if there is data (groupedData length is greater than 0)
                    if (groupedData.length > 0) {
                        const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
                        const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
                        if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
                            setGroupedData(getCampaignResponse.data);
                            setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
                            onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
                        }
                        if(getCampaignActualSpend.status === 200){
                            // console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
                            setCampaignActualSpend(getCampaignActualSpend.data);
                        }

                        else {
                            setGroupedData(groupedData);
                            // console.log("dailyadd");
                        }
                        // Set the grouped data for the modal
                        setIsModalVisible(true); // Show the modal for non-footer rows
                    }
                };

                const handleOk = async () => {
                    setIsModalVisible(false); // Close the modal
                    const object = {
                        campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
                        adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
                        campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
                        usercommit: userdetails?.email,
                        accountNumber: newaccount,
                        budget: changeBudget * 100,
                        status: campaignStatus
                    };
                    // console.log(object);
                    const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
                    const responseData = requestResponse.data;
                    // console.log(responseData, "response");
                    message.success("Budget and Status Updated");
                    changeRRefrst();
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                    // console.log(changeBudget); // Close the modal
                };

                const getTotalSpend = (data) => {
                    if (!data || data.length === 0) return 0;
                    const total = data.reduce((total, item) => {
                        return total + (parseFloat(item?.spend) || 0);
                    }, 0);
                    return Math.round(total * 100) / 100; // Round to 2 decimal places
                };

                const onChangeBudgetValue = event => {
                    onChangeBudget(event.target.value)
                }
                const onChangeCampaignStatus = async () => {
                    const apiEndpoint = campaignStatus
                        ? 'https://prodapis.adsgoat.in/campaignStatusPause/' // Pause campaign
                        : 'https://prodapis.adsgoat.in/campaignStatusActive/'; // Activate campaign
                
                    try {
                        const response = await axios.post(apiEndpoint, 
                            { campaignId: groupedData[0]?.campaignid }, 
                            { headers: { Authorization: token } }
                        );
                        if (response.status === 200) {
                            message.success(`Campaign ${groupedData[0]?.campaignid} status updated to ${campaignStatus ? 'Paused' : 'Active'}`);
                            setCampaignStatus((prev) => !prev); // Toggle the status
                        } else {
                            message.error('Failed to update campaign status.');
                        }
                    } catch (error) {
                        console.error('Error updating campaign status:', error);
                        message.error('Error updating campaign status.');
                    }
                };

                return (
                    <div>
                        <div onClick={onChangeSpendAndStatus}>
                            <span>{params.value || "..."}</span> {/* Fallback to '...' if status is not available */}
                        </div>
                        {/* Modal should only be shown for non-footer rows and when groupedData length is greater than 0 */}
                        {isModalVisible && (
                            <Modal
                                title={groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignname : groupedData?.campaignname}
                                visible={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                width={600}  // Set a custom width for the modal
                                style={{ padding: '20px' }}  // Adjust body padding
                                okButtonProps={{ style: { backgroundColor: '#C7F39A', borderColor: '#C7F39A' } }} 
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#C7F39A"}} onChange={onChangeCampaignStatus} />
                                    </div>

                                    {/* Input Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>

                                    {/* Campaign ID */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong>Campaign ID:</Typography.Text>
                                        <p>{campaignActualSpend?.id}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
            filterParams: { filterEnabled: false },

        },

        adsetname: {
            headerName: 'AdsetName', field: 'adsetname',
            // resizeble: true,
            sortable: true,
            minWidth: 450,
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            }, 
            hide: true,
        },
        adname: {
            headerName: 'AdName', field: 'adname',
            resizeble: true,
            sortable: true,
            // width: 300,
            // rowGroup: true, 
            // rowGroupIndex: 1, // Level 2
            // hide: true,
            // filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            }, 
            // showRowGroup: 'adname',
            // hide: true,
            width: 500,
            hide: true,
            rowGroup: true,
            pinned: 'left',
            enableRowGroup: true,
        },
        adid: {
            headerName: 'AdID',
            field: 'adid',
            // sortable: true,
            // minWidth: 200,
            // filter: 'agSetColumnFilter',
            hide: true,
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // },
            // suppressMenu: true,    // Suppress the column menu
            
        },
        from:{
            headerName: 'From',
            field: 'from',
            minWidth: 110,
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                // const {  start } = campaignStatus;
                // console.log(params.node.groupData?.campaignname, "groupData");
                // console.log(params.node.key, "start");
                return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profitloss:{
            headerName: 'P/L',
            field: 'profitloss',
            minWidth: 110,
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                const campaignData = allProfitLossArray?.items?.filter(obj => obj.campaign_name === campaignName);
                const revenue = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.estimated_revenue) || 0), 0);
                const spend = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.spend) || 0), 0);
                // const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                // const {  start } = campaignStatus;
                // console.log(params.node.groupData?.campaignname, "groupData");
                // console.log(params.node.key, "start");
                // return campaignStatus?.start || 'Unknown';
                return (revenue - spend) ? (revenue - spend).toFixed(2) : "" || "";
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            cellStyle: { fontWeight: 'bold' },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        date: {
            headerName: 'Date', field: 'date', minWidth: 110, sortable: true,
            filter: "agDateColumnFilter",
            sort: "asc",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    const dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    const dateParts = dateAsString.split("/");
                    const cellDate = new Date(
                        Number(dateParts[2]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[0])
                    );

                    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                        return 0;
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                    return 0;
                }
            },
        },
        'fb-hour': { headerName: 'F-H', field: 'fb-hour', minWidth: 85, sortable: true, hide: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        'mnet-hour': { headerName: 'M-H', field: 'mnet-hour', minWidth: 95, sortable: true, hide: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        spend: {
            headerName: 'Spend',
            field: 'spend',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter, // Format display as currency
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            cellClassRules: {
                'font-red': p => p.value < 0 // Conditional formatting for negative profit
            },
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: 'Profit = Revenue - Spend',
        },
        margin: {
            headerName: 'Margin', field: 'margin', valueGetter: getMargin, sortable: true, headerTooltip: '(Profit/Revenue)*100', filter: 'agNumberColumnFilter',
            minWidth: 100,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class

        },
        fbleads: { headerName: 'FBLeads', field: 'fbleads', minWidth: 105, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        conversions: { headerName: 'Conv', field: 'conversions', headerTooltip: "Conversions", minWidth: 85, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        cpc: {
            headerName: 'CPC', field: 'cpc',
            minWidth: 80,
            aggFunc: (params) => {
                const sum = params.values.reduce((sum, value) => sum + parseFloat(value), 0);
                return sum / params.values.length;
            },
            valueFormatter: params => params.value !== undefined ? Math.round(params.value * 100) / 100 : '',
            sortable: true, filter: 'agNumberColumnFilter',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CPC = Spend / FBClicks",

        },
        cpclinkclicks: {
            headerName: 'CPC_LC',
            field: 'cpclinkclicks',
            // aggFunc: cpcSpender,
            valueGetter:getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
            
        },
        fblinkclicks: { headerName: 'FB_LC', field: 'fblinkclicks', headerTooltip:'fblinkclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        fbclicks: { headerName: 'FBClicks', field: 'fbclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        impressions: { headerName: 'IMP', field: 'impressions', headerTooltip:"Impressions", minWidth: 100, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        ctr: {
            headerName: 'CTR', field: 'ctr', valueGetter: getCtr, sortable: true,
            minWidth: 100,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CTR = (FBClicks / Impressions) * 100",
        },
        rpc: {
            headerName: 'RPC', field: 'rpc', valueGetter: getRpc, sortable: true, filter: 'agNumberColumnFilter',
            minWidth: 80,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "RPC = Revenue / Conversions",
            cellStyle: { fontWeight: 'bold' } // Make text bold
        },
        cpl: { headerName: 'CPL', field: 'cpl', minWidth:80, valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "CPL = Spend / FBLeads" },
        ncpl: { headerName: 'NCPL', field: 'ncpl', minWidth:90, valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "NCPL = Spend / Conversions" },
        fmargin: {
            headerName: 'FMargin', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: true,
            minWidth: 120,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "FMargin = (Profit / Spend) * 100",
        },
        roi: {
            headerName: 'ROI', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: '(Profit/Spend)*100', filter: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            minWidth: 100,
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "ROI = (Revenue - Spend) / Spend",
        },
        adsetid: { headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter", hide: false, suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', hide: true },
        campaignid: { headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter",  suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', hide: true },
        timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    };

    const columnDefsObject1 = {
        M_tq: {
            headerName: 'M_TQ',
            field: 'M_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },             
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        },
          D_tq: {
            headerName: 'D_TQ',
            field: 'D_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        }, 
        campaignname: {
            headerName: 'CampaignName',
            field: 'campaignname',
            resizable: true,
            sortable: true,
            width: 500,
            hide: true,
            rowGroup: true,
            pinned: 'left',
            enableRowGroup: true,
            onClick: (event) => {
                const url = `/history/${event}-${account}-${time}`;
                window.open(url, '_blank', 'noopener,noreferrer');
            },
            cellRenderer: campaignNameRenderer,
        },
        actions: {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 90,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            // hide: false,
            // hide : true,
            suppressMenu: true,
            hide: !isYesterday(),
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [newgroupedData, setNewGroupedData] = useState([]);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignStatus, setCampaignStatus] = useState(true);
                const [campaignActualSpend, setCampaignActualSpend] = useState({});

                const onChangeSpendAndStatus = async () => {
                    // Check if it's a group footer row (for groupIncludeFooter)
                    if (params?.node?.footer) {
                        // console.log("This is a groupIncludeFooter row. Modal will not open.");
                        return; // Prevent modal from opening for group footer rows
                    }

                    // Ensure allLeafChildren exists and is an array before proceeding
                    const allLeafChildren = params.node?.allLeafChildren || [];
                    setNewGroupedData(groupedData);

                    // Fetch all the rows under the current group
                    const groupedData = allLeafChildren.map(node => node.data) || [];
                    const campaignId = groupedData[0]?.campaignid;

                    // Only show the modal if there is data (groupedData length is greater than 0)
                    if (groupedData.length > 0) {
                        const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
                        const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
                        if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
                            setGroupedData(getCampaignResponse.data);
                            setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
                            onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
                        }
                        if(getCampaignActualSpend.status === 200){
                            // console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
                            setCampaignActualSpend(getCampaignActualSpend.data);
                        }

                        else {
                            setGroupedData(groupedData);
                            // console.log("dailyadd");
                        }
                        // Set the grouped data for the modal
                        setIsModalVisible(true); // Show the modal for non-footer rows
                    }
                };

                const handleOk = async () => {
                    setIsModalVisible(false); // Close the modal
                    const object = {
                        campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
                        adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
                        campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
                        usercommit: userdetails?.email,
                        accountNumber: newaccount,
                        budget: changeBudget * 100,
                        status: campaignStatus
                    };
                    // console.log(object);
                    const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
                    const responseData = requestResponse.data;
                    // console.log(responseData, "response");
                    message.success("Budget and Status Updated");
                    changeRRefrst();
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                    // console.log(changeBudget); // Close the modal
                };

                const getTotalSpend = (data) => {
                    if (!data || data.length === 0) return 0;
                    const total = data.reduce((total, item) => {
                        return total + (parseFloat(item?.spend) || 0);
                    }, 0);
                    return Math.round(total * 100) / 100; // Round to 2 decimal places
                };

                const onChangeBudgetValue = event => {
                    onChangeBudget(event.target.value)
                }
                const onChangeCampaignStatus = async () => {
                    const apiEndpoint = campaignStatus
                        ? 'https://prodapis.adsgoat.in/campaignStatusPause/' // Pause campaign
                        : 'https://prodapis.adsgoat.in/campaignStatusActive/'; // Activate campaign
                
                    try {
                        const response = await axios.post(apiEndpoint, 
                            { campaignId: groupedData[0]?.campaignid }, 
                            { headers: { Authorization: token } }
                        );
                        if (response.status === 200) {
                            message.success(`Campaign ${groupedData[0]?.campaignid} status updated to ${campaignStatus ? 'Paused' : 'Active'}`);
                            setCampaignStatus((prev) => !prev); // Toggle the status
                        } else {
                            message.error('Failed to update campaign status.');
                        }
                    } catch (error) {
                        console.error('Error updating campaign status:', error);
                        message.error('Error updating campaign status.');
                    }
                };

                return (
                    <div>
                        <div onClick={onChangeSpendAndStatus}>
                            <span>{params.value || "..."}</span> {/* Fallback to '...' if status is not available */}
                        </div>
                        {/* Modal should only be shown for non-footer rows and when groupedData length is greater than 0 */}
                        {isModalVisible && (
                            <Modal
                                title={groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignname : groupedData?.campaignname}
                                visible={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                width={600}  // Set a custom width for the modal
                                style={{ padding: '20px' }}  // Adjust body padding
                                okButtonProps={{ style: { backgroundColor: '#C7F39A', borderColor: '#C7F39A' } }} 
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#C7F39A"}} onChange={onChangeCampaignStatus} />
                                    </div>

                                    {/* Input Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>

                                    {/* Campaign ID */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong>Campaign ID:</Typography.Text>
                                        <p>{campaignActualSpend?.id}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
            filterParams: { filterEnabled: false },

        },

        adsetname: {
            headerName: 'AdsetName', field: 'adsetname',
            // resizeble: true,
            // hide: true,
            sortable: true,
            minWidth: 450,
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            }, 
        },
        adname: {
            headerName: 'AdName', field: 'adname',
            // resizeble: true,
            // sortable: true,
            // width: 300,
            // rowGroup: true, 
            // rowGroupIndex: 1, // Level 2
            // hide: true,
            // filter: 'agSetColumnFilter',
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // }, 
            // showRowGroup: 'adname',
            hide: true,
        },
        adid: {
            headerName: 'AdID',
            field: 'adid',
            // sortable: true,
            // minWidth: 200,
            // filter: 'agSetColumnFilter',
            hide: true,
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // },
            // suppressMenu: true,    // Suppress the column menu
            
        },
        from:{
            headerName: 'From',
            field: 'from',
            minWidth: 110,
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                // const {  start } = campaignStatus;
                // console.log(params.node.groupData?.campaignname, "groupData");
                // console.log(params.node.key, "start");
                return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profitloss:{
            headerName: 'P/L',
            field: 'profitloss',
            minWidth: 110,
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                const campaignData = allProfitLossArray?.items?.filter(obj => obj.campaign_name === campaignName);
                const revenue = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.estimated_revenue) || 0), 0);
                const spend = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.spend) || 0), 0);
                // const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                // const {  start } = campaignStatus;
                // console.log(params.node.groupData?.campaignname, "groupData");
                // console.log(params.node.key, "start");
                // return campaignStatus?.start || 'Unknown';
                return (revenue - spend) ? (revenue - spend).toFixed(2) : "" || "";
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            cellStyle: { fontWeight: 'bold' },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        date: {
            headerName: 'Date', field: 'date', minWidth: 110, sortable: true,
            filter: "agDateColumnFilter",
            sort: "asc",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    const dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    const dateParts = dateAsString.split("/");
                    const cellDate = new Date(
                        Number(dateParts[2]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[0])
                    );

                    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                        return 0;
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                    return 0;
                }
            },
        },
        'fb-hour': { headerName: 'F-H', field: 'fb-hour', minWidth: 85, sortable: true, hide: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        'mnet-hour': { headerName: 'M-H', field: 'mnet-hour', minWidth: 95, sortable: true, hide: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        spend: {
            headerName: 'Spend',
            field: 'spend',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter, // Format display as currency
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            cellClassRules: {
                'font-red': p => p.value < 0 // Conditional formatting for negative profit
            },
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: 'Profit = Revenue - Spend',
        },
        margin: {
            headerName: 'Margin', field: 'margin', valueGetter: getMargin, sortable: true, headerTooltip: '(Profit/Revenue)*100', filter: 'agNumberColumnFilter',
            minWidth: 100,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class

        },
        fbleads: { headerName: 'FBLeads', field: 'fbleads', minWidth: 105, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        conversions: { headerName: 'Conv', field: 'conversions', headerTooltip: "Conversions", minWidth: 85, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        cpc: {
            headerName: 'CPC', field: 'cpc',
            minWidth: 80,
            aggFunc: (params) => {
                const sum = params.values.reduce((sum, value) => sum + parseFloat(value), 0);
                return sum / params.values.length;
            },
            valueFormatter: params => params.value !== undefined ? Math.round(params.value * 100) / 100 : '',
            sortable: true, filter: 'agNumberColumnFilter',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CPC = Spend / FBClicks",

        },
        cpclinkclicks: {
            headerName: 'CPC_LC',
            field: 'cpclinkclicks',
            // aggFunc: cpcSpender,
            valueGetter:getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
            
        },
        fblinkclicks: { headerName: 'FB_LC', field: 'fblinkclicks', headerTooltip:'fblinkclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        fbclicks: { headerName: 'FBClicks', field: 'fbclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        impressions: { headerName: 'IMP', field: 'impressions', headerTooltip:"Impressions", minWidth: 100, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        ctr: {
            headerName: 'CTR', field: 'ctr', valueGetter: getCtr, sortable: true,
            minWidth: 100,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CTR = (FBClicks / Impressions) * 100",
        },
        rpc: {
            headerName: 'RPC', field: 'rpc', valueGetter: getRpc, sortable: true, filter: 'agNumberColumnFilter',
            minWidth: 80,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "RPC = Revenue / Conversions",
            cellStyle: { fontWeight: 'bold' } // Make text bold
        },
        cpl: { headerName: 'CPL', field: 'cpl', minWidth:80, valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "CPL = Spend / FBLeads" },
        ncpl: { headerName: 'NCPL', field: 'ncpl', minWidth:90, valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "NCPL = Spend / Conversions" },
        fmargin: {
            headerName: 'FMargin', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: true,
            minWidth: 120,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "FMargin = (Profit / Spend) * 100",
        },
        roi: {
            headerName: 'ROI', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: '(Profit/Spend)*100', filter: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            minWidth: 100,
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "ROI = (Revenue - Spend) / Spend",
        },
        adsetid: { headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter", hide: false, suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        campaignid: { headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter",  suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    };

    //campaignLevelDaily
    const columnDefsObject2 = {
        M_tq: {
            headerName: 'M_TQ',
            field: 'M_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },             
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        },
          D_tq: {
            headerName: 'D_TQ',
            field: 'D_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        }, 
        campaignname: {
            headerName: 'CampaignName', field: 'campaignname', resizeble: true,
            // sortable: true,
            resizeble: true,
            sortable: true,
            width: 500,
            hide: true,
            rowGroup: true,
            pinned: 'left',
            enableRowGroup: true,
            width: 450,
            pinned: 'left',// Using the group cell renderer
        },
        actions: {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 90,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            hide: false,
            suppressMenu: true,
            hide: !isYesterday(),
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [newgroupedData, setNewGroupedData] = useState([]);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignStatus, setCampaignStatus] = useState(true);
                
                const [campaignActualSpend, setCampaignActualSpend] = useState({});

                const onChangeSpendAndStatus = async () => {
                    // Check if it's a group footer row (for groupIncludeFooter)
                    if (params?.node?.footer) {
                        // console.log("This is a groupIncludeFooter row. Modal will not open.");
                        return; // Prevent modal from opening for group footer rows
                    }

                    // Ensure allLeafChildren exists and is an array before proceeding
                    const allLeafChildren = params.node?.allLeafChildren || [];

                    // Fetch all the rows under the current group
                    const groupedData = allLeafChildren.map(node => node.data) || [];
                    setNewGroupedData(groupedData);
                    const campaignId = groupedData[0]?.campaignid;

                    // Only show the modal if there is data (groupedData length is greater than 0)
                    if (groupedData.length > 0) {
                        const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
                        const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
                        if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
                            setGroupedData(getCampaignResponse.data);
                            setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
                            onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
                        }
                        if(getCampaignActualSpend.status === 200){
                            // console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
                            setCampaignActualSpend(getCampaignActualSpend.data);
                        }
                        else {
                            setGroupedData(groupedData);
                        }
                        // Set the grouped data for the modal
                        setIsModalVisible(true); // Show the modal for non-footer rows
                    }
                };

                const handleOk = async () => {
                    setIsModalVisible(false); // Close the modal
                    const object = {
                        campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
                        adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
                        campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
                        usercommit: userdetails?.email,
                        accountNumber: newaccount,
                        budget: changeBudget * 100,
                        status: campaignStatus
                    };
                    // console.log(object);
                    const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
                    const responseData = requestResponse.data;
                    // console.log(responseData, "response");
                    message.success("Budget and Status Updated");
                    changeRRefrst();
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                    // console.log(changeBudget); // Close the modal
                };

                const getTotalSpend = (data) => {
                    if (!data || data.length === 0) return 0;
                    const total = data.reduce((total, item) => {
                        return total + (parseFloat(item?.spend) || 0);
                    }, 0);
                    return Math.round(total * 100) / 100; // Round to 2 decimal places
                };

                const onChangeBudgetValue = event => {
                    onChangeBudget(event.target.value)
                }

                const onChangeCampaignStatus = async () => {
                    const apiEndpoint = campaignStatus
                        ? 'https://prodapis.adsgoat.in/campaignStatusPause/' // Pause campaign
                        : 'https://prodapis.adsgoat.in/campaignStatusActive/'; // Activate campaign
                
                    try {
                        const response = await axios.post(apiEndpoint, 
                            { campaignId: groupedData[0]?.campaignid }, 
                            { headers: { Authorization: token } }
                        );
                        if (response.status === 200) {
                            message.success(`Campaign ${groupedData[0]?.campaignid} status updated to ${campaignStatus ? 'Paused' : 'Active'}`);
                            setCampaignStatus((prev) => !prev); // Toggle the status
                        } else {
                            message.error('Failed to update campaign status.');
                        }
                    } catch (error) {
                        console.error('Error updating campaign status:', error);
                        message.error('Error updating campaign status.');
                    }
                };

                // console.log(groupedData);

                return (
                    <div>
                        {/* Click action for status cell */}
                        <div onClick={onChangeSpendAndStatus}>
                            <span>{params.value || "..."}</span> {/* Fallback to '...' if status is not available */}
                        </div>
                        {/* Modal should only be shown for non-footer rows and when groupedData length is greater than 0 */}
                        {isModalVisible && (
                            <Modal
                                title={groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignname : groupedData?.campaignname}
                                visible={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                width={600}  // Set a custom width for the modal
                                style={{ padding: '20px' }}  // Adjust body padding
                                okButtonProps={{ style: { backgroundColor: '#C7F39A', borderColor: '#C7F39A' } }} 
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#C7F39A"}} onChange={onChangeCampaignStatus} />
                                    </div>

                                    {/* Input Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>

                                    {/* Campaign ID */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong>Campaign ID:</Typography.Text>
                                        <p>{campaignActualSpend?.id}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
            filterParams: { filterEnabled: false },

        },
        adsetname: {
            headerName: 'AdsetName', field: 'adsetname',
            sortable: true,
            minWidth: 450,
            filter: true,
        },
        adname: {
            headerName: 'AdName', field: 'adname',
            // resizeble: true,
            // sortable: true,
            // width: 300,
            // rowGroup: true, 
            // rowGroupIndex: 1, // Level 2
            // hide: true,
            // filter: 'agSetColumnFilter',
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // }, 
            // // showRowGroup: 'adname',
            hide: true,
        },
        adid: {
            headerName: 'AdID',
            field: 'adid',
            // sortable: true,
            // minWidth: 200,
            // filter: 'agSetColumnFilter',
            hide: true,
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // },
            // suppressMenu: true,    // Suppress the column menu
            
        },
        from:{
            headerName: 'From',
            field: 'from',
            minWidth: 110,
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName =  params.node.key;
                const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                // const {  start } = campaignStatus;
                // console.log(params.node.groupData?.campaignname, "groupData");
                // console.log(params.node.key, "start");
                // console.log(campaignStatus?.start);
                // console.log(campaignStatus, "campaignStatus");
                return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profitloss:{
            headerName: 'P/L',
            field: 'profitloss',
            minWidth: 110,
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                const campaignData = allProfitLossArray?.items?.filter(obj => obj.campaign_name === campaignName);
                const revenue = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.estimated_revenue) || 0), 0);
                const spend = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.spend) || 0), 0);
                // const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                // const {  start } = campaignStatus;
                // console.log(params.node.groupData?.campaignname, "groupData");
                // console.log(params.node.key, "start");
                // return campaignStatus?.start || 'Unknown';
                return (revenue - spend) ? (revenue - spend).toFixed(2) : "" || "";
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            cellStyle: { fontWeight: 'bold' },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        date: {
            headerName: 'Date', field: 'date', 
            // sort: 'asc', 
            sortable: true,
            filter: "agDateColumnFilter",
            // sort: "asc",
            minWidth: 110,
            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    const dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    const dateParts = dateAsString.split("/");
                    const cellDate = new Date(
                        Number(dateParts[2]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[0])
                    );

                    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                        return 0;
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                    return 0;
                },
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        spend: {
            headerName: 'Spend', field: 'spend', minWidth: 110, aggFunc: spender, sortable: true, filter: 'agNumberColumnFilter',
            valueFormatter: currencyFormatter, comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        revenue: {
            headerName: 'Revenue', field: 'revenue', minWidth: 105, aggFunc: spender, sortable: true, filter: 'agNumberColumnFilter',
            valueFormatter: currencyFormatter, comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profit: {
            headerName: 'Profit', field: 'profit', minWidth: 105, aggFunc: spender, cellClassRules: {
                'font-red': p => p.value < 0
            }, sortable: true, headerTooltip: 'Profit = Revenue - Spend', filter: 'agNumberColumnFilter',
            valueFormatter: currencyFormatter, comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        margin: {
            headerName: 'Margin', field: 'margin', valueGetter: getMargin, sortable: true, headerTooltip: '(Profit/Revenue)*100', filter: true,
            minWidth: 100,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        fbleads: { headerName: 'FBLeads', field: 'fbleads', minWidth: 105, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        conversions: { headerName: 'Conv', headerTooltip:'Conversions', field: 'conversions', minWidth: 85, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        cpc: {
            headerName: 'CPC', field: 'cpc', aggFunc: cpcSpender, sortable: true, filter: 'agNumberColumnFilter',
            minWidth: 80,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: 'CPC = Spend / FBClicks',
        },
        cpclinkclicks: {
            headerName: 'CPC_LC',
            field: 'cpclinkclicks',
            // aggFunc: cpcSpender,
            valueGetter:getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
            
        },
        fbclicks: { headerName: 'FBClicks', field: 'fbclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        fblinkclicks: { headerName: 'FB_LC', headerTooltip:'fblinkclicks', field: 'fblinkclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        impressions: { headerName: 'IMP', headerTooltip:'Impressions', field: 'impressions', minWidth: 100, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        ctr: {
            headerName: 'CTR', field: 'ctr', valueGetter: getCtr, sortable: true, filter: 'agNumberColumnFilter',
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            minWidth: 100,
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: 'CTR = (FBClicks / Impressions) * 100',
        },
        rpc: {
            headerName: 'RPC', field: 'rpc', valueGetter: getRpc, sortable: true, filter: 'agNumberColumnFilter',
            minWidth: 80,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: 'RPC = Revenue / Conversions',
            cellStyle: { fontWeight: 'bold' } // Make text bold
        },
        cpl: { headerName: 'CPL', minWidth:80, field: 'cpl', valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: 'CPL = Spend / FBLeads' },
        ncpl: { headerName: 'NCPL',minWidth:90, field: 'ncpl', valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: 'NCPL = Spend / Conversions' },
        fmargin: {
            headerName: 'FMargin', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: true,
            minWidth: 120,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: 'FMargin = (Profit / Spend) * 100',
        },
        roi: {
            headerName: 'ROI', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: 'Profit/Spend', filter: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            minWidth: 100,
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: 'ROI = ((Revenue - Spend) / Spend) * 100',
        },
        campaignid: { headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        adsetid: { headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        'fb-hour': { headerName: 'F-H', field: 'fb-hour', width: 85, sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        'mnet-hour': { headerName: 'M-H', field: 'mnet-hour', width: 85, sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    };

    const KeywordCellRenderer = ({ params }) => {
        const [tooltipText, setTooltipText] = useState("Copy to clipboard");

        const keyword = params.value;
        const adId = params.data?.adId;

        const handleCopy = () => {
            navigator.clipboard.writeText(adId).then(() => {
                setTooltipText("Copied!");
                setTimeout(() => setTooltipText("Copy to clipboard"), 2000);
            }).catch(() => {
                alert('Failed to copy!');
            });
        };

        const popoverContent = (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{adId}</span>
                <Tooltip title={tooltipText}>
                    <CopyOutlined
                        onClick={handleCopy}
                        style={{
                            cursor: 'pointer',
                            fontSize: '16px',
                            // color: '#007BFF'
                        }}
                    />
                </Tooltip>
            </div>
        );

        
        return (
            <Popover
                content={popoverContent}
                trigger="hover"
                placement="topLeft"
            // title="Ad ID"
            >
                <span style={{ cursor: 'pointer' }}>
                    {keyword}
                </span>
            </Popover>
        );
    };

    const columnDefsObject3 = {
        M_tq: {
            headerName: 'M_TQ',
            field: 'M_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },             
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        },
          D_tq: {
            headerName: 'D_TQ',
            field: 'D_tq',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            aggFunc: liveSpender,
            hide: true
        }, 
        campaignname: {
            headerName: 'CampaignName',
            field: 'campaignname',
            resizable: true,
            sortable: true,
            width: 500,
            hide: true,
            rowGroup: true,
            pinned: 'left',
            enableRowGroup: true,
            cellRenderer: campaignNameRenderer,
        },
        keyword: {
            headerName: 'Keywords',
            field: 'keyword',
            sortable: true,
            filter: 'agTextColumnFilter',
            resizable: true,
            minWidth: 350,
            cellStyle: { textAlign: 'left' },
            cellRenderer: (params) =>
                <KeywordCellRenderer params={params} /> , 
        },
        searchKeyword: {
            headerName: 'S_Keywords',
            field: 'searchKeyword',
            sortable: true,
            filter: 'agTextColumnFilter',
            minWidth: 350,
            resizable: true,
            cellStyle: { textAlign: 'left' },
            cellRenderer: (params) => {
                return params.value;
            },
            // Include this column only in expanded rows
        },
        adId: {
            headerName: 'adId',
            field: 'adId',
            sortable: true,
            filter: "agTextColumnFilter",
            hide: false
        },
        actions: {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 90,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            hide: false,
            suppressMenu: true,
            hide: !isYesterday(),
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [newgroupedData, setNewGroupedData] = useState([]);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignStatus, setCampaignStatus] = useState(true);
                
                const [campaignActualSpend, setCampaignActualSpend] = useState({});

                const onChangeSpendAndStatus = async () => {
                    // Check if it's a group footer row (for groupIncludeFooter)
                    if (params?.node?.footer) {
                        console.log("This is a groupIncludeFooter row. Modal will not open.");
                        return; // Prevent modal from opening for group footer rows
                    }

                    // Ensure allLeafChildren exists and is an array before proceeding
                    const allLeafChildren = params.node?.allLeafChildren || [];

                    // Fetch all the rows under the current group
                    const groupedData = allLeafChildren.map(node => node.data) || [];
                    setNewGroupedData(groupedData);
                    const campaignId = groupedData[0]?.campaignid;

                    // Only show the modal if there is data (groupedData length is greater than 0)
                    if (groupedData.length > 0) {
                        const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
                        const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
                        if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
                            setGroupedData(getCampaignResponse.data);
                            setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
                            onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
                        }
                        if(getCampaignActualSpend.status === 200){
                            // console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
                            setCampaignActualSpend(getCampaignActualSpend.data);
                        }
                        else {
                            setGroupedData(groupedData);
                            // console.log("dailyadd");
                        }
                        // Set the grouped data for the modal
                        setIsModalVisible(true); // Show the modal for non-footer rows
                    }
                };

                const handleOk = async () => {
                    setIsModalVisible(false); // Close the modal
                    const object = {
                        campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
                        adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
                        campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
                        usercommit: userdetails?.email,
                        accountNumber: newaccount,
                        budget: changeBudget * 100,
                        status: campaignStatus
                    };
                    // console.log(object);
                    const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
                    const responseData = requestResponse.data;
                    // console.log(responseData, "response");
                    message.success("Budget and Status Updated");
                    changeRRefrst();
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                    // console.log(changeBudget); // Close the modal
                };

                const getTotalSpend = (data) => {
                    if (!data || data.length === 0) return 0;
                    const total = data.reduce((total, item) => {
                        return total + (parseFloat(item?.spend) || 0);
                    }, 0);
                    return Math.round(total * 100) / 100; // Round to 2 decimal places
                };

                const onChangeBudgetValue = event => {
                    onChangeBudget(event.target.value);
                }

                const onChangeCampaignStatus = () => {
                    setCampaignStatus((prev) => !prev);
                }


                // console.log(groupedData);

                return (
                    <div>
                        {/* Click action for status cell */}
                        <div onClick={onChangeSpendAndStatus}>
                            <span>{params.value || "..."}</span> {/* Fallback to '...' if status is not available */}
                        </div>
                        {/* Modal should only be shown for non-footer rows and when groupedData length is greater than 0 */}
                        {isModalVisible && (
                            <Modal
                                title={groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignname : groupedData?.campaignname}
                                visible={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                width={600}  // Set a custom width for the modal
                                style={{ padding: '20px' }}  // Adjust body padding
                                okButtonProps={{ style: { backgroundColor: '#C7F39A', borderColor: '#C7F39A' } }} 
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#C7F39A"}} onChange={onChangeCampaignStatus} />
                                    </div>

                                    {/* Input Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>

                                    {/* Campaign ID */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong>Campaign ID:</Typography.Text>
                                        <p>{campaignActualSpend?.id}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
            filterParams: { filterEnabled: false },

        },

        adsetname: {
            headerName: 'AdsetName', field: 'adsetname',
            // resizeble: true,
            sortable: true,
            minWidth: 450,
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        adname: {
            headerName: 'AdName', field: 'adname',
            // resizeble: true,
            // sortable: true,
            // width: 300,
            // rowGroup: true, 
            // rowGroupIndex: 1, // Level 2
            // hide: true,
            // filter: 'agSetColumnFilter',
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // }, 
            // showRowGroup: 'adname',
            hide: true,
        },
        adid: {
            headerName: 'AdID',
            field: 'adid',
            // sortable: true,
            // minWidth: 200,
            // filter: 'agSetColumnFilter',
            hide: true,
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // },
            // suppressMenu: true,    // Suppress the column menu
            
        },
        from:{
            headerName: 'From',
            field: 'from',
            minWidth: 110,
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                // const {  start } = campaignStatus;
                // console.log(params.node.groupData?.campaignname, "groupData");
                // console.log(params.node.key, "start");
                return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        profitloss:{
            headerName: 'P/L',
            field: 'profitloss',
            minWidth: 110,
            valueGetter: (params) => {
              if (params.node.group) {
                const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                const campaignData = allProfitLossArray?.items?.filter(obj => obj.campaign_name === campaignName);
                const revenue = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.estimated_revenue) || 0), 0);
                const spend = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.spend) || 0), 0);
                // const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
                // const {  start } = campaignStatus;
                // console.log(params.node.groupData?.campaignname, "groupData");
                // console.log(params.node.key, "start");
                // return campaignStatus?.start || 'Unknown';
                return (revenue - spend) ? (revenue - spend).toFixed(2) : "" || "";
              }
              return '';
            },
            cellClassRules: {
              'hide-leaf-cell': (params) => !params.node.group,
            },
            cellStyle: { fontWeight: 'bold' },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        date: {
            headerName: 'Date', field: 'date', minWidth: 120, sortable: true,
            sort: "asc",
            filter: "agDateColumnFilter",
            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    const dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    const dateParts = dateAsString.split("/");
                    const cellDate = new Date(
                        Number(dateParts[2]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[0])
                    );

                    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                        return 0;
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                    return 0;
                }
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        'fb-hour': { headerName: 'F-H', field: 'fb-hour', minWidth: 85, sortable: true, hide: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        'mnet-hour': { headerName: 'M-H', field: 'mnet-hour', minWidth: 95, sortable: true, hide: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        spend: {
            headerName: 'Spend',
            field: 'spend',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter, // Format display as currency
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            cellClassRules: {
                'font-red': p => p.value < 0 // Conditional formatting for negative profit
            },
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            headerTooltip: 'Profit = Revenue - Spend',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        margin: {
            headerName: 'Margin', field: 'margin', valueGetter: getMargin, sortable: true, headerTooltip: 'Profit/Revenue', filter: 'agNumberColumnFilter',
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            minWidth: 100,
            valueFormatter: (params) => `${params.value}%`,
            headerTooltip: 'Margin = (Profit / Revenue) * 100',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',

        },
        fbleads: { headerName: 'FBLeads', field: 'fbleads', minWidth: 105, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        conversions: { headerName: 'Conv', headerTooltip:'Conversions', field: 'conversions', minWidth: 85, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        cpc: {
            headerName: 'CPC', field: 'cpc',
            minWidth:80,
            aggFunc: (params) => {
                const sum = params.values.reduce((sum, value) => sum + parseFloat(value), 0);
                return sum / params.values.length;
            },
            valueFormatter: params => params.value !== undefined ? Math.round(params.value * 100) / 100 : '',
            sortable: true, filter: 'agNumberColumnFilter',
            headerTooltip: 'CPC = Spend / FBClicks',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',

        },
        cpclinkclicks: {
            headerName: 'CPC_LC',
            field: 'cpclinkclicks',
            // aggFunc: cpcSpender,
            valueGetter:getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
            
        },
        fbclicks: { headerName: 'FBClicks', field: 'fbclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        fblinkclicks: { headerName: 'FB_LC', headerTooltip:'fblinkclicks', field: 'fblinkclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        impressions: { headerName: 'IMP', headerTooltip:'Impressions', field: 'impressions', minWidth: 100, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        ctr: {
            headerName: 'CTR', field: 'ctr', valueGetter: getCtr, sortable: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            minWidth:100,
            valueFormatter: (params) => `${params.value}%`,
            headerTooltip: 'CTR = (FBClicks / Impressions) * 100',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        rpc: { headerName: 'RPC', minWidth: 80, field: 'rpc', valueGetter: getRpc, sortable: true, filter: 'agNumberColumnFilter', headerTooltip: 'RPC = Revenue / Conversions', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu',    cellStyle: { fontWeight: 'bold' }  },
        cpl: { headerName: 'CPL', minWidth: 80, field: 'cpl', valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter', headerTooltip: 'CPL = Spend / FBLeads', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        ncpl: { headerName: 'NCPL', minWidth: 90, field: 'ncpl', valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter', headerTooltip: 'NCPL = Spend / Conversions', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        fmargin: {
            headerName: 'FMargin', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: true,
            minWidth: 120,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
            headerTooltip: 'FMargin = (Profit / Spend) * 100',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        roi: {
            headerName: 'ROI', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: 'Profit/Spend', filter: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            minWidth: 100,
            valueFormatter: (params) => `${params.value}%`,
            headerTooltip: 'ROI = ((Revenue - Spend) / Spend) * 100',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        adsetid: { headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter", hide: false, suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        campaignid: { headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
    };

    const columnDefsObject4 = useMemo(()=> 
        [
            {
                headerName: 'Domain',
                field: 'domain',
                sortable: true,
                filter: 'agTextColumnFilter',
                resizable: false,
                width: 350, // Fixed width for Domain column
                cellStyle: { textAlign: 'left' },
                rowGroup: true, // Grouping by DOMAIN
                hide: true, // Hide this column in the grid, but it will still be used for grouping
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Keyword',
                field: 'keyword',
                sortable: true,
                filter: 'agTextColumnFilter',
                resizable: true,
                minWidth: 350,
                cellStyle: { textAlign: 'left' },
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Date',
                field: 'date',
                minWidth: 120,
                sortable: true,
                filter: 'agDateColumnFilter',
                filterParams: {
                    comparator: (filterLocalDateAtMidnight, cellValue) => {
                        const cellDate = new Date(cellValue); // Convert date string to Date object
                        if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) return 0;
                        if (cellDate < filterLocalDateAtMidnight) return -1;
                        if (cellDate > filterLocalDateAtMidnight) return 1;
                        return 0;
                    },
                },
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Revenue',
                field: 'revenue',
                sortable: true,
                filter: 'agNumberColumnFilter',
                resizable: true,
                valueFormatter: (params) => params.value ? `$${params.value.toFixed(2)}` : '$0.00',
                minWidth: 110,
                aggFunc: 'sum',
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Vertical',
                field: 'vertical',
                sortable: true,
                filter: 'agTextColumnFilter',
                resizable: true,
                minWidth: 120,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Country',
                field: 'country',
                sortable: true,
                filter: 'agTextColumnFilter',
                resizable: true,
                minWidth: 100,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Device Type',
                field: 'deviceType',
                sortable: true,
                filter: 'agTextColumnFilter',
                resizable: true,
                minWidth: 130,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Searches',
                field: 'searches',
                sortable: true,
                filter: 'agNumberColumnFilter',
                resizable: true,
                minWidth: 115,
                aggFunc: 'sum',
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Clicks',
                field: 'clicks',
                sortable: true,
                filter: 'agNumberColumnFilter',
                resizable: true,
                minWidth: 95,
                aggFunc: 'sum',
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
        ], []);

    // const getColumnDefs = (order) => {
    //     return order?.map(colKey => columnDefsObject[colKey]);
    // };

    // const getColumnDefs1 = (order) => {
    //     // console.log(order);
    //     return order?.map(colKey => columnDefsObject1[colKey]);
    // };

    // const getColumnDefs2 = (order) => {
    //     // console.log(order);
    //     return order?.map(colKey => columnDefsObject2[colKey]);
    // };

    const getColumnDefsObjectOfAdID = (order) => {
        return order?.map(colKey => columnDefsObjectOfAdID[colKey]).filter(item => item);
    }      

    const getColumnDefsObjectOfDailyAdID = (order) => {
        return order?.map(colKey => columnDefsObjectOfDailyAdID[colKey]).filter(item => item);
    } 

    const getColumnDefs = (order) => {
        return order?.map(colKey => columnDefsObject[colKey]).filter(item => item);
    };

    const getColumnDefs1 = (order) => {
        return order?.map(colKey => columnDefsObject1[colKey]).filter(item => item);
    };

    const getColumnDefs2 = (order) => {
        return order?.map(colKey => columnDefsObject2[colKey]).filter(item => item);
    };

    const getColumnDefsAdsetLevel = (order) => {
        return order?.map(colKey => columnDefsObjectAdsetLevel[colKey]).filter(item => item);
    };

    const getColumnDefsAdLevel = (order) => {
        return order?.map(colKey => columnDefsObjectAdLevel[colKey]).filter(item => item);
    };

    const getColumnDefsAdsetLevelDaily = (order) => {
        return order?.map(colKey => columnDefsObjectAdsetLevelDaily[colKey]).filter(item => item);
    };

    const getColumnDefsAdLevelDaily = (order) => {
        return order?.map(colKey => columnDefsObjectAdLevelDaily[colKey]).filter(item => item);
    };

    

    const getColumnDefs3 = (order) => {
        // console.log(order);
        const orderItems = order?.map(colKey => columnDefsObject3[colKey]);
        const newOrderItems = [columnDefsObject3["keyword"], columnDefsObject3["searchKeyword"], ...orderItems, columnDefsObject3["adId"]];
        return newOrderItems;
    };

    const getColumnDefs4 = (order) => {
        // console.log(order);
        const orderItems = order?.map(colKey => columnDefsObject3[colKey]);
        const newOrderItems = [columnDefsObject3["keyword"],   ...orderItems];
        return newOrderItems;
    };

    const [columnDefs, setColumnDefs] = useState();

    const columnDefs1 = useRef();

    const columnDefs2 = useRef();

    const columnDefs3 = useRef();

    const columnDefs4 = useRef();

    const columnDefsAdsetLevel = useRef();

    const columnDefsAdLevel = useRef();

    const columnDefsAdsetLevelDaily = useRef();

    const columnDefsAdLevelDaily = useRef();

    const columnDefsOfAdID = useRef();

    const columnDefsOfDailyAdID = useRef();

    var token = localStorage.getItem("token")

    useEffect(() => {
        // console.log(mainData);
        // console.log(mainData.length);
        // console.log(Camapignlevelstatus);
        if(mainData?.length > 0 && Camapignlevelstatus.length > 0){
            setColumnDefs(getColumnDefs(mainData));
            columnDefs1.current = getColumnDefs2(mainData);
            columnDefs2.current = getColumnDefs2(mainData);
            columnDefs3.current = getColumnDefs3(mainData);
            columnDefs4.current = getColumnDefs4(mainData);
            columnDefsAdsetLevel.current = getColumnDefsAdsetLevel(mainData);
            columnDefsAdLevel.current = getColumnDefsAdLevel(mainData);
            columnDefsAdsetLevelDaily.current = (getColumnDefsAdsetLevelDaily(mainData));
            columnDefsAdLevelDaily.current = (getColumnDefsAdLevelDaily(mainData));
            // Ensure that 'adid' is included in the column structure
            let updatedColumnStructure = mainData;
            if (!updatedColumnStructure.includes('adid')) {
                updatedColumnStructure = [...updatedColumnStructure, 'adid'];
            }
            if (!updatedColumnStructure.includes('adname')) {
                updatedColumnStructure = [...updatedColumnStructure, 'adname'];
            }
            // Now update the colDefs for the adid grid
            const newColumnDefs = getColumnDefsObjectOfAdID(updatedColumnStructure);
            const newColumnDailyDefs = getColumnDefsObjectOfDailyAdID(updatedColumnStructure);
            setColDefs(newColumnDefs);
            setColDailyDefs(newColumnDailyDefs);
            // console.log('Updated columnDefsOfAdID:', newColumnDefs);
            setColumnStructureStatus(true);
        }
    }, [mainData, Camapignlevelstatus]);


    const updatingColumnsStructure = async (updateDataArray) => {
        // console.log(updateDataArray);
        const response = await apiClient.put(`/api/updateUserData?email=${userdetails.email}`,
            {
                updateDataArray
            });
        // console.log(response.data);
        mainDataRef.current = updateDataArray;
        setColumnDefs(getColumnDefs(updateDataArray));
        columnDefs1.current = (getColumnDefs1(updateDataArray));
        columnDefs2.current = (getColumnDefs2(updateDataArray));
        columnDefs3.current = (getColumnDefs3(updateDataArray));
        columnDefs4.current = (getColumnDefs4(updateDataArray));
        columnDefsAdsetLevel.current = (getColumnDefsAdsetLevel(updateDataArray));
        columnDefsAdLevel.current = (getColumnDefsAdLevel(updateDataArray));
        columnDefsAdsetLevelDaily.current = (getColumnDefsAdsetLevelDaily(updateDataArray));
        columnDefsAdLevelDaily.current = (getColumnDefsAdLevelDaily(updateDataArray));
        setColDefs(getColumnDefsObjectOfAdID(updateDataArray));
        setColDailyDefs(getColumnDefsObjectOfDailyAdID(updateDataArray));
        columnDefsOfAdID.current = (getColumnDefsObjectOfAdID(updateDataArray));
        columnDefsOfDailyAdID.current = (getColumnDefsObjectOfDailyAdID(updateDataArray));
        // const data = mainData;
        setColumnStructure(mainDataRef.current);
        // setTimeout(() => {
        //     console.log("data", mainDataRef.current);
        //     setColumnStructure(mainDataRef.current);
        // }
        // , 1000);
        
        
    };

    const MAX_RETRIES = 3;
    let retryCount = 0;

    const functionCallForUserColumnStructure = async () => {
        try {
          const fetchData = await apiClient.get(`/api/singleUserData?email=${userdetails.email}`);
          const mainData = fetchData.data;
          setColumnStructure(mainData?.columnStructure);
          mainDataRef.current = mainData;
          // Use the existing API column structure for other grid columns
          setColumnDefs(getColumnDefs(mainData.columnStructure));
          columnDefs1.current = getColumnDefs2(mainData.columnStructure);
          columnDefs2.current = getColumnDefs2(mainData.columnStructure);
          columnDefs3.current = getColumnDefs3(mainData.columnStructure);
          columnDefs4.current = getColumnDefs4(mainData.columnStructure);
          columnDefsAdsetLevel.current = (getColumnDefsAdsetLevel(mainData.columnStructure));
          columnDefsAdLevel.current = (getColumnDefsAdLevel(mainData.columnStructure));
          columnDefsAdsetLevelDaily.current = (getColumnDefsAdsetLevelDaily(mainData.columnStructure));
          columnDefsAdLevelDaily.current = (getColumnDefsAdLevelDaily(mainData.columnStructure));
          // Ensure that 'adid' is included in the column structure
          let updatedColumnStructure = mainData.columnStructure;
          if (!updatedColumnStructure.includes('adid')) {
            updatedColumnStructure = [...updatedColumnStructure, 'adid'];
          }
          if (!updatedColumnStructure.includes('adname')) {
            updatedColumnStructure = [...updatedColumnStructure, 'adname'];
          }
          // Now update the colDefs for the adid grid
          const newColumnDefs = getColumnDefsObjectOfAdID(updatedColumnStructure);
          const newColumnDailyDefs = getColumnDefsObjectOfDailyAdID(updatedColumnStructure);
          setColDefs(newColumnDefs);
          setColDailyDefs(newColumnDailyDefs);
        //   console.log('Updated columnDefsOfAdID:', newColumnDefs);
          setColumnStructureStatus(true);
        } catch (error) {
          if (error.response?.status === 500 && retryCount < MAX_RETRIES) {
            retryCount++;
            console.warn(`Retrying... Attempt ${retryCount}/${MAX_RETRIES}`);
            setTimeout(functionCallForUserColumnStructure, 1000); // Delay retry
          } else {
            console.error("Failed to fetch column structure:", error);
            setColumnStructureStatus(true);
          }
        }
    };

    const functionCallForAllCampaignsData = async () => {
        try{
            const fetchData = await apiClient.get(
                `/AllCampaigns?accountNumber=${account}&timezone=${time}&network=${newtworkCollections[revenuePratner]}&campaignName=${inputValue}`
            );
            setAllProfitLossArray(fetchData?.data);
        }
        catch(err){
            setAllProfitLossArray([]);
        }
        
    }

    // const functionCallForUserColumnStructure = async () => {
    //     try{
    //         const fetchData = await apiClient.get(`/api/singleUserData?email=${userdetails.email}`);
    //         const mainData = fetchData.data;
    //         setColumnDefs(getColumnDefs(mainData.columnStructure));
    //         columnDefs1.current = getColumnDefs2(mainData.columnStructure);
    //         columnDefs2.current = (getColumnDefs2(mainData.columnStructure));
    //         columnDefs3.current = (getColumnDefs3(mainData.columnStructure));
    //         columnDefs4.current = (getColumnDefs4(mainData.columnStructure));
    //         setColumnStructureStatus(true);
    //     }
    //     catch (error) {
    //         if (error.response?.status === 500 && retryCount < MAX_RETRIES) {
    //             retryCount++;
    //             console.warn(`Retrying... Attempt ${retryCount}/${MAX_RETRIES}`);
    //             setTimeout(functionCallForUserColumnStructure, 1000); // Delay retry
    //         } else {
    //             console.error("Failed to fetch column structure:", error);
    //             setColumnStructureStatus(true);
    //         }
    //     }
    // }

    const functionCallForCommnets = async (account) => {
        try{
            const commentFetch = await apiClient.get(`/Comments/${account}`);
            const campaignComments = commentFetch.data; // Set comments only if fetched successfully
            setCampaignComments(campaignComments);
            setCommentsStatus(true);
            
        }catch(err){
            setCampaignComments([]); // Reset comments if fetch fails
            setCommentsStatus(true);
        }   
    };

    const functionCallForCampaigns = async (account) => {
        try{
            const campaignStatusFetch = await apiClient.get(`/Campaignstatusfb/${account}`);
            
            if (campaignStatusFetch.status === 200) {
                setCamapignlevelstatus(campaignStatusFetch.data); // Update state with fetched campaign status
            }
            setCampaignsStatus(true);
        }catch(err){
            setCamapignlevelstatus([]); // Reset campaign status if fetch fails
            setCampaignsStatus(true);
        }   
    };
    

    useEffect(() => {
        if(campaignsStatus && commentsStatus && columnStructureStatus){
            setMoveForward(true);
        }
    },[campaignsStatus, commentsStatus, columnStructureStatus]);

    const functionCall = async (account) => {
        await functionCallForAllCampaignsData();
        await functionCallForCampaigns(account);
        await functionCallForCommnets(account);
        await functionCallForUserColumnStructure();
    };
    
    // ✅ Calls `functionCall` when page loads
    useEffect(() => {
        functionCall(account);
    }, []); 



    const selectRevenuePartner = ["Fb_Mnet", "Fb_Enki"];
    let selectElementAccounts = [];
    const mnetAccounts = ['674038077865381', '665204411821465'];
    const enkiAccounts = ['364991119488050'];

    const onChangeSelectRevenue = (value) => {
        const accountsForAccess = adAccounts[value];

        const accountsAccess = accountsForAccess === undefined ? [] : accountsForAccess;
        setNetworksData(accountsAccess);
        setRevenuePartner(value);
        value === "FB_Rsoc" || value === "FB_Tonic" || value === "FB_DomainActive" || value === "FB_Tonic1" ? setTime('PDT') : setTime('UTC')
    }
    const onChangeSelect = (value) => {
        setAccount(value);
    }

    const onChangeTime = (value) => {
        setTime(value);
    }

    const onClickButton = async () => {
        localStorage.removeItem("storedData");
        
        const storedData = {
            startDate,
            endDate,
            revenuePratner,
            time,
            account,
            accountName
        };
        // console.log(storedData, "storedData");
        localStorage.setItem("storedData", JSON.stringify(storedData));
        setCampaignsStatus(false);
        setCommentsStatus(false);
        setColumnStructureStatus(false);
        setMoveForward(false);
    
        setNewEndDate(endDate);
        setNewStartDate(startDate);
        setTrue(true);
        setRowData([]);
        setTime(time);
        // setLoading(true);
        // setLoading1(true);
        // setLoading2(true);
    
        // if (newRevenuePratner === "FB_DomainActive") {
        //     setLoading3(true);
        //     setCampaignNamesDActiveLiveLoading(true);
        //     setCampaignNamesDActiveDailyLoading(true);
        // }
        // if (newRevenuePratner === "FB_System1") {
        //     setLoading4(true);
        // }
        // if (newRevenuePratner === "FB_Tonic1") {
        //     setTonicKeywordLoading(true);
        // }
    
        setNewAccount(account);
        setnewAccountName(accountName);
        setNewTime(time);
        setNewRevenuePartner(revenuePratner);
    
        if (newRevenuePratner !== revenuePratner || newaccount !== account) {
            setPageSize(1);
        } else {
            setPageSize(pageSize);
        }
    
        isInitialLoad.current = false;
    
        // ✅ Call function sequence AFTER state updates
        await functionCall(account);
    };

    const timezones = [
        'UTC',
        'EEST',
        'EDT',
        'CST',
        'PDT',
        'IST',
        'BST',
        'GMT',
        'MST',
        'CDT',
        'AST',
        'DST',
        'CEST'
    ];

    


    switch (revenuePratner) {
        case "FB_Mnet":
            selectElementAccounts = [...mnetAccounts];
            break;
        case "FB_Enki":
            selectElementAccounts = [...enkiAccounts];
            break;
        default:
            null;
            break
    }

    const handleChange = (dates) => {
        if (dates && dates.length === 2) {
            const [start, end] = dates;
            setStartDate(start.format('YYYY-MM-DD'));
            setEndDate(end.format('YYYY-MM-DD'));
        }
    };

    const [campaignComments, setCampaignComments] = useState([]);
    const fetchCampaignComments = async () => {
        try {

            const response = await apiClient.get(`/Comments/${account}`);
            setCampaignComments(response.data); // Update the state with the fetched comments
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };


    useEffect( () => {
        // Ensure it only runs if `refrst` changes after the first render
        if (hasFetched.current) {
            fetchCampaignComments();
        } else {
            hasFetched.current = true; // Set it to true after first render
        }
    }, [refrst]); // Run this effect when refrst changes
    

    const handleColumnMove = (params, gridId) => {
        const columnState = params.api.getColumnState();
        // console.log('Column moved in grid:', gridId);
        const fieldOrder = columnState.map(col => col.colId);
        const newFieldOrder = fieldOrder.filter(item => item !== 'ag-Grid-AutoColumn-campaignname' && item !== 'ag-Grid-AutoColumn' && columnStructure.includes(item));
        localStorage.setItem('columnState', JSON.stringify(newFieldOrder));
        updatingColumnsStructure(newFieldOrder);
        // console.log(`Updating columns structure for grid: ${gridId}`);
    };

    const debouncedHandleColumnMove = useCallback(debounce((params, gridId) => handleColumnMove(params, gridId), 600), []);

    

    const rangePresets = [
        {
            label: 'Today',
            value: [dayjs().add(0, 'd'), dayjs().add(0, 'd')],
        },
        {
            label: 'Yesterday',
            value: [dayjs().add(-1, 'd'), dayjs().add(-1, 'd')],
        },
        {
            label: 'Last 7 Days',
            value: [dayjs().add(-7, 'd'), dayjs()],
        },
        {
            label: 'Last 14 Days',
            value: [dayjs().add(-14, 'd'), dayjs()],
        },
        {
            label: 'Last 30 Days',
            value: [dayjs().add(-30, 'd'), dayjs()],
        },
        {
            label: 'Last 60 Days',
            value: [dayjs().add(-60, 'd'), dayjs()],
        },
        {
            label: 'Last 90 Days',
            value: [dayjs().add(-90, 'd'), dayjs()],
        },
        {
            label: 'This Month',
            value: [dayjs().startOf('month'), dayjs()],
        },
        {
            label: 'Last Month',
            value: [
                dayjs().subtract(1, 'month').startOf('month'),
                dayjs().subtract(1, 'month').endOf('month'),
            ],
        },
    ];
    
    const refreshComponent = (activeTab) => {
        setRefreshContent("");
        setTimeout(() => {
            setRefreshContent("Refresh"+activeTab);
        }
        , 100);
        setTimeout(() => {
            setRefreshContent("");
        }
        , 500);

    };

    const onClickRefresh = async () => {
        // console.log(activeTab);
        await functionCallForAllCampaignsData();

        refreshComponent(activeTab);
        // refreshGrid(gridRef);  // Refresh gridRef
        // refreshGrid1(gridRef1); // Refresh gridRef1
        // refreshGrid2(gridRef2); // Refresh gridRef2
        // refreshGrid3(gridRef3); // Refresh gridRef3
        // refreshGrid4(gridRef4);
        // refreshGrid5(gridRef5);
        // refreshGrid6(gridRefForCampaignNamesLive);
        // refreshGrid7(gridRefForCampaignNamesDaily);
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

    const disabledDate = (current) => {
        // Disable dates after today
        return current && current > dayjs().endOf('day');
    };

    const [isOpen, setIsOpen] = useState(false); // State to track if dropdown is open
    const [selectedValue, setSelectedValue] = useState(
        accountNumberFromDashboard ? accountNumberFromDashboard?.replace(/\+/g, " ") : (storedData ? storedData?.account : typeof networksData[0] === 'string' ? networksData[0] : networksData[0].accountNumber)
    ); // Track selected value

    const handleDropdownVisibleChange = (open) => {
        setIsOpen(open); // Set dropdown open state
        setAccountNumberToPass(null);
    };

    // Handle option selection
    const handleChange1 = (value) => {
        const findAccount = (data, accountNumber) =>
            Object.values(data).flat().find(item => item.accountNumber === accountNumber) || null;

        const accountNameForAccount = findAccount(userdetails?.adAccounts, value);
        setAccountName(accountNameForAccount.accountName)
        setSelectedValue(value); // Update selected value
        onChangeSelect(value); // Call onChangeSelect function
    };

    // Create option with conditional rendering of additional info
    const createOption = (account) => {
        if (typeof account === 'string') {
            return {
                value: account,
                label: account, // If account is just a string, display it directly
            };
        } else {
            return {
                value: account.accountNumber,
                label: (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        padding: '5px 0',
                        height: 'auto',  // Adjust height to prevent layout issues
                        overflow: 'hidden'  // Prevent overflow issues
                    }}>
                        {/* Left Section: Account Details */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            maxWidth: '70%'
                        }}>
                            {/* Always show accountNumber */}
                            <p style={{
                                margin: '0px',
                                padding: '0px',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {account.accountNumber}
                            </p>
                            {/* Show "Additional Info" ONLY if the dropdown is open */}
                            {isOpen && (
                                <p style={{
                                    margin: '0px',
                                    padding: '0px',
                                    fontSize: '12px',
                                    color: 'gray',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {account.accountName ? account.accountName : ''}
                                </p>
                            )}
                        </div>
                        {/* Right Section: Status Icon */}
                        <span style={{ marginLeft: '10px', flexShrink: 0 }}>
                            {account.status === "Active" ? (
                                <CheckCircleFilled style={{ color: 'green', fontSize: '15px' }} className='black-icon-active-1' />
                            ) : (
                                <CloseCircleFilled style={{ color: 'red', fontSize: '15px' }}  className='black-icon-pause-1' />
                            )}
                        </span>
                    </div>
                ),
                text: account.accountNumber, // For sorting/filtering purposes
            };
        }
    };

    const resetColumnStructure = () =>{
        updatingColumnsStructure(columnStructure)
    }

    const refreshComments = (comment) =>{
        functionCallForCommnets(comment);
    }


    const items = [
        { key: '1', label: 'Live', content: 'Content for Live data' },
        { key: '2', label: 'Daily', content: 'Content for Daily data' },
        { key: '3', label: 'Campaigns', content: 'Content for Campaign data' },
        { key: '4', label: 'Agency', content: 'Content for BMName data' },
        ...(newRevenuePratner === "FB_Mnet" ? [{ key: '5', label: 'Domain', content: 'Content for Domain data' }] : []),
        ...(newRevenuePratner === "FB_DomainActive" ? [{ key: '5', label: 'Keywords', content: 'Content for Keyword data' }] : []),
        ...(newRevenuePratner === "FB_System1" ? [{ key: '5', label: 'Domain', content: 'Content for Domain data' }] : []),
        ...(newRevenuePratner === "FB_Tonic1" ? [{ key: '5', label: 'Keywords', content: 'Content for Keyword data' }] : []),
        // ...(newRevenuePratner === "FB_Mnet" ? [{ key: '6', label: 'Ad-Live', content: 'Content for Domain data' }] : []),
        // ...(newRevenuePratner === "FB_Mnet" ? [{ key: '7', label: 'Ad-Daily', content: 'Content for Domain data' }] : []),
        // ...(newRevenuePratner === "FB_DomainActive" ? [{ key: '6', label: 'Names-Live', content: 'Content for Names Live data' }] : []),
        // ...(newRevenuePratner === "FB_DomainActive" ? [{ key: '7', label: 'Names-Daily', content: 'Content for Names Daily data' }] : []),
    ];
    // const handleSlideChange = (from, to) => {
    //     // console.log(to, "to");
    //     setActiveTab((parseInt(to) + 1).toString());
    //     console.log((parseInt(to) + 1).toString());
    //     // console.log((parseInt(to)+1).toString());
    // };

    const handleCarouselChange = (index) => {
        setActiveTab(index);
        // console.log(index);
        // console.log(parseInt(index)-1);
        // carouselRef.current.goTo(parseInt(index))
        localStorage.setItem("activeTab", index);
        
    };
    const handleTabChange = (key) => {
        // console.log("Switched to Tab:", key); // Debugging log
        setActiveTab(key);
    };

    const renderCarouselNav = () => (
        <StickyBox offsetTop={64} offsetBottom={20} style={{ zIndex: 1, padding: '0px', margin: '0px', paddingLeft: '12px' }}>
            <Tabs
                activeKey={activeTab}
                onChange={handleCarouselChange}
                items={items.map((item) => ({
                    key: item.key,
                    label: item.label,
                }))}
                className={`custom-tabs ${theme === 'dark' ? 'dark-mode-tabs' : 'light-mode-tabs'}`}
                style={{
                    backgroundColor:  'transparent',
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


    return (
        <div className='reports-container'>
            {/* className='select-container' */}
            <Space direction="vertical" style={{ width: '100%', padding: "1%" }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6} lg={5} xl={4} xxl={3}>
                        <Select
                            showSearch
                            className='select-element'
                            onChange={onChangeSelectRevenue}
                            style={{
                                width: '100%',
                                backgroundColor: theme === 'dark' && '#333', // Background color
                                color: theme === 'dark' && '#fff',
                            }}
                            placeholder="Select Network"

                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            optionFilterProp="label"
                            defaultValue={networkFromDashboard ? networkFromDashboard : (storedData ? storedData?.revenuePratner : (networks[0]))}
                            options={networks.map((item) => ({
                                value: item,
                                label: item,
                            }))}
                        />
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6} xl={5} xxl={4} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                        <Select
                            showSearch
                            onChange={handleChange1} // Handle value selection
                            dropdownClassName={theme === 'dark' ? "custom-dropdown" : ''} // Apply dark theme if needed
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            style={{
                                width: '100%',
                                maxWidth: '100%',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }} // Prevent overflow with ellipsis
                            placeholder="Select Account"
                            optionFilterProp="value"
                            value={accountNumberToPass ? accountNumberToPass : selectedValue}  // Set selected value
                            defaultValue={accountNumberFromDashboard ? accountNumberFromDashboard : (storedData ? storedData?.account : (networksData[0].accountNumber))}
                            options={accountsAccess.map((item) => createOption(item))} // Create options dynamically
                            onDropdownVisibleChange={handleDropdownVisibleChange} // Toggle dropdown state
                        />
                    </Col>
                    <Col xs={24} sm={24} md={15} lg={6}>
                        <ConfigProvider 
                            locale={locale}
                            theme={{
                                token: {
                                  colorPrimary: '#C7F39A', 
                                  colorTextLightSolid: '#000',
                                },
                            }}
                        >
                            <RangePicker
                                presets={rangePresets}
                                onChange={handleChange}
                                disabledDate={disabledDate}
                                defaultValue={defaultDates}
                                format="YYYY-MM-DD"
                                style={{
                                    width: '100%',
                                    backgroundColor: theme === 'dark' ? '#555' : undefined,
                                    color: theme === 'dark' ? 'white' : undefined,
                                }}
                                dropdownClassName={theme === 'dark' ? 'dark-theme-dropdown' : ''}
                            />
                        </ConfigProvider>
                    </Col>

                    <Col xs={24} sm={12} md={3} lg={3} xl={2}>
                        <Select
                            showSearch
                            onChange={onChangeTime}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            placeholder="Select Timezone"
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            style={{width: '100%'}}
                            optionFilterProp="label"
                            value={time}
                            options={timezones.map((item) => ({
                                value: item,
                                label: item,
                            }))}
                        />
                    </Col>

                    <Col xs={24} sm={12} md={2}>
                        <Button className='submit-button' type='primary' style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black', fontWeight: '600' }} onClick={onClickButton} block>
                            Submit
                        </Button>
                    </Col>
                </Row>
            </Space>
            <div style={{ padding: '0px', margin: '0px' }}>
                <Row gutter={8} style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}> 
                    {renderCarouselNav()}
                    <div style={{display: 'flex', marginRight: '15px'}}>
                        {/* <Row gutter={8} style={{ marginTop: '16px' }}>  */}
                            {/* <Col>
                                <Switch style={{marginTop:'5px'}}/>
                            </Col> */}
                            <Col>
                                <Input
                                placeholder="Search here"
                                value={inputValue}
                                onChange={handleChangeInput}
                                onBlur={handleBlur}
                                // onPressEnter={handleChangeInput}
                                className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                style={{ width: '225px', borderRadius: '5px', height:'30px', backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555' }}
                                />
                            </Col>
                            <Col>
                                <Button
                                style={{
                                    backgroundColor: '#C7F39A',
                                    border: 'solid 0px',
                                    color: 'black',
                                    height:'30px'
                                }}
                                icon={<SearchOutlined  className="black-icon"/>}
                                // onClick={handleChangeInput}
                                />
                            </Col>
                            <Col>
                                <Tooltip title="Click to Refresh Tables">
                                    <Button
                                    type="primary"
                                    style={{
                                        backgroundColor: '#C7F39A',
                                        border: 'solid 0px',
                                        color: 'black',
                                        height:'30px'
                                    }}
                                    icon={<ReloadOutlined  className="black-icon" />}
                                    onClick={onClickRefresh}
                                    />
                                </Tooltip>
                            </Col>
                        {/* </Row> */}
                    </div>
                </Row>
            </div>
            {!moveForward ? 
            (
                <div style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {/* <Flex align="center" gap="middle">
                        <Spin size="large" />
                    </Flex> */}
                    <div style={{ padding: '24px' }}>
                        <Skeleton active paragraph={{ rows: 20 }} />
                    </div>
                </div>
            ) : 
            (
                <div>

                <Tabs activeKey={activeTab} onChange={handleTabChange} renderTabBar={() => <></>}>
                <Tabs.TabPane key="1">
                {/* {Camapignlevelstatus.length > 0 && ( */}
                    <LiveReports 
                    startDate={newStartDate} 
                    endDate={newendDate} 
                    newaccount={newaccount} 
                    newtime={newtime} 
                    newRevenuePratner={newRevenuePratner} 
                    inputValue={inputValue} 
                    newAccountName={newAccountName} 
                    columnDefs={columnDefs} 
                    columnDefs1={columnDefsAdsetLevel.current}
                    columnDefs2={columnDefsAdLevel.current}
                    campaignComments={campaignComments} 
                    Camapignlevelstatus={Camapignlevelstatus} 
                    changeRRefrst={resetColumnStructure} 
                    debouncedHandleColumnMove={debouncedHandleColumnMove} 
                    userdetails={userdetails} 
                    refreshComments={refreshComments}
                    refreshpage={refreshContent}
                    getMainMenuItems={getMainMenuItems}
                    toggleStatus={checked}
                    handleChangeToggle={handleChangeToggle}
                    theme={theme}
                    />
                {/* )} */}
                </Tabs.TabPane>

                <Tabs.TabPane key="2">
                    <DailyReports 
                    startDate={newStartDate} 
                    endDate={newendDate} 
                    newaccount={newaccount} 
                    newtime={newtime} 
                    newRevenuePratner={newRevenuePratner} 
                    inputValue={inputValue} 
                    newAccountName={newAccountName} 
                    columnDefs={columnDefs1}
                    columnDefs1={columnDefsAdsetLevelDaily}
                    columnDefs2={columnDefsAdLevelDaily}
                    campaignComments={campaignComments} 
                    Camapignlevelstatus={Camapignlevelstatus} 
                    changeRRefrst={resetColumnStructure} 
                    debouncedHandleColumnMove={debouncedHandleColumnMove} 
                    userdetails={userdetails} 
                    refreshComments={refreshComments}
                    refreshpage={refreshContent}
                    getMainMenuItems={getMainMenuItems}
                    toggleStatus={checked}
                    handleChangeToggle={handleChangeToggle}
                    />
                </Tabs.TabPane>

                <Tabs.TabPane key="3">
                    <CampaignReports 
                    startDate={newStartDate} 
                    endDate={newendDate} 
                    newaccount={newaccount} 
                    newtime={newtime} 
                    newRevenuePratner={newRevenuePratner} 
                    inputValue={inputValue} 
                    newAccountName={newAccountName} 
                    columnDefs={columnDefs2} 
                    fetchData={allProfitLossArray}
                    campaignComments={campaignComments} 
                    Camapignlevelstatus={Camapignlevelstatus} 
                    changeRRefrst={resetColumnStructure} 
                    debouncedHandleColumnMove={debouncedHandleColumnMove} 
                    userdetails={userdetails} 
                    refreshComments={refreshComments}
                    refreshpage={refreshContent}
                    getMainMenuItems={getMainMenuItems}
                    toggleStatus={checked}
                    handleChangeToggle={handleChangeToggle}
                    />
                </Tabs.TabPane>

                <Tabs.TabPane key="4">
                    <AgencyAndBMNameReports 
                    startDate={newStartDate} 
                    endDate={newendDate} 
                    newaccount={newaccount} 
                    newtime={newtime} 
                    newRevenuePratner={newRevenuePratner} 
                    inputValue={inputValue} 
                    newAccountName={newAccountName} 
                    campaignComments={campaignComments} 
                    Camapignlevelstatus={Camapignlevelstatus}  
                    userdetails={userdetails} 
                    refreshComments={refreshComments}
                    refreshpage={refreshContent}
                    getMainMenuItems={getMainMenuItems}
                    />
                </Tabs.TabPane>

                {newRevenuePratner === "FB_Mnet" && (
                    <Tabs.TabPane key="5">
                    <MnetDomainReports 
                        startDate={newStartDate} 
                        endDate={newendDate} 
                        newaccount={newaccount} 
                        newtime={newtime} 
                        newRevenuePratner={newRevenuePratner} 
                        inputValue={inputValue} 
                        newAccountName={newAccountName} 
                        campaignComments={campaignComments} 
                        Camapignlevelstatus={Camapignlevelstatus} 
                        userdetails={userdetails} 
                        refreshComments={refreshComments}
                        refreshpage={refreshContent}
                        getMainMenuItems={getMainMenuItems}
                    />
                    </Tabs.TabPane>
                )}

                {newRevenuePratner === "FB_DomainActive" && (
                    <Tabs.TabPane key="5">
                    <DAKeywordReports 
                        startDate={newStartDate} 
                        endDate={newendDate} 
                        newaccount={newaccount} 
                        newtime={newtime} 
                        newRevenuePratner={newRevenuePratner} 
                        inputValue={inputValue} 
                        newAccountName={newAccountName} 
                        columnDefs={columnDefs3} 
                        campaignComments={campaignComments} 
                        Camapignlevelstatus={Camapignlevelstatus} 
                        changeRRefrst={resetColumnStructure} 
                        debouncedHandleColumnMove={debouncedHandleColumnMove} 
                        userdetails={userdetails} 
                        refreshComments={refreshComments}
                        refreshpage={refreshContent}
                        getMainMenuItems={getMainMenuItems}
                        toggleStatus={checked}
                        handleChangeToggle={handleChangeToggle}
                    />
                    </Tabs.TabPane>
                )}

                {newRevenuePratner === "FB_Tonic1" && (
                    <Tabs.TabPane key="5">
                    <TonicKeywordReports 
                        startDate={newStartDate} 
                        endDate={newendDate} 
                        newaccount={newaccount} 
                        newtime={newtime} 
                        newRevenuePratner={newRevenuePratner}  
                        columnDefs={columnDefs4} 
                        inputValue={inputValue} 
                        newAccountName={newAccountName} 
                        campaignComments={campaignComments} 
                        Camapignlevelstatus={Camapignlevelstatus} 
                        changeRRefrst={resetColumnStructure} 
                        debouncedHandleColumnMove={debouncedHandleColumnMove} 
                        userdetails={userdetails} 
                        refreshComments={refreshComments}
                        refreshpage={refreshContent}
                        getMainMenuItems={getMainMenuItems}
                    />
                    </Tabs.TabPane>
                )}

                {newRevenuePratner === "FB_System1" && (
                    <Tabs.TabPane key="5">
                    <System1KeywordReports 
                        startDate={newStartDate} 
                        endDate={newendDate} 
                        newaccount={newaccount} 
                        newtime={newtime} 
                        newRevenuePratner={newRevenuePratner} 
                        inputValue={inputValue} 
                        newAccountName={newAccountName} 
                        campaignComments={campaignComments} 
                        Camapignlevelstatus={Camapignlevelstatus} 
                        changeRRefrst={resetColumnStructure} 
                        userdetails={userdetails} 
                        refreshComments={refreshComments}
                        refreshpage={refreshContent}
                        getMainMenuItems={getMainMenuItems}
                    />
                    </Tabs.TabPane>
                )}

                {/* {newRevenuePratner === "FB_Mnet" && (
                    <Tabs.TabPane key="6">
                        <MnetLiveAdReports 
                            startDate={newStartDate} 
                            endDate={newendDate} 
                            newaccount={newaccount} 
                            newtime={newtime} 
                            newRevenuePratner={newRevenuePratner} 
                            inputValue={inputValue} 
                            newAccountName={newAccountName} 
                            // columnDefs={columnDefsOfAdID.current} 
                            columnDefs={colDefs}
                            campaignComments={campaignComments} 
                            Camapignlevelstatus={Camapignlevelstatus} 
                            changeRRefrst={resetColumnStructure} 
                            debouncedHandleColumnMove={debouncedHandleColumnMove} 
                            userdetails={userdetails} 
                            refreshComments={refreshComments}
                            refreshpage={refreshContent}
                            getMainMenuItems={getMainMenuItems}
                            toggleStatus={checked}
                            handleChangeToggle={handleChangeToggle}
                        />
                    </Tabs.TabPane>
                )}

                {newRevenuePratner === "FB_Mnet" &&  (
                    <Tabs.TabPane key="7">
                        <MnetDailyAdReport 
                        startDate={newStartDate} 
                        endDate={newendDate} 
                        newaccount={newaccount} 
                        newtime={newtime} 
                        newRevenuePratner={newRevenuePratner} 
                        inputValue={inputValue} 
                        newAccountName={newAccountName} 
                        columnDefs={colDailyDefs} 
                        campaignComments={campaignComments} 
                        Camapignlevelstatus={Camapignlevelstatus} 
                        changeRRefrst={resetColumnStructure} 
                        debouncedHandleColumnMove={debouncedHandleColumnMove} 
                        userdetails={userdetails} 
                        refreshComments={refreshComments}
                        refreshpage={refreshContent}
                        getMainMenuItems={getMainMenuItems}
                        toggleStatus={checked}
                        handleChangeToggle={handleChangeToggle}
                        />
                    </Tabs.TabPane>
                )} */}
                </Tabs>

            </div>
            )
        }
            <Modal
                title="Basic Modal"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Add"
                cancelText="Cancel"
            >
                <Input value={newColumnName} placeholder='Enter Column Name' style={{ marginBottom: '10px' }} onChange={(e) => setNewColumnName(e.target.value)} />
                <Input value={formula} placeholder='Enter Formula' style={{ marginBottom: '10px' }} onChange={(e) => setFormula(e.target.value)} />
            </Modal>

        </div>
    );
};
export default MyTablePage;