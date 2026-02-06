"use client"
import { lazy, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { redirect, useRouter } from 'next/navigation';
import debounce from 'lodash.debounce';
import React from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import dayjs from 'dayjs';
import { Checkbox, Carousel, Input, Button, Row, Col, Typography, Modal, message, ConfigProvider, Switch, Flex, Spin, Tabs, Skeleton, Dropdown, Menu } from 'antd';
import { SettingOutlined, DownOutlined, FilterOutlined, WarningOutlined, DollarOutlined, EditOutlined, SearchOutlined, ReloadOutlined, CopyOutlined, CheckCircleFilled, CloseCircleFilled, PlusOutlined, ArrowRightOutlined, RightOutlined, HistoryOutlined } from '@ant-design/icons';
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
import { FaRobot } from 'react-icons/fa';
import { Audio } from 'react-loader-spinner';
import { TiTickOutline, TiTimesOutline } from "react-icons/ti";
import { Account } from 'aws-sdk';


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
    "FB_InuvoPrism": "Facebook_InuvoPrism"
}

const networkCollectionsForAiAssistant = {
    FB_Mnet: 'Facebook_Mnet_Daily',
    FB_MnetBing: 'Facebook_MnetBing_Daily',
    FB_Enki: 'Facebook_Enki',
    FB_System1: 'Facebook_System1',
    FB_Rsoc: 'Facebook_Rsoc',
    FB_Tonic: 'Facebook_Tonic',
    FB_DomainActive: 'Facebook_DActive_Names',
    FB_Bodies: 'Facebook_Bodies',
    FB_Bodies1: 'Facebook_Bodies1',
    Newsbreak_DA: 'Newsbreak_DomainActive',
    FB_Tonic1: 'Facebook_Tonic1',
    FB_Sedo: 'Facebook_Sedo',
    FB_Inmobi: 'Facebook_Inmobi',
    FB_TonicRsoc: 'Facebook_TonicRsoc',
    FB_InuvoPrism: 'Facebook_InuvoPrismDaily',
    FB_CodeFuel: 'Facebook_CodeFuel_Daily',
    FB_Predicto: 'Facebook_Predicto_Daily',
    FB_Affinity: 'Facebook_Affinity_Daily',
};

const NetworkDefaultTimezones = {
    "FB_Mnet": "UTC",
    "FB_MnetBing": "UTC",
    "FB_Enki": "UTC",
    "FB_System1": 'UTC',
    "FB_Rsoc": 'PDT',
    "FB_Tonic": 'PDT',
    "FB_DomainActive": "PDT",
    "FB_Bodies": "UTC",
    "FB_Bodies1": "UTC",
    "Newsbreak_DA": "PDT",
    "FB_Tonic1": "PDT",
    "FB_Sedo": "CET",
    "FB_TonicRsoc": "PDT",
    "FB_InuvoPrism": "PDT",
    "FB_CodeFuel": "UTC",
    "FB_Predicto": "EDT",
    "FB_Affinity": "PDT"
}


const LiveReports = React.lazy(() => import('../componentsOfReports/Live'));
const DailyReports = React.lazy(() => import('../componentsOfReports/Daily'));
const CampaignReports = React.lazy(() => import('../componentsOfReports/AllCampaigns'));
const DAKeywordReports = React.lazy(() => import('../componentsOfReports/DAKeywords'));
const System1KeywordReports = React.lazy(() => import('../componentsOfReports/System1Keywords'));
const TonicKeywordReports = React.lazy(() => import('../componentsOfReports/Tonic1Keywords'));
const TonicRsocKeywordReports = React.lazy(() => import('../componentsOfReports/TonicRsocKeywords'));
const InmobiKeywordReports = React.lazy(() => import('../componentsOfReports/InmobiKeywords'));
const AgencyAndBMNameReports = React.lazy(() => import('../componentsOfReports/AgencyAndBMName'));
const MnetDomainReports = React.lazy(() => import('../componentsOfReports/MnetDomainData'));
const MnetLiveAdReports = React.lazy(() => import('../componentsOfReports/MnetAdLive'));
const MnetDailyAdReport = React.lazy(() => import('../componentsOfReports/MnetAdDaily'));
const CampaignHistoryModal = React.lazy(() => import('../componentsOfReports/ReportsActivityHistory'));

const MyTablePage = () => {
    const router = useRouter();
    const { userdetails, theme, apiClient } = useTokenContext();
    const params = new URLSearchParams(window.location.search);

    const networkFromDashboard = params.get('network');
    const accountNumberFromDashboard = params.get('accountNumber');
    const timeFromDashboard = params.get('time');
    const startDateFromDashboard = params.get('startDate');
    const endDateFromDashboard = params.get('endDate');
    const accountNameFromDashboard = params.get('accountName');
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
    if (userdetails?.role === "Revenue_Partner" || userdetails?.role === "Network_Partner") {
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
        "category",
        "to",
        "filteration",
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
        "cpm",
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
        "adid",
        "accountNumber",
        "history"
    ];

    const storedData = localStorage.getItem("storedData") && localStorage.getItem("storedData") !== "undefined" && localStorage.getItem("storedData") !== "null" ? JSON.parse(localStorage.getItem("storedData")) : null;
    console.log(storedData, "storedData");

    const defaultDates = [dayjs((startDateFromDashboard ? startDateFromDashboard : (storedData ? storedData?.startDate : yesterday))), dayjs((endDateFromDashboard ? endDateFromDashboard : (storedData ? storedData?.endDate : yesterday)))];

    const [refreshContent, setRefreshContent] = useState("");

    const [initialRowData, setInitialRowData] = useState([]);

    const [rowData, setRowData] = useState([]);

    const [campaignData, setCampaignData] = useState([]);

    const [dailyData, setdailyData] = useState([]);

    const [keywordData, setKeywordData] = useState([]);

    const [system1KeywordData, setSystem1KeywordData] = useState([]);

    const [startDate, setStartDate] = useState(startDateFromDashboard ? startDateFromDashboard : (storedData ? storedData?.startDate : (yesterday)));

    const [newStartDate, setNewStartDate] = useState(startDateFromDashboard ? startDateFromDashboard : (storedData ? storedData?.startDate : (yesterday)));

    const [endDate, setEndDate] = useState(endDateFromDashboard ? endDateFromDashboard : (storedData ? storedData?.endDate : (yesterday)));

    const [newendDate, setNewEndDate] = useState(endDateFromDashboard ? endDateFromDashboard : (storedData ? storedData?.endDate : (yesterday)));

    const [revenuePratner, setRevenuePartner] = useState(networkFromDashboard ? networkFromDashboard : (storedData ? storedData?.revenuePratner : (networks[0])));

    const [newRevenuePratner, setNewRevenuePartner] = useState(networkFromDashboard ? networkFromDashboard : (storedData ? storedData?.revenuePratner : (networks[0])));

    const [isSearching, setIsSearching] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputBuffer = useRef(''); // holds interim value
    const backspaceTimer = useRef(null);
    const [newInputValue, setNewInputValue] = useState(inputValue);

    const [refrst, setRefrst] = useState(false);
    const [activeTab, setActiveTab] = useState(localStorage.getItem("activeTab") && localStorage.getItem("activeTab") !== "undefined" && localStorage.getItem("activeTab") !== "null" ? localStorage.getItem("activeTab") : "1");

    const [columnStructureStatus, setColumnStructureStatus] = useState(false);
    const [commentsStatus, setCommentsStatus] = useState(false);
    const [campaignsStatus, setCampaignsStatus] = useState(false);
    const [moveForward, setMoveForward] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [allCampaignsStatus, setAllCampaignsStatus] = useState(false);

    const [colDefs, setColDefs] = useState([]);
    const [colDailyDefs, setColDailyDefs] = useState([]);

    const [checked, setChecked] = useState(false);

    const [allProfitLossArray, setAllProfitLossArray] = useState([]);
    const [Camapignlevelstatus, setCamapignlevelstatus] = useState([]);
    const [mainData, setColumnStructure] = useState([]);
    const mainDataRef = useRef(mainData);

    //Active pause
    const [campaignStatusFilter, setCampaignStatusFilter] = useState('ALL');

    const [accountChanged, setAccountChanged] = useState(false);
    const [dateChanged, setDateChanged] = useState(false);
    const [timezoneChanged, setTimezoneChanged] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [campaignComments, setCampaignComments] = useState([]);
    const [networksWithStatus, setNetworksWithStatus] = useState([]);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedCampaignIdForHistory, setSelectedCampaignIdForHistory] = useState(null);
    const [selectedAccountForHistory, setSelectedAccountForHistory] = useState(null);



    useEffect(() => {
        const fetchNetworksData = async () => {
            try {
                const res = await axios.get('https://prodapis.adsgoat.in/get/networksData/', {
                    headers: {
                        Authorization: token,

                    }
                });
                setNetworksWithStatus(res.data);
            } catch (error) {
                console.error('Error fetching networksData:', error);
            }
        };
        fetchNetworksData();
    }, []);


    const handleStatusFilterChange = (key) => {
        if (key === 'active') {
            setCampaignStatusFilter('ACTIVE');
        } else if (key === 'pause') {
            setCampaignStatusFilter('PAUSED');
        } else if (key === 'all') {
            setCampaignStatusFilter('ALL');
        }
    };

    const campaignStatusLabel = useMemo(() => {
        switch ((campaignStatusFilter || 'ALL').toUpperCase()) {
            case 'ACTIVE':
                return 'Active';
            case 'PAUSED':
                return 'Paused';
            default:
                return 'All';
        }
    }, [campaignStatusFilter]);

    const handleChangeToggle = () => {
        setChecked((prev) => !prev);
    };


    const handleBlur = () => {
        if (inputValue.trim() === '') {
            setIsSearching(false);
        }
    };

    // const handleChangeInput = (e) => {
    //     // setInputValue(newInputValue.trim());
    //     setInputValue(e.target.value);
    //     // gridRef.current.api.onFilterChanged(); // Trigger AG-Grid to reapply filters
    // };

    const handleChangeInput = (e) => {
        const value = e?.target?.value ?? '';

        const isBackspace = e.nativeEvent.inputType === 'deleteContentBackward';

        if (isBackspace) {
            inputBuffer.current = value;

            // Clear existing timer
            if (backspaceTimer.current) {
                clearTimeout(backspaceTimer.current);
            }

            // Delay updating the actual state
            backspaceTimer.current = setTimeout(() => {
                setInputValue(inputBuffer.current);
            }, 200); // delay after last backspace
        } else {
            // For all other keys — llupdate instantly
            setInputValue(value);
        }
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

    const [account, setAccount] = useState((accountNumberFromDashboard ? [String(accountNumberFromDashboard)] : (storedData?.account ? storedData?.account : [String(accountsForAccess[0].accountNumber)])));

    const [time, setTime] = useState(
        timeFromDashboard
            ? timeFromDashboard
            : storedData
                ? storedData?.time
                : NetworkDefaultTimezones[revenuePratner] || "UTC"
    );
    const [newaccount, setNewAccount] = useState((accountNumberFromDashboard ? [String(accountNumberFromDashboard)] : (storedData?.account ? storedData?.account : [String(accountsForAccess[0].accountNumber)])));


    console.log(newaccount)

    const [accountName, setAccountName] = useState(accountNameFromDashboard ? accountNameFromDashboard?.replace(/\+/g, " ") : (storedData ? storedData?.accountName : (accountsForAccess[0]?.accountName)));

    const [newAccountName, setnewAccountName] = useState(accountNameFromDashboard ? accountNameFromDashboard : (storedData ? storedData?.accountName : (accountsForAccess[0]?.accountName)));
    console.log(newAccountName);
    const [newtime, setNewTime] = useState(
        timeFromDashboard
            ? timeFromDashboard
            : storedData
                ? storedData?.time
                : NetworkDefaultTimezones[revenuePratner] || "UTC"
    );
    const [pageSize, setPageSize] = useState(1);

    const hasFetched = useRef(false);

    const carouselRef = useRef();

    // top of component
    const campaignStatusOverridesRef = useRef(new Map());
    // NEW for adset level:
    const adsetStatusOverridesRef = useRef(new Map()); // key -> "ACTIVE"/"PAUSED"
    const adsetPinOverridesRef = useRef(new Map()); // key -> boolean
    const adsetCommentOverridesRef = useRef(new Map()); // 

    // top-level (same place you created the other refs)
    const adStatusOverridesRef = React.useRef(new Map());  // "ACTIVE" | "PAUSED"
    const adPinOverridesRef = React.useRef(new Map());  // boolean
    const adCommentOverridesRef = React.useRef(new Map());  // { text, editedBy, editedAt }


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

    const [allCampaignData, setAllCampaignData] = useState([]);




    console.log('All campaignData:', allCampaignData);
    const [campaignRefreshTrigger, setCampaignRefreshTrigger] = useState(0);
    const [hovered, setHovered] = useState(false);
    const [Rhovered, setRHovered] = useState(false);

    const deriveInitial = (dash, stored, nets) => {
        const fromDash = dash?.replace(/\+/g, " ").trim();
        if (fromDash) return fromDash;

        const fromStore = stored?.account?.toString().trim();
        if (fromStore) return fromStore;

        const first = Array.isArray(nets) && nets.length
            ? (typeof nets[0] === "string" ? nets[0] : nets[0]?.accountNumber)
            : "";
        return first ? String(first) : dash ? [dash] : stored?.account ? fromStore : [];
    };

    const initialOne = deriveInitial(accountNumberFromDashboard, storedData, networksData);


    console.log(initialOne, "initialData");

    // track if the user already changed selection
    const userPickedRef = useRef(false);

    // initial selection
    const [selectedValue, setSelectedValue] = useState(
        Array.isArray(initialOne) ? initialOne.map(String) : []
    );



    // console.log("multiple accounts:", selectedValue);

    // const initialOne =
    //     accountNumberFromDashboard
    //         ? accountNumberFromDashboard.replace(/\+/g, " ")
    //         : (storedData
    //             ? storedData.account
    //             : (typeof networksData[0] === "string"
    //                 ? networksData[0]
    //                 : networksData[0].accountNumber));

    // const [selectedValue, setSelectedValue] = useState([String(initialOne)]); // now an array
    // console.log("multiple accounts:", selectedValue);

    // useEffect(() => {
    //     const fetchAllCampaigns = async () => {
    //         try {
    //             const res = await apiClient.get(`/get/AllCampaignsWithAdsets?accountNumber=${newaccount}`);
    //             const enrichedAdsetRows = res.data.flatMap(campaign =>
    //                 (campaign.adsets || []).map(adset => ({
    //                     ...adset,
    //                     campaignid: campaign.campaign_id,
    //                     campaignname: campaign.name,
    //                     accountNumber: campaign.accountNumber,
    //                     revenuePartner: campaign.revenuePartner,
    //                     campaign_budget: campaign.campaign_budget,
    //                     campaign_status: campaign.status,
    //                     start: campaign.start,
    //                     end: campaign.end
    //                 }))
    //             );
    //             setAllCampaignData(enrichedAdsetRows);
    //         } catch (err) {
    //             console.error("Failed to fetch all campaigns", err);
    //         }
    //     };

    //     fetchAllCampaigns();
    // }, [newaccount]);

    // useEffect(() => {
    //         if (allCampaignData.length > 0) {
    //             setColumnDefs(getColumnDefs(mainData.columnStructure));
    //         columnDefs1.current = getColumnDefs2(mainData.columnStructure);
    //         columnDefs2.current = getColumnDefs2(mainData.columnStructure);
    //         // columnDefs3.current = getColumnDefs3(mainData.columnStructure);
    //         // columnDefs4.current = getColumnDefs4(mainData.columnStructure);
    //         columnDefsAdsetLevel.current = (getColumnDefsAdsetLevel(mainData.columnStructure));
    //         // columnDefsAdLevel.current = (getColumnDefsAdLevel([...(newRevenuePratner === "FB_TonicRsoc" ? ["keyword"] : []), ...(mainData.columnStructure)]));
    //         columnDefsAdsetLevelDaily.current = (getColumnDefsAdsetLevelDaily(mainData.columnStructure));
    //         // columnDefsAdLevelDaily.current = (getColumnDefsAdLevelDaily([...(newRevenuePratner === "FB_TonicRsoc" ? ["keyword"] : []), ...(mainData.columnStructure)]));
    //         // Ensure that 'adid' is included in the column structure
    //         // let updatedColumnStructure = mainData.columnStructure;
    //         // if (!updatedColumnStructure.includes('adid')) {
    //         //     updatedColumnStructure = [...updatedColumnStructure, 'adid'];
    //         // }
    //         // if (!updatedColumnStructure.includes('adname')) {
    //         //     updatedColumnStructure = [...updatedColumnStructure, 'adname'];
    //         // }
    //         // // Now update the colDefs for the adid grid
    //         // const newColumnDefs = getColumnDefsObjectOfAdID(updatedColumnStructure);
    //         // const newColumnDailyDefs = getColumnDefsObjectOfDailyAdID(updatedColumnStructure);
    //         // setColDefs(newColumnDefs);
    //         // setColDailyDefs(newColumnDailyDefs);
    //         //   console.log('Updated columnDefsOfAdID:', newColumnDefs);
    //         setColumnStructureStatus(true);
    //     }
    // }, [allCampaignData, mainData]);

    // useEffect(() => {
    //     const fetchAllCampaigns = async () => {
    //         try {
    //             const body = { accountNumbers: (selectedValue || []).map(String) };

    //             const res = await apiClient.post('/get/BulkAllCampaignsWithAdsets', body);
    //             const data = res.data || [];

    //             // Map EXACTLY to your DB shape:
    //             const enrichedAdsetRows = data.flatMap((campaign) =>
    //                 (campaign.adsets || []).map((adset) => ({
    //                     // keep adset info
    //                     adset_id: String(adset.adset_id),
    //                     adsetname: adset.name,
    //                     adset_budget: adset.budget,   // { daily_budget, lifetime_budget }
    //                     adset_status: adset.status,
    //                     bid_amount: adset.bid_amount,

    //                     // attach campaign-level info for this adset row
    //                     campaignid: String(campaign.campaign_id),
    //                     campaignname: campaign.name,
    //                     campaign_status: campaign.status,
    //                     campaign_budget: campaign.campaign_budget, // { daily_budget, lifetime_budget }
    //                     accountNumber: String(campaign.accountNumber),
    //                     revenuePartner: campaign.revenuePartner,
    //                     start: campaign.start,
    //                     end: campaign.end,
    //                 }))
    //             );

    //             setAllCampaignData(enrichedAdsetRows);
    //         } catch (err) {
    //             console.error('Failed to fetch all campaigns', err);
    //             setAllCampaignData([]);
    //         }
    //     };

    //     if (selectedValue?.length) fetchAllCampaigns();
    // }, [JSON.stringify(selectedValue)]);

    // useEffect(() => {
    //     if (campaignRefreshTrigger === 0) return;
    //     const fetchUpdatedCampaign = async () => {
    //         try {
    //             const res = await apiClient.get(`https://prodapis.adsgoat.in/get/AllCampaignsWithAdsets?accountNumber=${newaccount}`);
    //             const enrichedAdsetRows = res.data.flatMap(campaign =>
    //                 (campaign.adsets || []).map(adset => ({
    //                     ...adset,
    //                     campaignid: campaign.campaign_id,
    //                     campaignname: campaign.name,
    //                     accountNumber: campaign.accountNumber,
    //                     revenuePartner: campaign.revenuePartner,
    //                     campaign_budget: campaign.campaign_budget,
    //                     campaign_status: campaign.status,
    //                     start: campaign.start,
    //                     end: campaign.end
    //                 }))
    //             );
    //             setAllCampaignData(enrichedAdsetRows);
    //         } catch (err) {
    //             console.error("Failed to refetch updated campaigns", err);
    //         }
    //     };
    //     fetchUpdatedCampaign();
    // }, [campaignRefreshTrigger]);

    // campaignRefreshTrigger-based refetch (multi-account)
    // useEffect(() => {
    //     if (campaignRefreshTrigger === 0) return;

    //     const fetchUpdatedCampaign = async () => {
    //         try {
    //             const accounts = Array.isArray(selectedValue)
    //                 ? selectedValue.map(String)
    //                 : [String(selectedValue)];

    //             const res = await apiClient.post('/get/BulkAllCampaignsWithAdsets', {
    //                 accountNumbers: accounts,
    //             });

    //             const data = res.data || [];

    //             const enrichedAdsetRows = data.flatMap((campaign) =>
    //                 (campaign.adsets || []).map((adset) => ({
    //                     // adset fields
    //                     adset_id: String(adset.adset_id),
    //                     adsetname: adset.name,
    //                     adset_budget: adset.budget,     // { daily_budget, lifetime_budget }
    //                     adset_status: adset.status,
    //                     bid_amount: adset.bid_amount,

    //                     // campaign fields
    //                     campaignid: String(campaign.campaign_id),
    //                     campaignname: campaign.name,    // matches your DB
    //                     accountNumber: String(campaign.accountNumber),
    //                     revenuePartner: campaign.revenuePartner,
    //                     campaign_budget: campaign.campaign_budget, // { daily_budget, lifetime_budget }
    //                     campaign_status: campaign.status,
    //                     start: campaign.start,
    //                     end: campaign.end,
    //                 }))
    //             );

    //             setAllCampaignData(enrichedAdsetRows);
    //         } catch (err) {
    //             console.error('Failed to refetch updated campaigns', err);
    //         }
    //     };

    //     fetchUpdatedCampaign();
    //     // If you want the refresh to always use the *latest* selection, add selectedValue too:
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [campaignRefreshTrigger]);


    const showModal = () => {
        setIsModalOpen(true);
    };

    const changeRRefrst = () => {
        setRefrst((prev) => !prev);
    };


    // useEffect(() => {
    //     const stored = JSON.parse(localStorage.getItem("selectedAccounts") || "[]");
    //     if (stored.length > 0) {
    //         setSelectedValue(stored);
    //     }
    // }, []);


    // useEffect(() => {
    //     localStorage.setItem("selectedAccounts", JSON.stringify(selectedValue));
    // }, [selectedValue]);




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
            headerTooltip: formula,
        };

        setColumnDefs((prevDefs) => [...prevDefs, newColumnDef]);
        setColDefs((prevDefs) => [...prevDefs, newColumnDef]);
        setColDailyDefs((prevDefs) => [...prevDefs, newColumnDef]);
        columnDefs1.current = [...columnDefs1.current, newColumnDef];
        columnDefs2.current = [...columnDefs2.current, newColumnDef];
        columnDefs3.current = [...columnDefs3.current, newColumnDef];
        columnDefsAdsetLevel.current = [...columnDefsAdsetLevel.current, newColumnDef]
        columnDefsAdsetLevelDaily.current = [...columnDefsAdsetLevelDaily.current, newColumnDef]
        columnDefsAdLevelDaily.current = [...columnDefsAdLevelDaily.current, newColumnDef]
        columnDefsAdLevel.current = [...columnDefsAdLevel.current, newColumnDef]

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

    const getCpm = (params) => {
        if (params.data !== undefined) {
            const { impressions, spend } = params.data;

            if (impressions !== 0) {
                const CPL = (spend / impressions) * 1000;
                if (CPL === Infinity) {
                    return 0;
                }
                return Number(CPL.toFixed(2));

            }
        }
        if (params.node.aggData !== undefined) {
            const { impressions, spend } = params.node.aggData;
            if (impressions !== 0) {
                const CPL = (spend / impressions) * 1000;
                if (CPL === Infinity) {
                    return 0;
                }
                return Number(CPL.toFixed(2));
            }
        }

        return 0;
    };

    const getFilteration = (params) => {

        if (params.data !== undefined) {
            const { fbleads, conversions } = params.data;
            if (fbleads !== 0) {
                const RPC = ((parseInt(fbleads) - parseInt(conversions)) / parseInt(fbleads)) * 100;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return `${Number(RPC.toFixed(2))}`;

            }
        }
        if (params.node.aggData !== undefined) {
            const { fbleads, conversions } = params.node.aggData;
            if (fbleads !== 0) {
                const RPC = ((parseInt(fbleads) - parseInt(conversions)) / parseInt(fbleads)) * 100;
                return `${Number(RPC.toFixed(2))}`;
            }
        }

        return 0;
    }

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
            return Number((((revenue1 - spend) / revenue) * 100).toFixed(2));
        }
        return 0;
    };

    // ✅ Compute ROI for Individual Child Rows
    const computeROI = (data) => {
        const revenue = sanitizeNumericValue(data.revenue);
        const spend = sanitizeNumericValue(data.spend);

        if (spend > 0) {
            return Number((((revenue - spend) / spend) * 100).toFixed(2));
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
            return Number((((totalRevenue1 - totalSpend) / totalRevenue) * 100).toFixed(2));
        }
        return 0;
    };

    // ✅ Compute Aggregated ROI for Grouped Rows
    const computeAggregatedROI = (params) => {
        const totalSpend = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.spend), 0);
        const totalRevenue = params.rowNode.allLeafChildren.reduce((acc, child) => acc + sanitizeNumericValue(child.data.revenue), 0);

        if (totalSpend > 0) {
            return Number((((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(2));
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
                } else {
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

    // const isYesterday = () => {
    //     const startDate1 = moment(startDate); // Convert to moment object
    //     const endDate1 = moment(endDate);     // Convert to moment object

    //     // Define "yesterday" as a reference
    //     const yesterday1 = moment().subtract(1, 'days');
    //     return startDate1.isSame(yesterday1, 'day') && endDate1.isSame(yesterday1, 'day');
    // };

    const isYesterday = () => {
        const startDate1 = moment(startDate); // Convert to moment object
        const endDate1 = moment(endDate);     // Convert to moment object

        const today = moment();
        const yesterday = moment().subtract(1, 'days');

        const isToday = startDate1.isSame(today, 'day') && endDate1.isSame(today, 'day');
        const isYesterday = startDate1.isSame(yesterday, 'day') && endDate1.isSame(yesterday, 'day');

        return isToday || isYesterday;
    };

    // const campaignMap = useMemo(() => {
    //     const map = new Map();
    //     Camapignlevelstatus.forEach((item) => {
    //       map.set(item.name, item.start);
    //     });
    //     return map;
    // }, [Camapignlevelstatus]);

    // const campaignMap = useMemo(() => {
    //     const map = new Map();
    //     Camapignlevelstatus.forEach((item) => {
    //         map.set(item.name, {
    //             start: item.start,
    //             end: item.end
    //         });
    //     });
    //     return map;
    // }, [Camapignlevelstatus]);
    const campaignMap = useMemo(() => {
        const map = new Map();
        Camapignlevelstatus.forEach((item) => {
            const key = `${item.name}_${item.campaign_id}`; // 👈 combine both
            map.set(key, {
                start: item.start,
                end: item.end
            });
        });
        return map;
    }, [Camapignlevelstatus]);
    const commentsMap = useMemo(() => {
        const map = new Map();
        campaignComments.forEach((item) => {
            const key = `${item.campaignid}_${item.Account}_${item.level}`; // unique combo
            map.set(key, {
                category: item.category
            });
        });
        return map;
    }, [campaignComments]);
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
        cpm: {
            headerName: 'CPM',
            field: 'cpm',
            sortable: true,
            minWidth: 90,
            headerTooltip: '(Spend/Impressions)*1000', filter: true,
            valueGetter: getCpm,
            hide: false,
            suppressMenu: true,
            filter: "agNumberColumnFilter",
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        filteration: {
            headerName: "Filteration",
            field: 'filteration',
            sortable: true,
            sort: true,
            width: 115,
            valueGetter: getFilteration,
            filter: "agNumberColumnFilter",
            valueFormatter: params => `${params.value || 0}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            hide: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
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
        // from:{
        //     headerName: 'Start',
        //     field: 'from',
        //     valueGetter: (params) => {
        //       if (params.node.group) {
        //         const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
        //         const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
        //         // const {  start } = campaignStatus;
        //         // console.log(params.node.groupData?.campaignname, "groupData");
        //         // console.log(params.node.key, "start");
        //         return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
        //       }
        //       return '';
        //     },
        //     cellClassRules: {
        //       'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     minWidth: 110,
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        // },
        category: {
            headerName: 'Category',
            field: 'category',
            minWidth: 110,
            sortable: true,
            filter: "agTextColumnFilter",

            // ✅ Helper: Capitalize the first letter only
            valueFormatter: (params) => {
                if (!params.value) return '';
                return params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase();
            },

            // ✅ Show category for both grouped and normal rows
            valueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ For normal (leaf) rows
                return capitalize(params.data?.category);
            },

            // ✅ Filter uses same logic as valueGetter
            filterValueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ Include leaf rows in filtering
                return capitalize(params.data?.category);
            },

            // ✅ Dynamic filter list (from both grouped + leaf rows)
            filterParams: {
                values: (params) => {
                    const uniqueCategories = new Set();

                    params.api.forEachNode((node) => {
                        const capitalize = (val) =>
                            val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                        if (node.group) {
                            const firstChild = node.allLeafChildren?.[0];
                            const account = firstChild?.data?.accountNumber;
                            const campaignName = firstChild?.data?.campaignid;
                            const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                            const category = capitalize(campaign?.category);
                            if (category) uniqueCategories.add(category);
                        } else {
                            const category = capitalize(node.data?.category);
                            if (category) uniqueCategories.add(category);
                        }
                    });

                    // params.success(Array.from(uniqueCategories));
                    params.success && params.success(Array.from(uniqueCategories));
                },
            },

            // ✅ Safe comparator for sorting (group-aware)
            comparator: (valueA, valueB, nodeA, nodeB) => {
                const isGroupA = nodeA?.group;
                const isGroupB = nodeB?.group;
                if (isGroupA && isGroupB) {
                    return valueA?.localeCompare?.(valueB) ?? 0;
                }
                // sort normally for leaf nodes
                return valueA?.localeCompare?.(valueB) ?? 0;
            },

            // ✅ Optional — hide empty leaf cells (if any)
            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group && !params.value,
            },
            // cellRenderer: (props) => {
            //     if (props.node.rowPinned || props.node.footer) return "";
            //     if (props.value) return props.value;

            //     const [open, setOpen] = useState(false);
            //     const [category, setCategory] = useState("");

            //     const [row, setRow] = useState(null);


            //     const getRow = () => {
            //         return props.node.group
            //             ? props.node.allLeafChildren?.[0]?.data
            //             : props.node.data;
            //     };

            //     const onEdit = () => {
            //         const r = getRow();
            //         setRow(r);
            //         setCategory(r?.category || "");
            //         setOpen(true);
            //     };

            //     const save = async () => {
            //         if (!row) return;

            //         const payload = {
            //             accountNumber: row.accountNumber,
            //             campaignid: row.campaignid,
            //             level: "campaign",
            //             category,
            //         };

            //         try {
            //             const token = localStorage.getItem("token");

            //             await apiClient.post(
            //                 "/UpdateCategoryNew",
            //                 payload,
            //                 { headers: { Authorization: token } }
            //             );

            //             setCampaignComments((prev) => {
            //                 const arr = [...prev];
            //                 const idx = arr.findIndex(
            //                     (i) =>
            //                         i.campaignid == payload.campaignid &&
            //                         i.Account == payload.accountNumber &&
            //                         i.level == "campaign"
            //                 );
            //                 if (idx >= 0) {
            //                     arr[idx].category = payload.category;
            //                 } else {
            //                     arr.push({
            //                         campaignid: payload.campaignid,
            //                         Account: payload.accountNumber,
            //                         level: "campaign",
            //                         category: payload.category,
            //                     });
            //                 }
            //                 return arr;
            //             });


            //             const key = `${payload.campaignid}_${payload.accountNumber}_campaign`;
            //             commentsMap.set(key, { category: payload.category });
            //             message.success("Category updated");
            //         } catch (err) {
            //             console.error(err);
            //             message.error("Failed to update category");

            //         }

            //         setOpen(false);
            //     };

            //     return (
            //         <div>
            //             <span
            //                 onClick={onEdit}
            //                 style={{ cursor: "pointer", }}
            //             >
            //                 <PlusOutlined />
            //             </span>

            //             <Modal className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`} open={open} title="Edit Category" onOk={save} onCancel={() => setOpen(false)}>
            //                 <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            //             </Modal>
            //         </div>
            //     );
            // },
            cellRenderer: (props) => {
                if (props.node.rowPinned || props.node.footer) return null;

                const [editing, setEditing] = React.useState(false);
                const [value, setValue] = React.useState(props.value || "");

                const [open, setOpen] = React.useState(false);
                const [category, setCategory] = React.useState("");

                const getRow = () =>
                    props.node.group
                        ? props.node.allLeafChildren?.[0]?.data
                        : props.node.data;

                const openModal = () => {
                    const row = getRow();
                    if (!row) return;
                    setCategory(row.category || "");
                    setOpen(true);
                };

                const saveFromModal = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, category);
                    setOpen(false);
                };


                const saveInline = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, value);
                    setEditing(false);
                };


                const saveApi = async (row, catValue) => {
                    const payloadForActivity = {
                        editType: "Categoty",
                        campaignid: row.campaignid,       // cents
                        Account: row.accountNumber,    // ✅ update *this* row’s account
                        campaignname: row.campaignname,
                        updatedBy: userdetails?.userName || "Unknown",
                        updatedUserEmail: userdetails.email,
                        updateType: row.category ? "Campain category updated" : "Campain category created",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: row.category ? `From ${row.category || "N/A"} to ${catValue}` : `Category added as ${catValue}`,
                    }
                    const payload = {
                        accountNumber: row.accountNumber,
                        campaignid: row.campaignid,
                        level: "campaign",
                        category: catValue,
                        activity: payloadForActivity,
                    };

                    const token = localStorage.getItem("token");

                    await apiClient.post(
                        "/UpdateCategoryAndStoreHistory",
                        payload,
                        { headers: { Authorization: token } }
                    );

                    setCampaignComments((prev) => {
                        const arr = [...prev];
                        const idx = arr.findIndex(
                            i =>
                                String(i.campaignid) === String(payload.campaignid) &&
                                String(i.Account) === String(payload.accountNumber) &&
                                i.level === "campaign"
                        );

                        if (idx >= 0) arr[idx].category = catValue;
                        else arr.push({
                            campaignid: payload.campaignid,
                            Account: payload.accountNumber,
                            level: "campaign",
                            category: catValue,
                        });

                        return arr;
                    });

                    commentsMap.set(
                        `${payload.campaignid}_${payload.accountNumber}_campaign`,
                        { category: catValue }
                    );

                    message.success("Category updated");
                };


                if (props.value && !editing) {
                    return (
                        // <span
                        //     onClick={() => setEditing(true)}
                        //     style={{ cursor: "pointer" }}
                        // >
                        //     {props.value}
                        // </span>
                        <Tooltip title={props.value}
                            overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                // fontWeight: 500,
                            }}>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing(true);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {props.value}
                            </span>
                        </Tooltip>
                    );
                }

                if (props.value && editing) {
                    return (
                        <Input
                            autoFocus
                            size="small"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onPressEnter={saveInline}
                            onBlur={saveInline}
                        />
                    );
                }

                return (
                    <>
                        <PlusOutlined
                            // onClick={openModal}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal();
                            }}
                            style={{ cursor: "pointer" }}
                        />

                        <Modal
                            open={open}
                            title="Edit Category"
                            onOk={saveFromModal}
                            onCancel={() => setOpen(false)}
                        >
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Modal>
                    </>
                );
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        }
        ,
        // from: {
        //     headerName: 'Start',
        //     field: 'from',
        //     sortable: true,
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //         // if (params.node.group) {
        //         //     const campaignName =
        //         //         params.node.groupData?.campaignname || params.node.key;
        //         //     const campaign = campaignMap.get(campaignName);
        //         //     return campaign && campaign.start
        //         //         ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //         //         : '-';
        //         // }
        //         // return '';
        //         if (params.node.group) {
        //             const campaignName =
        //                 params.node.groupData?.campaignname || params.node.key;
        //             const campaign = campaignMap.get(campaignName);

        //             return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //         }
        //         return params.data?.from || null;
        //     },
        //     valueFormatter: (params) => {
        //         return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        // to: {
        //     headerName: 'End',
        //     field: 'to',
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //         if (params.node.group) {
        //             const campaignName =
        //                 params.node.groupData?.campaignname || params.node.key;
        //             const campaign = campaignMap.get(campaignName);
        //             return campaign && campaign.end
        //                 ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //                 : '-';
        //         }
        //         return params.data?.to || null;
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        from: {
            headerName: 'Start',
            field: 'from',
            sortable: true,
            minWidth: 110,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.start || null;
                } else {
                    dateStr = params.data?.from || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        to: {
            headerName: 'End',
            field: 'to',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue already Date from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.end || null;
                } else {
                    dateStr = params.data?.to || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        profitloss: {
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
            filter: "agNumberColumnFilter",
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
                        return ""; // Return empty string to remove "...
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
                        if (getCampaignActualSpend.status === 200) {
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
                                okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }}
                                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{ backgroundColor: campaignStatus && "#91C25F" }} onChange={onChangeCampaignStatus} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{ fontWeight: 'normal' }}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget) / 100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget) / 100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ color: theme === "dark" && "white" }}>Campaign ID:</Typography.Text>
                                        <p>{campaignActualSpend?.id}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
        },
        // date: {
        //     headerName: 'Date',
        //     field: 'date',
        //     minWidth: 110,
        //     sortable: true,
        //     sort: "asc",
        //     filter: "agDateColumnFilter",
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             const dateAsString = cellValue;
        //             if (dateAsString == null) return -1;
        //             const dateParts = dateAsString.split("/");
        //             const cellDate = new Date(
        //                 Number(dateParts[2]),
        //                 Number(dateParts[1]) - 1,
        //                 Number(dateParts[0])
        //             );

        //             if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        //                 return 0;
        //             }

        //             if (cellDate < filterLocalDateAtMidnight) {
        //                 return -1;
        //             }

        //             if (cellDate > filterLocalDateAtMidnight) {
        //                 return 1;
        //             }
        //             return 0;
        //         },
        //     },
        // },
        date: {
            headerName: 'Date',
            field: 'date',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            // 🔥 Convert raw YYYY-MM-DD → real Date object
            valueGetter: (params) => {
                const dateStr = params.data?.date;
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            // 🔥 Display format only
            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
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
            filter: "agNumberColumnFilter", // Keep filter active
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
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0,
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
            valueGetter: getCpcLc,
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
            headerTooltip: 'fblinkclicks',
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
        history: {
            headerName: 'Activity',
            field: 'history',
            minWidth: 90,
            hide: true,
            sortable: false,
            filter: false,
            enableSorting: false,
            enableFilter: false,
            suppressMenu: true,
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignActualSpend, setCampaignActualSpend] = useState({});
                const [hasBudget, setHasBudget] = useState(false);
                const [confirmLoading, setConfirmLoading] = useState(false);

                const isGroupRow = !!params?.node?.groupData;

                // campaign id + campaign name for this row/group
                const campaignId = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.campaignid
                    : params?.data?.campaignid;

                const campaignname = isGroupRow
                    ? params?.node?.key
                    : params?.data?.campaignname;

                // ✅ the *accountNumber of this row/group* (not the selected accounts list)
                const rowAccountNumber = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.accountNumber
                    : params?.data?.accountNumber;

                // const { allCampaignData } = params.context;

                // ✅ find the exact record for (campaignId, rowAccountNumber)
                useEffect(() => {
                    if (!campaignId || !rowAccountNumber || !Array.isArray(Camapignlevelstatus)) return;

                    const matched = Camapignlevelstatus.find(
                        c =>
                            String(c.campaign_id) === String(campaignId) &&
                            String(c.accountNumber) === String(rowAccountNumber)
                    );

                    setCampaignActualSpend(matched ?? {});
                    setHasBudget(
                        !!(
                            matched?.campaign_budget &&
                            (matched.campaign_budget.daily_budget != null ||
                                matched.campaign_budget.lifetime_budget != null)
                        )
                    );
                }, [campaignId, rowAccountNumber, Camapignlevelstatus?.length]);

                const onChangeSpendAndStatus = () => {
                    if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return;

                    const grouped = (params.node?.allLeafChildren || []).map(n => n.data);
                    setGroupedData(grouped.length ? grouped : (params.data ? [params.data] : []));

                    if (!campaignId || !campaignname) {
                        message.error("Campaign info missing");
                        return;
                    }

                    // Prefill from the matched record for *this* account
                    const b = campaignActualSpend?.campaign_budget;
                    const budgetCents = b?.daily_budget ?? b?.lifetime_budget ?? null;
                    onChangeBudget(budgetCents != null ? Number(budgetCents) / 100 : undefined);

                    setIsModalVisible(true);
                };

                if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return null;

                return (
                    <div>
                        <HistoryOutlined />
                    </div>
                );
            },
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
        cpm: {
            headerName: 'CPM',
            field: 'cpm',
            sortable: true,
            minWidth: 90,
            headerTooltip: '(Spend/Impressions)*1000', filter: true,
            valueGetter: getCpm,
            hide: false,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        filteration: {
            headerName: "Filteration",
            field: 'filteration',
            width: 115,
            sortable: true,
            sort: true,
            valueGetter: getFilteration,
            filter: "agNumberColumnFilter",
            valueFormatter: params => `${params.value || 0}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            hide: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
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
                        if (getCampaignActualSpend.status === 200) {
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
                                okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }}
                                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{ backgroundColor: campaignStatus && "#91C25F" }} onChange={onChangeCampaignStatus} />
                                    </div>

                                    {/* Input Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{ fontWeight: 'normal' }}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget) / 100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget) / 100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>

                                    {/* Campaign ID */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ color: theme === "dark" && "white" }}>Campaign ID:</Typography.Text>
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
        // from:{
        //     headerName: 'Start',
        //     field: 'from',
        //     valueGetter: (params) => {
        //       if (params.node.group) {
        //         const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
        //         const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
        //         // const {  start } = campaignStatus;
        //         // console.log(params.node.groupData?.campaignname, "groupData");
        //         // console.log(params.node.key, "start");
        //         return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
        //       }
        //       return '';
        //     },
        //     cellClassRules: {
        //       'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     minWidth: 110,
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        // },
        category: {
            headerName: 'Category',
            field: 'category',
            minWidth: 110,
            sortable: true,
            filter: "agTextColumnFilter",

            // ✅ Helper: Capitalize the first letter only
            valueFormatter: (params) => {
                if (!params.value) return '';
                return params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase();
            },

            // ✅ Show category for both grouped and normal rows
            valueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ For normal (leaf) rows
                return capitalize(params.data?.category);
            },

            // ✅ Filter uses same logic as valueGetter
            filterValueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ Include leaf rows in filtering
                return capitalize(params.data?.category);
            },

            // ✅ Dynamic filter list (from both grouped + leaf rows)
            filterParams: {
                values: (params) => {
                    const uniqueCategories = new Set();

                    params.api.forEachNode((node) => {
                        const capitalize = (val) =>
                            val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                        if (node.group) {
                            const firstChild = node.allLeafChildren?.[0];
                            const account = firstChild?.data?.accountNumber;
                            const campaignName = firstChild?.data?.campaignid;
                            const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                            const category = capitalize(campaign?.category);
                            if (category) uniqueCategories.add(category);
                        } else {
                            const category = capitalize(node.data?.category);
                            if (category) uniqueCategories.add(category);
                        }
                    });

                    // params.success(Array.from(uniqueCategories));
                    params.success && params.success(Array.from(uniqueCategories));
                },
            },

            // ✅ Safe comparator for sorting (group-aware)
            comparator: (valueA, valueB, nodeA, nodeB) => {
                const isGroupA = nodeA?.group;
                const isGroupB = nodeB?.group;
                if (isGroupA && isGroupB) {
                    return valueA?.localeCompare?.(valueB) ?? 0;
                }
                // sort normally for leaf nodes
                return valueA?.localeCompare?.(valueB) ?? 0;
            },

            // ✅ Optional — hide empty leaf cells (if any)

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group && !params.value,
            },
            // cellRenderer: (props) => {
            //     if (props.node.rowPinned || props.node.footer) return "";
            //     if (props.value) return props.value;

            //     const [open, setOpen] = useState(false);
            //     const [category, setCategory] = useState("");
            //     const [row, setRow] = useState(null);

            //     const getRow = () => {
            //         return props.node.group
            //             ? props.node.allLeafChildren?.[0]?.data
            //             : props.node.data;
            //     };

            //     const onEdit = () => {
            //         const r = getRow();
            //         setRow(r);
            //         setCategory(r?.category || "");
            //         setOpen(true);
            //     };

            //     const save = async () => {
            //         if (!row) return;

            //         const payload = {
            //             accountNumber: row.accountNumber,
            //             campaignid: row.campaignid,
            //             level: "campaign",
            //             category,
            //         };

            //         try {
            //             const token = localStorage.getItem("token");

            //             await apiClient.post(
            //                 "/UpdateCategoryNew",
            //                 payload,
            //                 { headers: { Authorization: token } }
            //             );

            //             setCampaignComments((prev) => {
            //                 const arr = [...prev];
            //                 const idx = arr.findIndex(
            //                     (i) =>
            //                         i.campaignid == payload.campaignid &&
            //                         i.Account == payload.accountNumber &&
            //                         i.level == "campaign"
            //                 );
            //                 if (idx >= 0) {
            //                     arr[idx].category = payload.category;
            //                 } else {
            //                     arr.push({
            //                         campaignid: payload.campaignid,
            //                         Account: payload.accountNumber,
            //                         level: "campaign",
            //                         category: payload.category,
            //                     });
            //                 }
            //                 return arr;
            //             });
            //             const key = `${payload.campaignid}_${payload.accountNumber}_campaign`;
            //             commentsMap.set(key, { category: payload.category });
            //             message.success("Category updated");
            //         } catch (err) {
            //             console.error(err);
            //             message.error("Failed to update category");

            //         }

            //         setOpen(false);
            //     };

            //     return (
            //         <div>
            //             <span
            //                 onClick={onEdit}
            //                 style={{ cursor: "pointer", }}
            //             >
            //                 <PlusOutlined />
            //             </span>

            //             <Modal className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`} open={open} title="Edit Category" onOk={save} onCancel={() => setOpen(false)}>
            //                 <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            //             </Modal>
            //         </div>
            //     );
            // },
            cellRenderer: (props) => {
                if (props.node.rowPinned || props.node.footer) return null;

                const [editing, setEditing] = React.useState(false);
                const [value, setValue] = React.useState(props.value || "");

                const [open, setOpen] = React.useState(false);
                const [category, setCategory] = React.useState("");

                const getRow = () =>
                    props.node.group
                        ? props.node.allLeafChildren?.[0]?.data
                        : props.node.data;

                const openModal = () => {
                    const row = getRow();
                    if (!row) return;
                    setCategory(row.category || "");
                    setOpen(true);
                };

                const saveFromModal = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, category);
                    setOpen(false);
                };


                const saveInline = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, value);
                    setEditing(false);
                };


                const saveApi = async (row, catValue) => {
                    const payloadForActivity = {
                        editType: "Categoty",
                        campaignid: row.campaignid,       // cents
                        Account: row.accountNumber,    // ✅ update *this* row’s account
                        campaignname: row.campaignname,
                        updatedBy: userdetails?.userName || "Unknown",
                        updatedUserEmail: userdetails.email,
                        updateType: row.category ? "Campain category updated" : "Campain category created",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: row.category ? `From ${row.category || "N/A"} to ${catValue}` : `Category added as ${catValue}`,
                    }
                    const payload = {
                        accountNumber: row.accountNumber,
                        campaignid: row.campaignid,
                        level: "campaign",
                        category: catValue,
                        activity: payloadForActivity,
                    };

                    const token = localStorage.getItem("token");

                    await apiClient.post(
                        "/UpdateCategoryAndStoreHistory",
                        payload,
                        { headers: { Authorization: token } }
                    );

                    setCampaignComments((prev) => {
                        const arr = [...prev];
                        const idx = arr.findIndex(
                            i =>
                                String(i.campaignid) === String(payload.campaignid) &&
                                String(i.Account) === String(payload.accountNumber) &&
                                i.level === "campaign"
                        );

                        if (idx >= 0) arr[idx].category = catValue;
                        else arr.push({
                            campaignid: payload.campaignid,
                            Account: payload.accountNumber,
                            level: "campaign",
                            category: catValue,
                        });

                        return arr;
                    });

                    commentsMap.set(
                        `${payload.campaignid}_${payload.accountNumber}_campaign`,
                        { category: catValue }
                    );

                    message.success("Category updated");
                };


                if (props.value && !editing) {
                    return (
                        // <span
                        //     onClick={() => setEditing(true)}
                        //     style={{ cursor: "pointer" }}
                        // >
                        //     {props.value}
                        // </span>
                        <Tooltip title={props.value}
                            overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                // fontWeight: 500,
                            }}>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing(true);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {props.value}
                            </span>
                        </Tooltip>
                    );
                }

                if (props.value && editing) {
                    return (
                        <Input
                            autoFocus
                            size="small"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onPressEnter={saveInline}
                            onBlur={saveInline}
                        />
                    );
                }

                return (
                    <>
                        <PlusOutlined
                            // onClick={openModal}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal();
                            }}
                            style={{ cursor: "pointer" }}
                        />

                        <Modal
                            open={open}
                            title="Edit Category"
                            onOk={saveFromModal}
                            onCancel={() => setOpen(false)}
                        >
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Modal>
                    </>
                );
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        // from: {
        //     headerName: 'Start',
        //     field: 'from',
        //     sortable: true,
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //         // if (params.node.group) {
        //         //     const campaignName =
        //         //         params.node.groupData?.campaignname || params.node.key;
        //         //     const campaign = campaignMap.get(campaignName);
        //         //     return campaign && campaign.start
        //         //         ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //         //         : '-';
        //         // }
        //         // return '';
        //         if (params.node.group) {
        //             const campaignName =
        //                 params.node.groupData?.campaignname || params.node.key;
        //             const campaign = campaignMap.get(campaignName);

        //             return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //         }
        //         return params.data?.from || null;
        //     },
        //     valueFormatter: (params) => {
        //         return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        // to: {
        //     headerName: 'End',
        //     field: 'to',
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //         if (params.node.group) {
        //             const campaignName =
        //                 params.node.groupData?.campaignname || params.node.key;
        //             const campaign = campaignMap.get(campaignName);
        //             return campaign && campaign.end
        //                 ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //                 : '-';
        //         }
        //         return params.data?.to || null;
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        from: {
            headerName: 'Start',
            field: 'from',
            sortable: true,
            minWidth: 110,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.start || null;
                } else {
                    dateStr = params.data?.from || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        to: {
            headerName: 'End',
            field: 'to',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue already Date from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.end || null;
                } else {
                    dateStr = params.data?.to || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        profitloss: {
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
            filter: "agNumberColumnFilter",
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
        // date: {
        //     headerName: 'Date', field: 'date', minWidth: 110, sortable: true,
        //     filter: "agDateColumnFilter",
        //     sort: "asc",
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             const dateAsString = cellValue;
        //             if (dateAsString == null) return -1;
        //             const dateParts = dateAsString.split("/");
        //             const cellDate = new Date(
        //                 Number(dateParts[2]),
        //                 Number(dateParts[1]) - 1,
        //                 Number(dateParts[0])
        //             );

        //             if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        //                 return 0;
        //             }

        //             if (cellDate < filterLocalDateAtMidnight) {
        //                 return -1;
        //             }

        //             if (cellDate > filterLocalDateAtMidnight) {
        //                 return 1;
        //             }
        //             return 0;
        //         }
        //     },
        // },
        date: {
            headerName: 'Date',
            field: 'date',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            // 🔥 Convert raw YYYY-MM-DD → real Date object
            valueGetter: (params) => {
                const dateStr = params.data?.date;
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            // 🔥 Display format only
            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
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
                'font-red': p => p.value < 0, // Conditional formatting for negative profit,
                'font-green': params => params.value > 0,
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
            valueGetter: getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",

        },
        fbclicks: { headerName: 'FBClicks', field: 'fbclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        fblinkclicks: { headerName: 'FB_LC', field: 'fblinkclicks', headerTooltip: 'fblinkclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        impressions: { headerName: 'IMP', field: 'impressions', headerTooltip: "Impressions", minWidth: 80, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
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
            filter: "agNumberColumnFilter",
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
        cpl: { headerName: 'CPL', field: 'cpl', minWidth: 80, valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "CPL = Spend / FBLeads" },
        ncpl: { headerName: 'NCPL', field: 'ncpl', minWidth: 90, valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "NCPL = Spend / Conversions" },
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
            filter: "agNumberColumnFilter",
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
            filter: "agNumberColumnFilter",
            valueFormatter: (params) => `${params.value}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "ROI = (Revenue - Spend) / Spend",
        },
        adsetid: { headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter", hide: false, suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        campaignid: { headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        history: {
            headerName: 'Activity',
            field: 'history',
            minWidth: 90,
            hide: true,
            sortable: false,
            filter: false,
            enableSorting: false,
            enableFilter: false,
            suppressMenu: true,
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignActualSpend, setCampaignActualSpend] = useState({});
                const [hasBudget, setHasBudget] = useState(false);
                const [confirmLoading, setConfirmLoading] = useState(false);

                const isGroupRow = !!params?.node?.groupData;

                // campaign id + campaign name for this row/group
                const campaignId = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.campaignid
                    : params?.data?.campaignid;

                const campaignname = isGroupRow
                    ? params?.node?.key
                    : params?.data?.campaignname;

                // ✅ the *accountNumber of this row/group* (not the selected accounts list)
                const rowAccountNumber = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.accountNumber
                    : params?.data?.accountNumber;

                // const { allCampaignData } = params.context;

                // ✅ find the exact record for (campaignId, rowAccountNumber)
                useEffect(() => {
                    if (!campaignId || !rowAccountNumber || !Array.isArray(Camapignlevelstatus)) return;

                    const matched = Camapignlevelstatus.find(
                        c =>
                            String(c.campaign_id) === String(campaignId) &&
                            String(c.accountNumber) === String(rowAccountNumber)
                    );

                    setCampaignActualSpend(matched ?? {});
                    setHasBudget(
                        !!(
                            matched?.campaign_budget &&
                            (matched.campaign_budget.daily_budget != null ||
                                matched.campaign_budget.lifetime_budget != null)
                        )
                    );
                }, [campaignId, rowAccountNumber, Camapignlevelstatus?.length]);

                const onChangeSpendAndStatus = () => {
                    if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return;

                    const grouped = (params.node?.allLeafChildren || []).map(n => n.data);
                    setGroupedData(grouped.length ? grouped : (params.data ? [params.data] : []));

                    if (!campaignId || !campaignname) {
                        message.error("Campaign info missing");
                        return;
                    }

                    // Prefill from the matched record for *this* account
                    const b = campaignActualSpend?.campaign_budget;
                    const budgetCents = b?.daily_budget ?? b?.lifetime_budget ?? null;
                    onChangeBudget(budgetCents != null ? Number(budgetCents) / 100 : undefined);

                    setIsModalVisible(true);
                };

                if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return null;

                return (
                    <div>
                        <HistoryOutlined />
                    </div>
                );
            },
        },
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
    //                             okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }} 
    //                         >
    //                             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

    //                                 <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
    //                                     <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
    //                                     <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#91C25F"}} onChange={onChangeCampaignStatus} />
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
    //                             okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }} 
    //                         >
    //                             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    //                                 <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
    //                                     <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
    //                                     <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#91C25F"}} onChange={onChangeCampaignStatus} />
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
        accountNumber: {
            headerName: 'Account',
            field: 'accountNumber',
            showWhenGrouped: true,
            minWidth: 170,
            filter: "agTextColumnFilter",
            valueGetter: (params) => {
                if (params.data) return params.data.accountNumber;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.accountNumber || null;
            },
            // hide: true,
        },
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
        cpm: {
            headerName: 'CPM',
            field: 'cpm',
            filter: "agTextColumnFilter",
            sortable: true,
            minWidth: 90,
            headerTooltip: '(Spend/Impressions)*1000',
            valueGetter: getCpm,
            hide: false,
            suppressMenu: true,
            filter: "agNumberColumnFilter",
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        filteration: {
            headerName: "Filteration",
            field: 'filteration',
            width: 115,
            filter: "agNumberColumnFilter",
            sortable: true,
            valueGetter: getFilteration,
            valueFormatter: params => `${params.value || 0}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            hide: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
        },
        // actions: {
        //     headerName: 'Actions',
        //     field: 'actions',
        //     minWidth: 90,
        //     // sortable: true,
        //     // filter: true,
        //     sortable: false,    // Ensure sorting is disabled
        //     filter: false,      // Ensure filtering is disabled
        //     enableSorting: false,  // Disable sorting at the column level
        //     enableFilter: false,
        //     suppressMenu: true,    // Suppress the column menu
        //     menuTabs: [],
        //     hide: !isYesterday(),
        //     cellRenderer: (params) => {
        //         const [isModalVisible, setIsModalVisible] = useState(false);
        //         const [groupedData, setGroupedData] = useState([]);
        //         const [newgroupedData, setNewGroupedData] = useState([]);
        //         const [changeBudget, onChangeBudget] = useState();
        //         const [campaignStatus, setCampaignStatus] = useState(true);
        //         const [campaignActualSpend, setCampaignActualSpend] = useState({});

        //         const onChangeSpendAndStatus = async () => {
        //             if (params?.node?.rowPinned === 'bottom') {
        //                 return ""; // Return empty string to remove "..."
        //             }
        //             if (params?.node?.footer) {
        //                 return ""; // Prevent modal from opening for group footer rows
        //             }
        //             const allLeafChildren = params.node?.allLeafChildren || [];

        //             // Fetch all the rows under the current group
        //             const groupedData = allLeafChildren.map(node => node.data) || [];
        //             setNewGroupedData(groupedData);
        //             const campaignId = groupedData[0]?.campaignid;
        //             // console.log(groupedData, "groupedData");

        //             // Only show the modal if there is data (groupedData length is greater than 0)
        //             if (groupedData.length > 0) {
        //                 const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
        //                 const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
        //                 if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {

        //                     setGroupedData(getCampaignResponse.data);
        //                     setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
        //                     onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
        //                 }
        //                 if(getCampaignActualSpend.status === 200){
        //                     // console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
        //                     setCampaignActualSpend(getCampaignActualSpend.data);
        //                 }
        //                 else {
        //                     setGroupedData(groupedData);
        //                 }
        //                 // Set the grouped data for the modal
        //                 setIsModalVisible(true); // Show the modal for non-footer rows
        //             }
        //             // if(groupedData.length > 0) {

        //             //     const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
        //             //     if (getCampaignActualSpend.status === 200){
        //             //         setCampaignActualSpend(getCampaignActualSpend.data);
        //             //     }
        //             // }
        //         };

        //         const handleOk = async () => {
        //             setIsModalVisible(false); // Close the modal
        //             const object = {
        //                 campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
        //                 adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
        //                 campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
        //                 usercommit: userdetails?.email,
        //                 accountNumber: newaccount,
        //                 budget: changeBudget * 100,
        //                 status: campaignStatus
        //             };
        //             // console.log(object);
        //             const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
        //             const responseData = requestResponse.data;
        //             // console.log(responseData, "response");
        //             message.success("Budget and Status Updated");
        //             changeRRefrst();
        //         };

        //         const handleCancel = () => {
        //             setIsModalVisible(false);
        //             // console.log(changeBudget); // Close the modal
        //         };

        //         const getTotalSpend = (data) => {
        //             if (!data || data.length === 0) return 0;
        //             const total = data.reduce((total, item) => {
        //                 return total + (parseFloat(item?.spend) || 0);
        //             }, 0);
        //             console.log(total, "total");
        //             return Math.round(total * 100) / 100; // Round to 2 decimal places
        //         };

        //         const onChangeBudgetValue = event => {
        //             onChangeBudget(event.target.value)
        //         }

        //         const onChangeCampaignStatus = async () => {
        //             const apiEndpoint = campaignStatus
        //                 ? '/campaignStatusPause/' // Pause campaign
        //                 : '/campaignStatusActive/'; // Activate campaign

        //             try {
        //                 const response = await apiClient.post(apiEndpoint, 
        //                     { campaignId: groupedData[0]?.campaignid }
        //                 );
        //                 if (response.status === 200) {
        //                     message.success(`Campaign ${groupedData[0]?.campaignid} status updated to ${campaignStatus ? 'Paused' : 'Active'}`);
        //                     setCampaignStatus((prev) => !prev); // Toggle the status
        //                 } else {
        //                     message.error('Failed to update campaign status.');
        //                 }
        //             } catch (error) {
        //                 console.error('Error updating campaign status:', error);
        //                 message.error('Error updating campaign status.');
        //             }
        //         };
        //         // console.log()

        //         return (
        //             <div>
        //                 <div onClick={onChangeSpendAndStatus}>
        //                     <span>{params.value || "..."}</span> 
        //                 </div>
        //                 {isModalVisible && (
        //                     <Modal
        //                         title={groupedData?.length > 0 && groupedData?.length !== 1 ? groupedData[0]?.campaignname : groupedData?.campaignname}
        //                         visible={isModalVisible}
        //                         onOk={handleOk}
        //                         onCancel={handleCancel}
        //                         width={600}  
        //                         style={{ padding: '20px' }}
        //                         okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }} 
        //                     >
        //                         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        //                             <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        //                                 <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
        //                                 <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#91C25F"}} onChange={onChangeCampaignStatus} />
        //                             </div>
        //                             <div style={{ display: 'flex', flexDirection: 'column' }}>
        //                                 <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
        //                                 <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
        //                             </div>
        //                             <div style={{ display: 'flex', flexDirection: 'column' }}>
        //                                 <Typography.Text strong>Campaign ID:</Typography.Text>
        //                                 <p>{campaignActualSpend?.id}</p>
        //                             </div>
        //                         </div>
        //                     </Modal>
        //                 )}
        //             </div>
        //         );
        //     },
        // },
        actions: {
            headerName: 'Budget',
            field: 'actions',
            minWidth: 90,
            sortable: false,
            filter: false,
            enableSorting: false,
            enableFilter: false,
            suppressMenu: true,
            // hide: !isYesterday(),
            cellRenderer: (params) => {
                const {
                    // allCampaignData,
                    setCampaignRefreshTrigger,
                    changeRRefrst,
                    newaccount,
                    userdetails,
                    theme
                } = params.context;

                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [bidAmount, setBidAmount] = useState();
                const [adsetId, setAdsetId] = useState(null);
                const [adsetInfo, setAdsetInfo] = useState(null);
                const [confirmLoading, setConfirmLoading] = useState(false);
                //   const [, forceRerender] = useState(0);

                const isGroupRow = !!params?.node?.groupData;
                let campaignId = null;
                let initialAdsetId = null;
                let accountNumber = null;

                if (isGroupRow) {
                    const children = params?.node?.allLeafChildren || [];
                    campaignId = children[0]?.data?.campaignid;
                    initialAdsetId = children[0]?.data?.adsetid;
                    accountNumber = children[0]?.data?.accountNumber;
                } else {
                    campaignId = params?.data?.campaignid;
                    initialAdsetId = params?.data?.adsetid;
                    accountNumber = params?.data?.accountNumber;
                }

                const campaignname = isGroupRow
                    ? params?.node?.key
                    : params?.data?.campaignname;

                console.log("campaignId ar:", campaignId);

                useEffect(() => {
                    if (!campaignId || !initialAdsetId || !Array.isArray(Camapignlevelstatus)) return;
                    // const matchedCampaign = allCampaignData.find(c => c.campaign_id === campaignId);
                    // const matchedAdset = matchedCampaign?.adsets?.find(ad => ad.adset_id === initialAdsetId);
                    // const matchedAdset = Camapignlevelstatus.find(
                    //     (adset) => adset.campaignid === campaignId && adset.adset_id === initialAdsetId
                    // );
                    const matchedAdset = Camapignlevelstatus
                        .find(item =>
                            String(item.campaign_id) === String(campaignId) &&
                            String(item.accountNumber) === String(accountNumber)
                        )?.adsets.find(adset =>
                            String(adset.adset_id) === String(initialAdsetId)
                        );
                    if (matchedAdset?.budget) {
                        if (Number(matchedAdset.budget.daily_budget) === 0) {
                            matchedAdset.budget.daily_budget = null;
                        }
                        if (Number(matchedAdset.budget.lifetime_budget) === 0) {
                            matchedAdset.budget.lifetime_budget = null;
                        }
                    }
                    if (matchedAdset) {
                        setAdsetInfo(matchedAdset);
                    }
                }, [campaignId, initialAdsetId, Camapignlevelstatus]);

                const onChangeSpendAndStatus = async () => {
                    try {
                        const grouped = params?.node?.allLeafChildren?.map(node => node.data) || [];
                        const clickedAdsetId = grouped?.[0]?.adsetid || initialAdsetId;
                        //   const clickedCampaignId = grouped?.[0]?.campaignid || campaignId;

                        setGroupedData(grouped);
                        setAdsetId(clickedAdsetId);

                        const campaign = params.context.allCampaignData.find(c => c.campaign_id === campaignId);

                        const adset = Camapignlevelstatus
                            .find(item =>
                                String(item.campaign_id) === String(campaignId) &&
                                String(item.accountNumber) === String(accountNumber)
                            )?.adsets.find(adset =>
                                String(adset.adset_id) === String(initialAdsetId)
                            );
                        if (adset?.budget) {
                            if (Number(adset.budget.daily_budget) === 0) {
                                adset.budget.daily_budget = null;
                            }
                            if (Number(adset.budget.lifetime_budget) === 0) {
                                adset.budget.lifetime_budget = null;
                            }
                        }
                        if (adset) {
                            const budget = parseFloat(adset?.budget?.daily_budget || adset?.budget?.lifetime_budget || 0) / 100;
                            onChangeBudget(budget);
                            setBidAmount(adset?.bid_amount / 100);
                            setAdsetInfo(adset);
                            setIsModalVisible(true);
                        } else {
                            message.error("Adset not found in backend response.");
                        }

                        //   setIsModalVisible(true);
                    } catch (err) {
                        console.error("❌ Failed to fetch adset:", err);
                        message.error("Failed to fetch adset data");
                    }
                };

                if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) {
                    return null;
                }

                const handleOk = async () => {


                    const campaignname = groupedData?.[0]?.campaignname;
                    const adsetname = groupedData?.[0]?.adsetName;
                    const adsetid = groupedData?.[0]?.adsetid;
                    const campaignActualSpend = Camapignlevelstatus
                        .find(item =>
                            String(item.campaign_id) === String(campaignId) &&
                            String(item.accountNumber) === String(accountNumber)
                        )?.adsets.find(adset =>
                            String(adset.adset_id) === String(initialAdsetId)
                        );
                    if (campaignActualSpend?.budget) {
                        if (Number(campaignActualSpend.budget.daily_budget) === 0) {
                            campaignActualSpend.budget.daily_budget = null;
                        }
                        if (Number(campaignActualSpend.budget.lifetime_budget) === 0) {
                            campaignActualSpend.budget.lifetime_budget = null;
                        }
                    }
                    const bidAmountValue = Math.round(parseFloat(bidAmount) * 100);
                    const changeBudgetValue = Math.round(parseFloat(changeBudget) * 100);
                    const previousBudget = campaignActualSpend?.budget?.daily_budget != null ? Math.round(parseFloat(campaignActualSpend?.budget?.daily_budget)) :
                        campaignActualSpend?.budget?.lifetime_budget != null ? Math.round(parseFloat(campaignActualSpend?.budget?.lifetime_budget)) : 0;

                    const payload = {
                        adsetId,
                        accountNumber: accountNumber,
                        campaignname,
                        campaignId,
                        updatedby: userdetails?.email,
                        budgetType: campaignActualSpend?.budget?.daily_budget != null ? 'daily_budget' :
                            campaignActualSpend?.budget?.lifetime_budget != null ? 'lifetime_budget' : 'unknown',
                    };

                    if (
                        changeBudget !== undefined &&
                        changeBudget !== '' &&
                        !isNaN(changeBudget) &&
                        parseFloat(changeBudget) > 0 &&// <- this is critical&&
                        changeBudgetValue !== previousBudget
                    ) {
                        payload.budget = Math.round(parseFloat(changeBudget) * 100);
                        payload.activity = {
                            editType: "Budget",
                            campaignid: campaignId,       // cents
                            adsetid: adsetid,
                            Account: String(accountNumber),    // ✅ update *this* row’s account
                            campaignname: campaignname,
                            adsetname: adsetname,
                            updatedBy: userdetails?.userName,
                            updatedUserEmail: userdetails?.email,
                            updateType: "Adset budget updated",
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                            updateDetail: `From $${campaignActualSpend?.budget?.daily_budget != null ? (Number(campaignActualSpend?.budget?.daily_budget) / 100) : campaignActualSpend?.budget?.lifetime_budget != null ? (Number(campaignActualSpend?.budget?.lifetime_budget) / 100) : 0} to $${(Number(changeBudget))}`,
                            budgetType: campaignActualSpend?.budget?.daily_budget != null ? 'daily_budget' :
                                campaignActualSpend?.budget?.lifetime_budget != null ? 'lifetime_budget' : 'unknown',
                        }
                    }

                    if (
                        bidAmount !== undefined &&
                        bidAmount !== '' &&
                        !isNaN(bidAmount) &&
                        parseFloat(bidAmount) * 100 >= 1 &&
                        bidAmountValue !== campaignActualSpend?.bid_amount
                    ) {
                        // payload.bidAmount = parseFloat(bidAmount) * 100;
                        payload.bidAmount = Math.round(parseFloat(bidAmount) * 100);
                        payload.bidactivity = {
                            editType: "Bid",
                            campaignid: campaignId,       // cents
                            adsetid: adsetid,
                            Account: String(accountNumber),    // ✅ update *this* row’s account
                            campaignname: campaignname,
                            adsetname: adsetname,
                            updatedBy: userdetails?.userName,
                            updatedUserEmail: userdetails?.email,
                            updateType: "Adset bid strategy updated",
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                            updateDetail: `From $${(Number(campaignActualSpend?.bid_amount) / 100)} to $${Math.round(bidAmount * 100) / 100}`,
                        }
                    }

                    const hasBudget = Object.prototype.hasOwnProperty.call(payload, 'budget');
                    const hasBidAmount = Object.prototype.hasOwnProperty.call(payload, 'bidAmount');

                    if (!hasBudget && !hasBidAmount) {
                        message.warning("Please enter Budget and/or Bid Amount before submitting.");
                        return;
                    }


                    try {
                        setConfirmLoading(true);
                        const newResponse = await apiClient.post('/update/adset/budget/history', payload);
                        message.success("Adset Budget and/or Bid Updated");
                        if (newResponse.status === 200 || newResponse.status === 201) {
                            setConfirmLoading(false);
                            setCamapignlevelstatus(prevStatus =>
                                prevStatus.map(item =>
                                    String(item.campaign_id) === String(payload.campaignId) &&
                                        String(item.accountNumber) === String(payload.accountNumber)
                                        ? {
                                            ...item,
                                            adsets: item.adsets.map(adset =>
                                                String(adset.adset_id) === String(payload.adsetId)
                                                    ? {
                                                        ...adset,
                                                        ...(payload.budget !== undefined && {
                                                            budget: {
                                                                ...adset.budget,
                                                                daily_budget: String(payload.budget), // ✅ update daily_budget
                                                                lifetime_budget: null, // optional reset if needed
                                                            },
                                                        }),
                                                        ...(payload.bidAmount !== undefined && {
                                                            bid_amount: payload.bidAmount, // ✅ update bid_amount
                                                        }),
                                                        last_updated_by: payload.updatedby,
                                                        last_updated_at: new Date().toISOString(),
                                                    }
                                                    : adset
                                            ),
                                        }
                                        : item
                                )
                            );
                            setIsModalVisible(false);
                        }

                        // setCampaignRefreshTrigger(prev => prev + 1); // ✅ Refresh campaign + adset data

                        // changeRRefrst();
                    } catch (err) {
                        setConfirmLoading(false);
                        console.error(err);
                        message.error("Failed to update adset");
                    }
                };

                const rawData = isGroupRow ? params?.node?.allLeafChildren?.[0]?.data : params?.data;

                const daily = adsetInfo?.budget?.daily_budget ?? rawData?.budget?.daily_budget;
                const lifetime = adsetInfo?.budget?.lifetime_budget ?? rawData?.budget?.lifetime_budget;
                const bid = adsetInfo?.bid_amount ?? rawData?.bid_amount;

                const hasBudget = (daily !== null && daily !== undefined && daily !== '') ||
                    (lifetime !== null && lifetime !== undefined && lifetime !== '');
                const hasBid = bid !== null && bid !== undefined && bid !== '';


                let tooltipText = 'Ad Set Budget & Bid are NOT available';
                let iconColor = '#FF4D4F'; // Red (default: none available)

                if (hasBudget && hasBid) {
                    tooltipText = 'Ad Set Budget & Bid are available';
                    iconColor = '#91C25F'; // Green
                } else if (hasBudget || hasBid) {
                    tooltipText = hasBudget ? 'Ad Set exists with Budget but no Bid' : 'Ad Set exists with Bid but no Budget';
                    iconColor = '#FFBF00'; // Yellow
                }

                return (
                    <div>
                        <Tooltip title={tooltipText}>
                            <DollarOutlined
                                style={{
                                    cursor: 'pointer',
                                    color: iconColor,
                                }}
                                onClick={onChangeSpendAndStatus}
                            />
                        </Tooltip>

                        {isModalVisible && (
                            <Modal
                                title={groupedData?.[0]?.campaignname || 'Edit Adset'}
                                open={isModalVisible}
                                // confirmLoading={confirmLoading}
                                onOk={handleOk}
                                onCancel={() => setIsModalVisible(false)}
                                width={600}
                                okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }}
                                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ display: 'flex' }}>
                                        <p style={{ marginBottom: '0px' }}>
                                            Budget Type:
                                        </p>{' '}
                                        <span style={{ fontWeight: 'normal' }}>
                                            {adsetInfo?.budget?.daily_budget ? 'Daily' :
                                                adsetInfo?.budget?.lifetime_budget ? 'Lifetime' : 'No budget'}
                                        </span>
                                    </div>

                                    <Input
                                        type="number"
                                        value={changeBudget}
                                        disabled={!hasBudget}
                                        onChange={(e) => onChangeBudget(e.target.value)}
                                        placeholder="Enter budget in USD"
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                    />

                                    <p style={{ marginBottom: '0px' }}>Bid amount</p>

                                    <Input
                                        type="number"
                                        value={bidAmount}
                                        disabled={!hasBid}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                        placeholder="Enter bid amount"
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                    />

                                    <div style={{ display: 'flex' }}>
                                        <p>
                                            Adset ID:
                                        </p>
                                        <p>{adsetId}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
        },
        adsetname: {
            // headerName: 'AdsetName',
            // field: 'adsetname',
            // sortable: true,
            // minWidth: 450,
            // filter: 'agSetColumnFilter',
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // },
            // suppressMenu: true,    // Suppress the column menu
            // width: 500,
            // hide: true,
            // rowGroup: true,
            // enableRowGroup: true,
            // pinned: 'left',
            headerName: 'AdsetId',
            field: 'adsetname',
            resizable: true,
            sortable: true,
            // hide: true,
            minWidth: 180,
            spanRows: true,
            filter: "agTextColumnFilter",
            // hide: true,
            // rowGroup: true,
            // enableRowGroup: true,
            // pinned: 'left',
            valueGetter: (params) => {
                if (params.data) return params.data.adsetid;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.adsetid || null;
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
        // from: {
        //     headerName: 'Start',
        //     field: 'from',
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //       if (params.node.group) {
        //         const campaignName =
        //           params.node.groupData?.campaignname || params.node.key;
        //         return moment(campaignMap.get(campaignName), "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
        //       }
        //       return '';
        //     },
        //     cellClassRules: {
        //       'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        // },
        category: {
            headerName: 'Category',
            field: 'category',
            minWidth: 110,
            sortable: true,
            filter: "agTextColumnFilter",

            // ✅ Helper: Capitalize the first letter only
            valueFormatter: (params) => {
                if (!params.value) return '';
                return params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase();
            },

            // ✅ Show category for both grouped and normal rows
            valueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ For normal (leaf) rows
                return capitalize(params.data?.category);
            },

            // ✅ Filter uses same logic as valueGetter
            filterValueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ Include leaf rows in filtering
                return capitalize(params.data?.category);
            },

            // ✅ Dynamic filter list (from both grouped + leaf rows)
            filterParams: {
                values: (params) => {
                    const uniqueCategories = new Set();

                    params.api.forEachNode((node) => {
                        const capitalize = (val) =>
                            val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                        if (node.group) {
                            const firstChild = node.allLeafChildren?.[0];
                            const account = firstChild?.data?.accountNumber;
                            const campaignName = firstChild?.data?.campaignid;
                            const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                            const category = capitalize(campaign?.category);
                            if (category) uniqueCategories.add(category);
                        } else {
                            const category = capitalize(node.data?.category);
                            if (category) uniqueCategories.add(category);
                        }
                    });

                    // params.success(Array.from(uniqueCategories));
                    params.success && params.success(Array.from(uniqueCategories));
                },
            },

            // ✅ Safe comparator for sorting (group-aware)
            comparator: (valueA, valueB, nodeA, nodeB) => {
                const isGroupA = nodeA?.group;
                const isGroupB = nodeB?.group;
                if (isGroupA && isGroupB) {
                    return valueA?.localeCompare?.(valueB) ?? 0;
                }
                // sort normally for leaf nodes
                return valueA?.localeCompare?.(valueB) ?? 0;
            },

            // ✅ Optional — hide empty leaf cells (if any)
            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group && !params.value,
            },
            // cellRenderer: (props) => {
            //     if (props.node.rowPinned || props.node.footer) return "";
            //     if (props.value) return props.value;

            //     const [open, setOpen] = useState(false);
            //     const [category, setCategory] = useState("");
            //     const [row, setRow] = useState(null);

            //     const getRow = () => {
            //         return props.node.group
            //             ? props.node.allLeafChildren?.[0]?.data
            //             : props.node.data;
            //     };

            //     const onEdit = () => {
            //         const r = getRow();
            //         setRow(r);
            //         setCategory(r?.category || "");
            //         setOpen(true);
            //     };

            //     const save = async () => {
            //         if (!row) return;

            //         const payload = {
            //             accountNumber: row.accountNumber,
            //             campaignid: row.campaignid,
            //             level: "campaign",
            //             category,
            //         };

            //         try {
            //             const token = localStorage.getItem("token");

            //             await apiClient.post(
            //                 "/UpdateCategoryNew",
            //                 payload,
            //                 { headers: { Authorization: token } }
            //             );

            //             setCampaignComments((prev) => {
            //                 const arr = [...prev];
            //                 const idx = arr.findIndex(
            //                     (i) =>
            //                         i.campaignid == payload.campaignid &&
            //                         i.Account == payload.accountNumber &&
            //                         i.level == "campaign"
            //                 );
            //                 if (idx >= 0) {
            //                     arr[idx].category = payload.category;
            //                 } else {
            //                     arr.push({
            //                         campaignid: payload.campaignid,
            //                         Account: payload.accountNumber,
            //                         level: "campaign",
            //                         category: payload.category,
            //                     });
            //                 }
            //                 return arr;
            //             });
            //             const key = `${payload.campaignid}_${payload.accountNumber}_campaign`;
            //             commentsMap.set(key, { category: payload.category });
            //             message.success("Category updated");
            //         } catch (err) {
            //             console.error(err);
            //             message.error("Failed to update category");

            //         }

            //         setOpen(false);
            //     };

            //     return (
            //         <div>
            //             <span
            //                 onClick={onEdit}
            //                 style={{ cursor: "pointer", }}
            //             >
            //                 <PlusOutlined />
            //             </span>

            //             <Modal className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`} open={open} title="Edit Category" onOk={save} onCancel={() => setOpen(false)}>
            //                 <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            //             </Modal>
            //         </div>
            //     );
            // },
            cellRenderer: (props) => {
                if (props.node.rowPinned || props.node.footer) return null;

                const [editing, setEditing] = React.useState(false);
                const [value, setValue] = React.useState(props.value || "");

                const [open, setOpen] = React.useState(false);
                const [category, setCategory] = React.useState("");

                const getRow = () =>
                    props.node.group
                        ? props.node.allLeafChildren?.[0]?.data
                        : props.node.data;

                const openModal = () => {
                    const row = getRow();
                    if (!row) return;
                    setCategory(row.category || "");
                    setOpen(true);
                };

                const saveFromModal = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, category);
                    setOpen(false);
                };


                const saveInline = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, value);
                    setEditing(false);
                };


                const saveApi = async (row, catValue) => {
                    const payloadForActivity = {
                        editType: "Categoty",
                        campaignid: row.campaignid,       // cents
                        Account: row.accountNumber,    // ✅ update *this* row’s account
                        campaignname: row.campaignname,
                        updatedBy: userdetails?.userName || "Unknown",
                        updatedUserEmail: userdetails.email,
                        updateType: row.category ? "Campain category updated" : "Campain category created",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: row.category ? `From ${row.category || "N/A"} to ${catValue}` : `Category added as ${catValue}`,
                    };
                    const payload = {
                        accountNumber: row.accountNumber,
                        campaignid: row.campaignid,
                        level: "campaign",
                        category: catValue,
                        activity: payloadForActivity,
                    };

                    const token = localStorage.getItem("token");

                    await apiClient.post(
                        "/UpdateCategoryAndStoreHistory",
                        payload,
                        { headers: { Authorization: token } }
                    );

                    setCampaignComments((prev) => {
                        const arr = [...prev];
                        const idx = arr.findIndex(
                            i =>
                                String(i.campaignid) === String(payload.campaignid) &&
                                String(i.Account) === String(payload.accountNumber) &&
                                i.level === "campaign"
                        );

                        if (idx >= 0) arr[idx].category = catValue;
                        else arr.push({
                            campaignid: payload.campaignid,
                            Account: payload.accountNumber,
                            level: "campaign",
                            category: catValue,
                        });

                        return arr;
                    });

                    commentsMap.set(
                        `${payload.campaignid}_${payload.accountNumber}_campaign`,
                        { category: catValue }
                    );

                    message.success("Category updated");
                };


                if (props.value && !editing) {
                    return (
                        // <span
                        //     onClick={() => setEditing(true)}
                        //     style={{ cursor: "pointer" }}
                        // >
                        //     {props.value}
                        // </span>
                        <Tooltip title={props.value}
                            overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                // fontWeight: 500,
                            }}>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing(true);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {props.value}
                            </span>
                        </Tooltip>
                    );
                }

                if (props.value && editing) {
                    return (
                        <Input
                            autoFocus
                            size="small"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onPressEnter={saveInline}
                            onBlur={saveInline}
                        />
                    );
                }

                return (
                    <>
                        <PlusOutlined
                            // onClick={openModal}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal();
                            }}
                            style={{ cursor: "pointer" }}
                        />

                        <Modal
                            open={open}
                            title="Edit Category"
                            onOk={saveFromModal}
                            onCancel={() => setOpen(false)}
                        >
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Modal>
                    </>
                );
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        // from: {
        //     // headerName: 'Start',
        //     // field: 'from',
        //     // sortable: true,
        //     // minWidth: 110,
        //     // valueGetter: (params) => {
        //     //     // if (params.node.group) {
        //     //     //     const campaignName =
        //     //     //         params.node.groupData?.campaignname || params.node.key;
        //     //     //     const campaign = campaignMap.get(campaignName);
        //     //     //     return campaign && campaign.start
        //     //     //         ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //     //     //         : '-';
        //     //     // }
        //     //     // return '';
        //     //     if (params.node.group) {
        //     //         const campaignName =
        //     //             params.node.groupData?.campaignname || params.node.key;
        //     //         const campaign = campaignMap.get(campaignName);

        //     //         return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //     //     }
        //     //     return params.data?.from || null;
        //     // },
        //     // valueFormatter: (params) => {
        //     //     return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     // },
        //     // cellClassRules: {
        //     //     'hide-leaf-cell': (params) => !params.node.group,
        //     // },
        //     // suppressMenu: true,
        //     // menuTabs: [],
        //     // headerClass: 'hide-menu',
        //     headerName: 'Start',
        //     field: 'from',
        //     sortable: true,
        //     minWidth: 110,
        //     filter: "agDateColumnFilter",
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             if (cellValue == null) return -1;

        //             // Convert your cell value string to a Date
        //             const cellDate = new Date(cellValue);

        //             if (cellDate < filterLocalDateAtMidnight) return -1;
        //             if (cellDate > filterLocalDateAtMidnight) return 1;
        //             return 0;
        //         },
        //     },
        //     valueGetter: (params) => {
        //         // if (params.node.group) {
        //         //     const campaignName =
        //         //         params.node.groupData?.campaignname || params.node.key;
        //         //     const campaign = campaignMap.get(campaignName);
        //         //     return campaign && campaign.start
        //         //         ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //         //         : '-';
        //         // }
        //         // return '';
        //         if (params.node.group) {
        //             // const campaignName =
        //             //     params.node.groupData?.campaignname || params.node.key;
        //             const campaignName = params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";
        //             const campaignId = params.node?.childrenAfterGroup?.[0]?.data?.campaignid || "";

        //             const campaign = campaignMap.get(`${campaignName}_${campaignId}`);

        //             return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //         }
        //         return params.data?.from || null;
        //     },
        //     valueFormatter: (params) => {
        //         return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        // to: {
        //     // headerName: 'End',
        //     // field: 'to',
        //     // minWidth: 110,
        //     // valueGetter: (params) => {
        //     //     if (params.node.group) {
        //     //         const campaignName =
        //     //             params.node.groupData?.campaignname || params.node.key;
        //     //         const campaign = campaignMap.get(campaignName);
        //     //         return campaign && campaign.end
        //     //             ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //     //             : '-';
        //     //     }
        //     //     return params.data?.to || null;
        //     // },
        //     // cellClassRules: {
        //     //     'hide-leaf-cell': (params) => !params.node.group,
        //     // },
        //     // suppressMenu: true,
        //     // menuTabs: [],
        //     // headerClass: 'hide-menu',
        //     headerName: 'End',
        //     field: 'to',
        //     minWidth: 110,
        //     filter: "agDateColumnFilter",
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             if (cellValue == null) return -1;

        //             // Convert your cell value string to a Date
        //             const cellDate = new Date(cellValue);

        //             if (cellDate < filterLocalDateAtMidnight) return -1;
        //             if (cellDate > filterLocalDateAtMidnight) return 1;
        //             return 0;
        //         },
        //     },
        //     valueGetter: (params) => {
        //         if (params.node.group) {
        //             // const campaignName =
        //             //     params.node.groupData?.campaignname || params.node.key;
        //             // const campaign = campaignMap.get(campaignName);
        //             // return campaign && campaign.end
        //             //     ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //             //     : '-';
        //             const campaignName = params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";
        //             const campaignId = params.node?.childrenAfterGroup?.[0]?.data?.campaignid || params.node?.key || "";
        //             // console.log(params.node?.childrenAfterGroup?.[0], "childrenAfterGroup");
        //             // console.log(campaignName, "campaignName");
        //             // console.log(campaignId, "campaignId");

        //             const campaign = campaignMap.get(`${campaignName}_${campaignId}`);

        //             // console.log(campaign, "campaign");

        //             return campaign && campaign.end
        //                 ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //                 : '-';
        //         }
        //         return params.data?.to ? moment(params.data?.to, "YYYY-MM-DD").format("DD-MM-YYYY") : null;
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        from: {
            headerName: 'Start',
            field: 'from',
            sortable: true,
            minWidth: 110,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.start || null;
                } else {
                    dateStr = params.data?.from || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        to: {
            headerName: 'End',
            field: 'to',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue already Date from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.end || null;
                } else {
                    dateStr = params.data?.to || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        profitloss: {
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
                    return (revenue - spend) ? (revenue - spend).toFixed(2) : "" || "";
                }
                return '';
            },
            minWidth: 110,
            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },
            cellStyle: { fontWeight: 'bold' },
            suppressMenu: true,
            filter: "agNumberColumnFilter",
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        // date: {
        //     headerName: 'Date',
        //     field: 'date',
        //     minWidth: 110,
        //     sortable: true,
        //     // sort: "asc",
        //     filter: "agDateColumnFilter",
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             const dateAsString = cellValue;
        //             if (dateAsString == null) return -1;
        //             const dateParts = dateAsString.split("/");
        //             const cellDate = new Date(
        //                 Number(dateParts[2]),
        //                 Number(dateParts[1]) - 1,
        //                 Number(dateParts[0])
        //             );

        //             if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        //                 return 0;
        //             }

        //             if (cellDate < filterLocalDateAtMidnight) {
        //                 return -1;
        //             }

        //             if (cellDate > filterLocalDateAtMidnight) {
        //                 return 1;
        //             }
        //             return 0;
        //         },
        //     },
        // },
        date: {
            headerName: 'Date',
            field: 'date',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            // 🔥 Convert raw YYYY-MM-DD → real Date object
            valueGetter: (params) => {
                const dateStr = params.data?.date;
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            // 🔥 Display format only
            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
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
            filter: "agNumberColumnFilter", // Keep filter active
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Total amount spent",
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),
        },
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            // filter: "agNumberColumnFilter",
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),

        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            sortable: true,
            aggFunc: liveSpender,
            cellClassRules: {
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0,
            },
            // filter: "agNumberColumnFilter",
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Profit = Revenue - Spend",
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),

        },
        margin: {
            headerName: 'Margin',
            field: 'margin',
            minWidth: 100,
            valueGetter: getMargin,
            sortable: true,
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
            valueGetter: getCpcLc,
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
            headerTooltip: 'fblinkclicks',
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
            // headerName: 'AdsetId',
            // field: 'adsetid',
            // sortable: true,
            // filter: "agTextColumnFilter",
            // suppressMenu: true,
            // menuTabs: [],
            // headerClass: 'hide-menu'
            headerName: 'AdsetId',
            field: 'adsetid',
            sortable: true,
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            width: 500,
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
        },
        campaignid: {
            headerName: 'CampaignId',
            field: 'campaignid',
            sortable: true,
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            resizable: true,
            sortable: true,
            // hide: true,
            minWidth: 180,
            spanRows: true,
            filter: "agTextColumnFilter",
            // hide: true,
            // rowGroup: true,
            // enableRowGroup: true,
            // pinned: 'left',
            valueGetter: (params) => {
                if (params.data) return params.data.campaignid;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.campaignid || null;
            },
        },
        timezone: {
            headerName: 'TimeZone',
            field: 'timezone',
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu'
        },
        history: {
            headerName: 'Activity',
            field: 'history',
            minWidth: 90,
            hide: true,
            sortable: false,
            filter: false,
            enableSorting: false,
            enableFilter: false,
            suppressMenu: true,
            cellRenderer: (params) => {
                return (
                    <div>
                        <HistoryOutlined />
                    </div>
                );
            },
        },
    };

    const columnDefsObjectAdLevel = {
        accountNumber: {
            headerName: 'Account',
            field: 'accountNumber',
            showWhenGrouped: true,
            minWidth: 170,
            filter: "agTextColumnFilter",
            valueGetter: (params) => {
                if (params.data) return params.data.accountNumber;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.accountNumber || null;
            },
            // hide: true,
        },
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
        keyword: {
            headerName: 'Keyword',
            field: 'keyword',
            resizable: true,
            sortable: true,
            filter: "agTextColumnFilter",
            // hide: false,    
        },
        cpm: {
            headerName: 'CPM',
            field: 'cpm',
            sortable: true,
            filter: "agNumberColumnFilter",
            minWidth: 90,
            headerTooltip: '(Spend/Impressions)*1000',
            valueGetter: getCpm,
            hide: false,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        filteration: {
            headerName: "Filteration",
            field: 'filteration',
            width: 115,
            sortable: true,
            valueGetter: getFilteration,
            valueFormatter: params => `${params.value || 0}%`,
            suppressMenu: true,
            filter: "agNumberColumnFilter",
            menuTabs: [],
            headerClass: 'hide-menu',
            hide: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
        },
        actions: {
            headerName: 'Budget',
            field: 'actions',
            hide: true,
            minWidth: 90,
            // sortable: true,
            // filter: true,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            suppressMenu: true,    // Suppress the column menu
            menuTabs: [],
            // hide: !isYesterday(),
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
                        if (getCampaignActualSpend.status === 200) {
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

                    //     const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
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
                                okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }}
                                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{ backgroundColor: campaignStatus && "#91C25F" }} onChange={onChangeCampaignStatus} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{ fontWeight: 'normal' }}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget) / 100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget) / 100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ color: theme === "dark" && "white" }}>Campaign ID:</Typography.Text>
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
            filter: 'agTextColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            },
            suppressMenu: true,    // Suppress the column menu
            hide: true,

        },
        adname: {
            headerName: 'AdID', field: 'adname',

            // headerName: 'AdsetId',
            // field: 'adsetname',
            resizable: true,
            sortable: true,
            // hide: true,
            minWidth: 180,
            spanRows: true,
            filter: "agTextColumnFilter",
            // hide: true,
            // rowGroup: true,
            // enableRowGroup: true,
            // pinned: 'left',
            valueGetter: (params) => {
                if (params.data) return params.data.adid;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.adid || null;
            },
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
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
            pinned: 'left',
            // suppressMenu: true,    // Suppress the column menu

        },

        category: {
            headerName: 'Category',
            field: 'category',
            minWidth: 110,
            sortable: true,
            filter: "agTextColumnFilter",

            // ✅ Helper: Capitalize the first letter only
            valueFormatter: (params) => {
                if (!params.value) return '';
                return params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase();
            },

            // ✅ Show category for both grouped and normal rows
            valueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ For normal (leaf) rows
                return capitalize(params.data?.category);
            },

            // ✅ Filter uses same logic as valueGetter
            filterValueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ Include leaf rows in filtering
                return capitalize(params.data?.category);
            },

            // ✅ Dynamic filter list (from both grouped + leaf rows)
            filterParams: {
                values: (params) => {
                    const uniqueCategories = new Set();

                    params.api.forEachNode((node) => {
                        const capitalize = (val) =>
                            val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                        if (node.group) {
                            const firstChild = node.allLeafChildren?.[0];
                            const account = firstChild?.data?.accountNumber;
                            const campaignName = firstChild?.data?.campaignid;
                            const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                            const category = capitalize(campaign?.category);
                            if (category) uniqueCategories.add(category);
                        } else {
                            const category = capitalize(node.data?.category);
                            if (category) uniqueCategories.add(category);
                        }
                    });

                    // params.success(Array.from(uniqueCategories));
                    params.success && params.success(Array.from(uniqueCategories));
                },
            },

            // ✅ Safe comparator for sorting (group-aware)
            comparator: (valueA, valueB, nodeA, nodeB) => {
                const isGroupA = nodeA?.group;
                const isGroupB = nodeB?.group;
                if (isGroupA && isGroupB) {
                    return valueA?.localeCompare?.(valueB) ?? 0;
                }
                // sort normally for leaf nodes
                return valueA?.localeCompare?.(valueB) ?? 0;
            },

            // ✅ Optional — hide empty leaf cells (if any)
            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group && !params.value,
            },

            // cellRenderer: (props) => {
            //     if (props.node.rowPinned || props.node.footer) return "";
            //     if (props.value) return props.value;

            //     const [open, setOpen] = useState(false);
            //     const [category, setCategory] = useState("");
            //     const [row, setRow] = useState(null);

            //     const getRow = () => {
            //         return props.node.group
            //             ? props.node.allLeafChildren?.[0]?.data
            //             : props.node.data;
            //     };

            //     const onEdit = () => {
            //         const r = getRow();
            //         setRow(r);
            //         setCategory(r?.category || "");
            //         setOpen(true);
            //     };

            //     const save = async () => {
            //         if (!row) return;

            //         const payload = {
            //             accountNumber: row.accountNumber,
            //             campaignid: row.campaignid,
            //             level: "campaign",
            //             category,
            //         };

            //         try {
            //             const token = localStorage.getItem("token");

            //             await apiClient.post(
            //                 "/UpdateCategoryNew",
            //                 payload,
            //                 { headers: { Authorization: token } }
            //             );

            //             setCampaignComments((prev) => {
            //                 const arr = [...prev];
            //                 const idx = arr.findIndex(
            //                     (i) =>
            //                         i.campaignid == payload.campaignid &&
            //                         i.Account == payload.accountNumber &&
            //                         i.level == "campaign"
            //                 );
            //                 if (idx >= 0) {
            //                     arr[idx].category = payload.category;
            //                 } else {
            //                     arr.push({
            //                         campaignid: payload.campaignid,
            //                         Account: payload.accountNumber,
            //                         level: "campaign",
            //                         category: payload.category,
            //                     });
            //                 }
            //                 return arr;
            //             });
            //             const key = `${payload.campaignid}_${payload.accountNumber}_campaign`;
            //             commentsMap.set(key, { category: payload.category });
            //             message.success("Category updated");
            //         } catch (err) {
            //             console.error(err);
            //             message.error("Failed to update category");

            //         }

            //         setOpen(false);
            //     };

            //     return (
            //         <div>
            //             <span
            //                 onClick={onEdit}
            //                 style={{ cursor: "pointer", }}
            //             >
            //                 <PlusOutlined />
            //             </span>

            //             <Modal className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`} open={open} title="Edit Category" onOk={save} onCancel={() => setOpen(false)}>
            //                 <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            //             </Modal>
            //         </div>
            //     );
            // },
            cellRenderer: (props) => {
                if (props.node.rowPinned || props.node.footer) return null;

                const [editing, setEditing] = React.useState(false);
                const [value, setValue] = React.useState(props.value || "");

                const [open, setOpen] = React.useState(false);
                const [category, setCategory] = React.useState("");

                const getRow = () =>
                    props.node.group
                        ? props.node.allLeafChildren?.[0]?.data
                        : props.node.data;

                const openModal = () => {
                    const row = getRow();
                    if (!row) return;
                    setCategory(row.category || "");
                    setOpen(true);
                };

                const saveFromModal = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, category);
                    setOpen(false);
                };


                const saveInline = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, value);
                    setEditing(false);
                };


                const saveApi = async (row, catValue) => {
                    const payloadForActivity = {
                        editType: "Categoty",
                        campaignid: row.campaignid,       // cents
                        Account: row.accountNumber,    // ✅ update *this* row’s account
                        campaignname: row.campaignname,
                        updatedBy: userdetails?.userName || "Unknown",
                        updatedUserEmail: userdetails.email,
                        updateType: row.category ? "Campain category updated" : "Campain category created",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: row.category ? `From ${row.category || "N/A"} to ${catValue}` : `Category added as ${catValue}`,
                    };
                    const payload = {
                        accountNumber: row.accountNumber,
                        campaignid: row.campaignid,
                        level: "campaign",
                        category: catValue,
                        activity: payloadForActivity,
                    };

                    const token = localStorage.getItem("token");

                    await apiClient.post(
                        "/UpdateCategoryAndStoreHistory",
                        payload,
                        { headers: { Authorization: token } }
                    );

                    setCampaignComments((prev) => {
                        const arr = [...prev];
                        const idx = arr.findIndex(
                            i =>
                                String(i.campaignid) === String(payload.campaignid) &&
                                String(i.Account) === String(payload.accountNumber) &&
                                i.level === "campaign"
                        );

                        if (idx >= 0) arr[idx].category = catValue;
                        else arr.push({
                            campaignid: payload.campaignid,
                            Account: payload.accountNumber,
                            level: "campaign",
                            category: catValue,
                        });

                        return arr;
                    });

                    commentsMap.set(
                        `${payload.campaignid}_${payload.accountNumber}_campaign`,
                        { category: catValue }
                    );

                    message.success("Category updated");
                };


                if (props.value && !editing) {
                    return (
                        // <span
                        //     onClick={() => setEditing(true)}
                        //     style={{ cursor: "pointer" }}
                        // >
                        //     {props.value}
                        // </span>
                        <Tooltip title={props.value}
                            overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                // fontWeight: 500,
                            }}>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing(true);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {props.value}
                            </span>
                        </Tooltip>
                    );
                }

                if (props.value && editing) {
                    return (
                        <Input
                            autoFocus
                            size="small"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onPressEnter={saveInline}
                            onBlur={saveInline}
                        />
                    );
                }

                return (
                    <>
                        <PlusOutlined
                            // onClick={openModal}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal();
                            }}
                            style={{ cursor: "pointer" }}
                        />

                        <Modal
                            open={open}
                            title="Edit Category"
                            onOk={saveFromModal}
                            onCancel={() => setOpen(false)}
                        >
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Modal>
                    </>
                );
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        }

        ,
        // from: {
        //     // headerName: 'Start',
        //     // field: 'from',
        //     // sortable: true,
        //     // minWidth: 110,
        //     // valueGetter: (params) => {
        //     //     // if (params.node.group) {
        //     //     //     const campaignName =
        //     //     //         params.node.groupData?.campaignname || params.node.key;
        //     //     //     const campaign = campaignMap.get(campaignName);
        //     //     //     return campaign && campaign.start
        //     //     //         ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //     //     //         : '-';
        //     //     // }
        //     //     // return '';
        //     //     if (params.node.group) {
        //     //         const campaignName =
        //     //             params.node.groupData?.campaignname || params.node.key;
        //     //         const campaign = campaignMap.get(campaignName);

        //     //         return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //     //     }
        //     //     return params.data?.from || null;
        //     // },
        //     // valueFormatter: (params) => {
        //     //     return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     // },
        //     // cellClassRules: {
        //     //     'hide-leaf-cell': (params) => !params.node.group,
        //     // },
        //     // suppressMenu: true,
        //     // menuTabs: [],
        //     // headerClass: 'hide-menu',
        //     headerName: 'Start',
        //     field: 'from',
        //     sortable: true,
        //     minWidth: 110,
        //     filter: "agDateColumnFilter",
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             if (cellValue == null) return -1;

        //             // Convert your cell value string to a Date
        //             const cellDate = new Date(cellValue);

        //             if (cellDate < filterLocalDateAtMidnight) return -1;
        //             if (cellDate > filterLocalDateAtMidnight) return 1;
        //             return 0;
        //         },
        //     },
        //     valueGetter: (params) => {
        //         // if (params.node.group) {
        //         //     const campaignName =
        //         //         params.node.groupData?.campaignname || params.node.key;
        //         //     const campaign = campaignMap.get(campaignName);
        //         //     return campaign && campaign.start
        //         //         ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //         //         : '-';
        //         // }
        //         // return '';
        //         if (params.node.group) {
        //             // const campaignName =
        //             //     params.node.groupData?.campaignname || params.node.key;
        //             const campaignName = params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";
        //             const campaignId = params.node?.childrenAfterGroup?.[0]?.data?.campaignid || "";

        //             const campaign = campaignMap.get(`${campaignName}_${campaignId}`);

        //             return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //         }
        //         return params.data?.from || null;
        //     },
        //     valueFormatter: (params) => {
        //         return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        // to: {
        //     // headerName: 'End',
        //     // field: 'to',
        //     // minWidth: 110,
        //     // valueGetter: (params) => {
        //     //     if (params.node.group) {
        //     //         const campaignName =
        //     //             params.node.groupData?.campaignname || params.node.key;
        //     //         const campaign = campaignMap.get(campaignName);
        //     //         return campaign && campaign.end
        //     //             ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //     //             : '-';
        //     //     }
        //     //     return params.data?.to || null;
        //     // },
        //     // cellClassRules: {
        //     //     'hide-leaf-cell': (params) => !params.node.group,
        //     // },
        //     // suppressMenu: true,
        //     // menuTabs: [],
        //     // headerClass: 'hide-menu',
        //     headerName: 'End',
        //     field: 'to',
        //     minWidth: 110,
        //     filter: "agDateColumnFilter",
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             if (cellValue == null) return -1;

        //             // Convert your cell value string to a Date
        //             const cellDate = new Date(cellValue);

        //             if (cellDate < filterLocalDateAtMidnight) return -1;
        //             if (cellDate > filterLocalDateAtMidnight) return 1;
        //             return 0;
        //         },
        //     },
        //     valueGetter: (params) => {
        //         if (params.node.group) {
        //             // const campaignName =
        //             //     params.node.groupData?.campaignname || params.node.key;
        //             // const campaign = campaignMap.get(campaignName);
        //             // return campaign && campaign.end
        //             //     ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //             //     : '-';
        //             const campaignName = params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";
        //             const campaignId = params.node?.childrenAfterGroup?.[0]?.data?.campaignid || params.node?.key || "";
        //             // console.log(params.node?.childrenAfterGroup?.[0], "childrenAfterGroup");
        //             // console.log(campaignName, "campaignName");
        //             // console.log(campaignId, "campaignId");

        //             const campaign = campaignMap.get(`${campaignName}_${campaignId}`);

        //             // console.log(campaign, "campaign");

        //             return campaign && campaign.end
        //                 ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //                 : '-';
        //         }
        //         return params.data?.to ? moment(params.data?.to, "YYYY-MM-DD").format("DD-MM-YYYY") : null;
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        from: {
            headerName: 'Start',
            field: 'from',
            sortable: true,
            minWidth: 110,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.start || null;
                } else {
                    dateStr = params.data?.from || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        to: {
            headerName: 'End',
            field: 'to',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue already Date from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.end || null;
                } else {
                    dateStr = params.data?.to || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        profitloss: {
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
                    return (revenue - spend) ? (revenue - spend).toFixed(2) : "" || "";
                }
                return '';
            },
            minWidth: 110,
            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },
            cellStyle: { fontWeight: 'bold' },
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        // date: {
        //     headerName: 'Date',
        //     field: 'date',
        //     minWidth: 110,
        //     sortable: true,
        //     // sort: "asc",
        //     filter: "agDateColumnFilter",
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             const dateAsString = cellValue;
        //             if (dateAsString == null) return -1;
        //             const dateParts = dateAsString.split("/");
        //             const cellDate = new Date(
        //                 Number(dateParts[2]),
        //                 Number(dateParts[1]) - 1,
        //                 Number(dateParts[0])
        //             );

        //             if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        //                 return 0;
        //             }

        //             if (cellDate < filterLocalDateAtMidnight) {
        //                 return -1;
        //             }

        //             if (cellDate > filterLocalDateAtMidnight) {
        //                 return 1;
        //             }
        //             return 0;
        //         },
        //     },
        // },
        date: {
            headerName: 'Date',
            field: 'date',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            // 🔥 Convert raw YYYY-MM-DD → real Date object
            valueGetter: (params) => {
                const dateStr = params.data?.date;
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            // 🔥 Display format only
            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
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
            filter: "agNumberColumnFilter", // Keep filter active
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Total amount spent",
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),
        },
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            // filter: "agNumberColumnFilter",
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),

        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            sortable: true,
            aggFunc: liveSpender,
            cellClassRules: {
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0,
            },
            // filter: "agNumberColumnFilter",
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Profit = Revenue - Spend",
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),

        },
        margin: {
            headerName: 'Margin',
            field: 'margin',
            minWidth: 100,
            valueGetter: getMargin,
            sortable: true,
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
            valueGetter: getCpcLc,
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
            headerTooltip: 'fblinkclicks',
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
            headerClass: 'hide-menu',
            minWidth: 180,
            spanRows: true,
            filter: "agTextColumnFilter",
            // hide: true,
            // rowGroup: true,
            // enableRowGroup: true,
            // pinned: 'left',
            valueGetter: (params) => {
                if (params.data) return params.data.adsetid;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.adsetid || null;
            },
        },
        campaignid: {
            headerName: 'CampaignId',
            field: 'campaignid',
            sortable: true,
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 180,
            spanRows: true,
            filter: "agTextColumnFilter",
            // hide: true,
            // rowGroup: true,
            // enableRowGroup: true,
            // pinned: 'left',
            valueGetter: (params) => {
                if (params.data) return params.data.campaignid;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.campaignid || null;
            },
        },
        timezone: {
            headerName: 'TimeZone',
            field: 'timezone',
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu'
        },
        history: {
            headerName: 'Activity',
            field: 'history',
            hide: true,
            minWidth: 90,
            sortable: false,
            filter: false,
            enableSorting: false,
            enableFilter: false,
            suppressMenu: true,
            cellRenderer: (params) => {
                return (
                    <div>
                        <HistoryOutlined />
                    </div>
                );
            },
        },
    };

    //campaign level live
    const columnDefsObject = {
        accountNumber: {
            headerName: 'Account',
            field: 'accountNumber',
            showWhenGrouped: true,
            minWidth: 170,
            filter: "agTextColumnFilter",
            valueGetter: (params) => {
                if (params.data) return params.data.accountNumber;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.accountNumber || null;
            },
            // tooltipValueGetter: (params) => {
            //     // ✅ Get value for both leaf & grouped rows
            //     if (params.data) return params.data.accountNumber;
            //     const firstChild = params.node?.childrenAfterGroup?.[0];
            //     return firstChild?.data?.accountNumber || '';
            // },
        },
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
            headerName: 'CampaignID',
            field: 'campaignname',
            resizable: true,
            sortable: true,
            // hide: true,
            minWidth: 180,
            spanRows: true,
            filter: "agTextColumnFilter",
            // hide: true,
            // rowGroup: true,
            // enableRowGroup: true,
            // pinned: 'left',
            valueGetter: (params) => {
                if (params.data) return params.data.campaignid;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.campaignid || null;
            },
        },
        cpm: {
            headerName: 'CPM',
            field: 'cpm',
            sortable: true,
            filter: "agNumberColumnFilter",
            minWidth: 90,
            headerTooltip: '(Spend/Impressions)*1000',
            valueGetter: getCpm,
            hide: false,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        filteration: {
            headerName: "Filteration",
            field: 'filteration',
            width: 115,
            sortable: true,
            valueGetter: getFilteration,
            valueFormatter: params => `${params.value || 0}%`,
            suppressMenu: true,
            filter: "agNumberColumnFilter",
            menuTabs: [],
            headerClass: 'hide-menu',
            hide: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
        },
        actions: {
            headerName: 'Budget',
            field: 'actions',
            minWidth: 90,
            sortable: false,
            filter: false,
            enableSorting: false,
            enableFilter: false,
            suppressMenu: true,
            // hide: !isYesterday(),
            // cellRenderer: (params) => {
            //     const [isModalVisible, setIsModalVisible] = useState(false);
            //     const [groupedData, setGroupedData] = useState([]);
            //     const [changeBudget, onChangeBudget] = useState();
            //     const [campaignActualSpend, setCampaignActualSpend] = useState({});

            //     const isGroupRow = !!params?.node?.groupData;
            //     let campaignId = isGroupRow ? params?.node?.allLeafChildren?.[0]?.data?.campaignid : params?.data?.campaignid;
            //     const campaignname = isGroupRow ? params?.node?.key : params?.data?.campaignname;

            //     useEffect(() => {
            //         if (!campaignId || !Array.isArray(allCampaignData)) return;
            //         const matchedCampaign = allCampaignData.find(c => c.campaignid === campaignId);
            //         if (matchedCampaign) {
            //             setCampaignActualSpend(matchedCampaign);
            //         }
            //     }, [campaignId, allCampaignData]);

            //     const onChangeSpendAndStatus = () => {
            //         if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return;
            //         const allLeafChildren = params.node?.allLeafChildren || [];
            //         const grouped = allLeafChildren.map(node => node.data) || [];
            //         setGroupedData(grouped);

            //         if (!campaignId || !campaignname) {
            //             message.error("Campaign info missing");
            //             return;
            //         }


            //         const matchedCampaign = params.context.allCampaignData.find(c => c.campaignid === campaignId);

            //         if (matchedCampaign) {
            //             const budget = parseFloat(
            //                 matchedCampaign?.campaign_budget?.daily_budget ||
            //                 matchedCampaign?.campaign_budget?.lifetime_budget ||
            //                 0
            //             ) / 100;

            //             onChangeBudget(budget);
            //             setCampaignActualSpend(matchedCampaign); // ✅ critical
            //         } else {
            //             onChangeBudget(undefined);
            //             setCampaignActualSpend({});
            //         }

            //         setIsModalVisible(true);
            //     };

            //     const handleOk = async () => {
            //         setIsModalVisible(false);
            //         const isArray = Array.isArray(groupedData);
            //         const campaignIdFinal = isArray ? groupedData?.[0]?.campaignid : groupedData?.campaignid;
            //         const campaignnameFinal = isArray ? groupedData?.[0]?.campaignname : groupedData?.campaignname;

            //         const payload = {
            //             campaignId: campaignIdFinal,
            //             budget: parseFloat(changeBudget) * 100,
            //             accountNumber: newaccount,
            //             campaignname: campaignnameFinal,
            //             updatedby: userdetails?.email,
            //         };

            //         if (!payload.campaignId) {
            //             message.error("Campaign ID missing. Cannot update budget.");
            //             return;
            //         }

            //         try {
            //             await apiClient.post('/update/campaign/budget', payload);
            //             message.success("Budget Updated Successfully");
            //             // setCampaignRefreshTrigger(prev => prev + 1);
            //             // changeRRefrst();
            //             params.context.setCampaignRefreshTrigger(prev => prev + 1);
            //             params.context.changeRRefrst();
            //         } catch (err) {
            //             console.error(err);
            //             message.error("Failed to update budget");
            //         }
            //     };

            //     if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return null;

            //     return (
            //         <div>
            //             {campaignActualSpend?.campaign_budget &&
            //                 (campaignActualSpend?.campaign_budget?.daily_budget != null ||
            //                     campaignActualSpend?.campaign_budget?.lifetime_budget != null) ? (
            //                 <DollarOutlined
            //                     style={{ cursor: 'pointer' }}
            //                     onClick={onChangeSpendAndStatus}
            //                 />
            //             ) : (
            //                 <Tooltip title="No budget set for this campaign">
            //                     <WarningOutlined style={{ color: '#FAAD14', fontSize: 16 }} />
            //                 </Tooltip>
            //             )}

            //             {isModalVisible && (
            //                 <Modal
            //                     title={Array.isArray(groupedData) ? groupedData?.[0]?.campaignname : groupedData?.campaignname}
            //                     open={isModalVisible}
            //                     onOk={handleOk}
            //                     onCancel={() => setIsModalVisible(false)}
            //                     width={600}
            //                     okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }}
            //                     className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
            //                 >
            //                     <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            //                         <div style={{ display: 'flex', }}>
            //                             <p>
            //                                 Budget Type:
            //                             </p>{" "}
            //                             <span style={{ fontWeight: 'normal' }}>
            //                                 {campaignActualSpend?.campaign_budget?.daily_budget !== null ? "Daily" :
            //                                     campaignActualSpend?.campaign_budget?.lifetime_budget !== null ? "Lifetime" : "Unknown"}
            //                             </span>
            //                         </div>

            //                         <Input
            //                             type="number"
            //                             value={changeBudget}
            //                             onChange={(e) => onChangeBudget(e.target.value)}
            //                             placeholder="Enter budget in USD"
            //                             className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
            //                         />

            //                         <div style={{ display: 'flex' }}>
            //                             <p>Campaign ID: </p>
            //                             <p>{campaignId}</p>
            //                         </div>
            //                     </div>
            //                 </Modal>
            //             )}
            //         </div>
            //     );
            // },

            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignActualSpend, setCampaignActualSpend] = useState({});
                const [hasBudget, setHasBudget] = useState(false);
                const [confirmLoading, setConfirmLoading] = useState(false);

                const isGroupRow = !!params?.node?.groupData;

                // campaign id + campaign name for this row/group
                const campaignId = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.campaignid
                    : params?.data?.campaignid;

                const campaignname = isGroupRow
                    ? params?.node?.key
                    : params?.data?.campaignname;

                // ✅ the *accountNumber of this row/group* (not the selected accounts list)
                const rowAccountNumber = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.accountNumber
                    : params?.data?.accountNumber;

                // const { allCampaignData } = params.context;

                // ✅ find the exact record for (campaignId, rowAccountNumber)
                useEffect(() => {
                    if (!campaignId || !rowAccountNumber || !Array.isArray(Camapignlevelstatus)) return;

                    const matched = Camapignlevelstatus.find(
                        c =>
                            String(c.campaign_id) === String(campaignId) &&
                            String(c.accountNumber) === String(rowAccountNumber)
                    );

                    setCampaignActualSpend(matched ?? {});
                    setHasBudget(
                        !!(
                            matched?.campaign_budget &&
                            (matched.campaign_budget.daily_budget != null ||
                                matched.campaign_budget.lifetime_budget != null)
                        )
                    );
                }, [campaignId, rowAccountNumber, Camapignlevelstatus?.length]);

                const onChangeSpendAndStatus = () => {
                    if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return;

                    const grouped = (params.node?.allLeafChildren || []).map(n => n.data);
                    setGroupedData(grouped.length ? grouped : (params.data ? [params.data] : []));

                    if (!campaignId || !campaignname) {
                        message.error("Campaign info missing");
                        return;
                    }

                    // Prefill from the matched record for *this* account
                    const b = campaignActualSpend?.campaign_budget;
                    const budgetCents = b?.daily_budget ?? b?.lifetime_budget ?? null;
                    onChangeBudget(budgetCents != null ? Number(budgetCents) / 100 : undefined);

                    setIsModalVisible(true);
                };

                const handleOk = async () => {

                    setConfirmLoading(true);
                    const target = Array.isArray(groupedData) && groupedData.length ? groupedData[0] : params.data;
                    const campaignIdFinal = target?.campaignid;
                    const campaignnameFinal = target?.campaignname;

                    const payloadForActivity = {
                        editType: "Budget",
                        campaignid: campaignIdFinal,       // cents
                        Account: String(rowAccountNumber),    // ✅ update *this* row’s account
                        campaignname: campaignnameFinal,
                        updatedBy: userdetails?.userName,
                        updatedUserEmail: userdetails?.email,
                        updateType: "Campaign budget updated",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: `From $${campaignActualSpend?.campaign_budget?.daily_budget != null ? (Number(campaignActualSpend?.campaign_budget?.daily_budget) / 100) : campaignActualSpend?.campaign_budget?.lifetime_budget != null ? (Number(campaignActualSpend?.campaign_budget?.lifetime_budget) / 100) : 0} to $${(Number(changeBudget))}`,
                        budgetType: campaignActualSpend?.campaign_budget?.daily_budget != null ? 'daily_budget' :
                            campaignActualSpend?.campaign_budget?.lifetime_budget != null ? 'lifetime_budget' : 'unknown',
                    }

                    const payload = {
                        campaignId: campaignIdFinal,
                        budget: Math.round(Number(changeBudget) * 100),         // cents
                        accountNumber: String(rowAccountNumber),    // ✅ update *this* row’s account
                        campaignname: campaignnameFinal,
                        updatedby: params.context?.userdetails?.email,
                        budgetType: campaignActualSpend?.campaign_budget?.daily_budget != null ? 'daily_budget' :
                            campaignActualSpend?.campaign_budget?.lifetime_budget != null ? 'lifetime_budget' : 'unknown',
                        activity: payloadForActivity,
                    };

                    if (!payload.campaignId || !payload.accountNumber) {
                        message.error("Campaign ID or account missing. Cannot update budget.");
                        return;
                    }

                    try {
                        await apiClient.post('/update/campaign/budget/history', payload);
                        message.success("Budget Updated Successfully");
                        setCamapignlevelstatus(prev => {
                            const updated = prev.map(item => {
                                if (
                                    String(item.campaign_id) === String(payload.campaignId) &&
                                    String(item.accountNumber) === String(payload.accountNumber)
                                ) {
                                    return {
                                        ...item,
                                        campaign_budget: {
                                            ...item.campaign_budget,
                                            daily_budget: String(payload.budget),
                                        },
                                    };
                                }
                                return item;
                            });
                            return updated;
                        })
                        setConfirmLoading(false);
                        setIsModalVisible(false);
                        // params.context.setCampaignRefreshTrigger(prev => prev + 1);
                        // params.context.changeRRefrst();
                    } catch (err) {
                        setConfirmLoading(false);
                        console.error(err);
                        message.error("Failed to update budget");
                    }
                };

                if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return null;

                return (
                    <div>
                        {hasBudget ? (
                            <DollarOutlined style={{ cursor: 'pointer' }} onClick={onChangeSpendAndStatus} />
                        ) : (
                            <Tooltip title="No budget set for this campaign">
                                <WarningOutlined style={{ color: '#FAAD14', fontSize: 16 }} />
                            </Tooltip>
                        )}

                        {isModalVisible && (
                            <Modal
                                title={
                                    Array.isArray(groupedData) && groupedData.length
                                        ? groupedData[0]?.campaignname
                                        : campaignname
                                }
                                open={isModalVisible}
                                onOk={handleOk}
                                onCancel={() => setIsModalVisible(false)}
                                width={600}
                                okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }}
                                className={`custom-modal ${params.context?.theme === 'dark' ? 'dark-theme-modal' : ''}`}
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div style={{ display: 'flex' }}>
                                        <p>Budget Type:&nbsp;</p>
                                        <span style={{ fontWeight: 'normal' }}>
                                            {campaignActualSpend?.campaign_budget?.daily_budget != null
                                                ? 'Daily'
                                                : campaignActualSpend?.campaign_budget?.lifetime_budget != null
                                                    ? 'Lifetime'
                                                    : 'Unknown'}
                                        </span>
                                    </div>

                                    <Input
                                        type="number"
                                        value={changeBudget}
                                        onChange={(e) => onChangeBudget(e.target.value)}
                                        placeholder="Enter budget in USD"
                                        className={params.context?.theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                    />

                                    <div style={{ display: 'flex' }}>
                                        <p>Campaign ID:&nbsp;</p>
                                        <p>{campaignId}</p>
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
            filter: 'agTextColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            },
            suppressMenu: true,

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
        // from: {
        //     headerName: 'Start',
        //     field: 'from',
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //       if (params.node.group) {
        //         const campaignName =
        //           params.node.groupData?.campaignname || params.node.key;
        //         return moment(campaignMap.get(campaignName), "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
        //       }
        //       return '';
        //     },
        //     cellClassRules: {
        //       'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        // },
        category: {
            headerName: 'Category',
            field: 'category',
            minWidth: 110,
            sortable: true,
            // filter: 'agSetColumnFilter',
            filter: "agTextColumnFilter",

            valueFormatter: (params) => {
                if (!params.value) return '';
                return params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase();
            },


            valueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }


                return capitalize(params.data?.category);
            },

            // ✅ Filter uses same logic as valueGetter
            filterValueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ Include leaf rows in filtering
                return capitalize(params.data?.category);
            },

            // ✅ Dynamic filter list (from both grouped + leaf rows)
            filterParams: {
                values: (params) => {
                    const uniqueCategories = new Set();

                    params.api.forEachNode((node) => {
                        const capitalize = (val) =>
                            val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                        if (node.group) {
                            const firstChild = node.allLeafChildren?.[0];
                            const account = firstChild?.data?.accountNumber;
                            const campaignName = firstChild?.data?.campaignid;
                            const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                            const category = capitalize(campaign?.category);
                            if (category) uniqueCategories.add(category);
                        } else {
                            const category = capitalize(node.data?.category);
                            if (category) uniqueCategories.add(category);
                        }
                    });

                    // params.success(Array.from(uniqueCategories));
                    params.success && params.success(Array.from(uniqueCategories));
                },
            },
            comparator: (valueA, valueB, nodeA, nodeB) => {
                const isGroupA = nodeA?.group;
                const isGroupB = nodeB?.group;
                if (isGroupA && isGroupB) {
                    return valueA?.localeCompare?.(valueB) ?? 0;
                }
                // sort normally for leaf nodes
                return valueA?.localeCompare?.(valueB) ?? 0;
            },


            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group && !params.value,
            },
            // cellRenderer: (props) => {
            //     if (props.node.rowPinned || props.node.footer) return "";
            //     if (props.value) return props.value;

            //     const isGroupRow = !!props?.node?.groupData;

            //     // campaign id + campaign name for this row/group
            //     const campaignId = isGroupRow
            //         ? props?.node?.allLeafChildren?.[0]?.data?.campaignid
            //         : props?.data?.campaignid;

            //     // ✅ the *accountNumber of this row/group* (not the selected accounts list)
            //     const rowAccountNumber = isGroupRow
            //         ? props?.node?.allLeafChildren?.[0]?.data?.accountNumber
            //         : props?.data?.accountNumber;

            //     const [open, setOpen] = useState(false);
            //     const [category, setCategory] = useState("");
            //     const [row, setRow] = useState(null);

            //     useEffect(() => {
            //         if (!campaignId || !rowAccountNumber) return;
            //         // const matchedCampaign = allCampaignData.find(c => c.campaign_id === campaignId);
            //         // const matchedAdset = matchedCampaign?.adsets?.find(ad => ad.adset_id === initialAdsetId);
            //         // const matchedAdset = Camapignlevelstatus.find(
            //         //     (adset) => adset.campaignid === campaignId && adset.adset_id === initialAdsetId
            //         // );
            //         const matchedAdset = campaignComments
            //             .find(item =>
            //                 String(item.campaignid) === String(campaignId) &&
            //                 String(item.Account) === String(rowAccountNumber) &&
            //                 String(item.level) === "campaign"
            //             );
            //         if (matchedAdset) {
            //             setCategory(matchedAdset?.category || "");
            //         }
            //     }, [campaignComments]);

            //     const getRow = () => {
            //         return props.node.group
            //             ? props.node.allLeafChildren?.[0]?.data
            //             : props.node.data;
            //     };

            //     const onEdit = () => {
            //         const r = getRow();
            //         setRow(r);
            //         setCategory(r?.category || "");
            //         setOpen(true);
            //     };

            //     const save = async () => {
            //         if (!row) return;

            //         const payload = {
            //             accountNumber: row.accountNumber,
            //             campaignid: row.campaignid,
            //             level: "campaign",
            //             category,
            //         };

            //         try {
            //             const token = localStorage.getItem("token");

            //             await apiClient.post(
            //                 "/UpdateCategoryNew",
            //                 payload,
            //                 { headers: { Authorization: token } }
            //             );

            //             setCampaignComments((prev) => {
            //                 const arr = [...prev];
            //                 const idx = arr.findIndex(
            //                     (i) =>
            //                         i.campaignid == payload.campaignid &&
            //                         i.Account == payload.accountNumber &&
            //                         i.level == "campaign"
            //                 );
            //                 if (idx >= 0) {
            //                     arr[idx].category = payload.category;
            //                 } else {
            //                     arr.push({
            //                         campaignid: payload.campaignid,
            //                         Account: payload.accountNumber,
            //                         level: "campaign",
            //                         category: payload.category,
            //                     });
            //                 }
            //                 return arr;
            //             });


            //             const key = `${payload.campaignid}_${payload.accountNumber}_campaign`;
            //             commentsMap.set(key, { category: payload.category });
            //             message.success("Category updated");
            //         } catch (err) {
            //             console.error(err);
            //             message.error("Failed to update category");

            //         }

            //         setOpen(false);
            //     };

            //     return (
            //         <div>
            //             <span
            //                 onClick={onEdit}
            //                 style={{ cursor: "pointer", }}
            //             >
            //                 <PlusOutlined />
            //             </span>

            //             <Modal className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`} open={open} title="Edit Category" onOk={save} onCancel={() => setOpen(false)}>
            //                 <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            //             </Modal>
            //         </div>
            //     );
            // },

            cellRenderer: (props) => {
                if (props.node.rowPinned || props.node.footer) return null;

                const [editing, setEditing] = React.useState(false);
                const [value, setValue] = React.useState(props.value || "");

                const [open, setOpen] = React.useState(false);
                const [category, setCategory] = React.useState("");

                const getRow = () =>
                    props.node.group
                        ? props.node.allLeafChildren?.[0]?.data
                        : props.node.data;

                const openModal = () => {
                    const row = getRow();
                    if (!row) return;
                    setCategory(row.category || "");
                    setOpen(true);
                };

                const saveFromModal = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, category);
                    setOpen(false);
                };


                const saveInline = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, value);
                    setEditing(false);
                };


                const saveApi = async (row, catValue) => {
                    const payloadForActivity = {
                        editType: "Categoty",
                        campaignid: row.campaignid,
                        Account: row.accountNumber,
                        campaignname: row.campaignname,
                        updatedBy: userdetails?.userName || "Unknown",
                        updatedUserEmail: userdetails.email,
                        updateType: row.category ? "Campain category updated" : "Campain category created",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: row.category ? `From ${row.category || "N/A"} to ${catValue}` : `Category added as ${catValue}`,
                    }
                    const payload = {
                        accountNumber: row.accountNumber,
                        campaignid: row.campaignid,
                        level: "campaign",
                        category: catValue,
                        activity: payloadForActivity,
                    };

                    const token = localStorage.getItem("token");

                    await apiClient.post(
                        "/UpdateCategoryAndStoreHistory",
                        payload,
                        { headers: { Authorization: token } }
                    );

                    setCampaignComments((prev) => {
                        const arr = [...prev];
                        const idx = arr.findIndex(
                            i =>
                                String(i.campaignid) === String(payload.campaignid) &&
                                String(i.Account) === String(payload.accountNumber) &&
                                i.level === "campaign"
                        );

                        if (idx >= 0) arr[idx].category = catValue;
                        else arr.push({
                            campaignid: payload.campaignid,
                            Account: payload.accountNumber,
                            level: "campaign",
                            category: catValue,
                        });

                        return arr;
                    });

                    commentsMap.set(
                        `${payload.campaignid}_${payload.accountNumber}_campaign`,
                        { category: catValue }
                    );

                    message.success("Category updated");
                };


                if (props.value && !editing) {
                    return (

                        // <span
                        //     onClick={() => setEditing(true)}
                        //     style={{ cursor: "pointer" }}
                        // >
                        //     {props.value}
                        // </span>
                        <Tooltip title={props.value}
                            overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                // fontWeight: 500,
                            }}>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing(true);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {props.value}
                            </span>
                        </Tooltip>

                    );
                }

                if (props.value && editing) {
                    return (
                        <Input
                            autoFocus
                            size="small"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onPressEnter={saveInline}
                            onBlur={saveInline}
                        />
                    );
                }

                return (
                    <>
                        <PlusOutlined
                            // onClick={openModal}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal();
                            }}
                            style={{ cursor: "pointer" }}
                        />

                        <Modal
                            open={open}
                            title="Edit Category"
                            onOk={saveFromModal}
                            onCancel={() => setOpen(false)}
                        >
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Modal>
                    </>
                );
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        // from: {
        //     headerName: 'Start',
        //     field: 'from',
        //     sortable: true,
        //     minWidth: 110,
        //     filter: "agDateColumnFilter",
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             if (cellValue == null) return -1;

        //             // Convert your cell value string to a Date
        //             const cellDate = new Date(cellValue);

        //             if (cellDate < filterLocalDateAtMidnight) return -1;
        //             if (cellDate > filterLocalDateAtMidnight) return 1;
        //             return 0;
        //         },
        //     },
        //     valueGetter: (params) => {
        //         // if (params.node.group) {
        //         //     const campaignName =
        //         //         params.node.groupData?.campaignname || params.node.key;
        //         //     const campaign = campaignMap.get(campaignName);
        //         //     return campaign && campaign.start
        //         //         ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //         //         : '-';
        //         // }
        //         // return '';
        //         if (params.node.group) {
        //             // const campaignName =
        //             //     params.node.groupData?.campaignname || params.node.key;
        //             const campaignName = params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";
        //             const campaignId = params.node?.childrenAfterGroup?.[0]?.data?.campaignid || params.node?.key || "";

        //             const campaign = campaignMap.get(`${campaignName}_${campaignId}`);

        //             return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //         }
        //         return params.data?.from || null;
        //     },
        //     valueFormatter: (params) => {
        //         return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        from: {
            headerName: 'Start',
            field: 'from',
            sortable: true,
            minWidth: 110,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.start || null;
                } else {
                    dateStr = params.data?.from || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        // to: {
        //     headerName: 'End',
        //     field: 'to',
        //     minWidth: 110,
        //     filter: "agDateColumnFilter",
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             if (cellValue == null) return -1;

        //             // Convert your cell value string to a Date
        //             const cellDate = new Date(cellValue);

        //             if (cellDate < filterLocalDateAtMidnight) return -1;
        //             if (cellDate > filterLocalDateAtMidnight) return 1;
        //             return 0;
        //         },
        //     },
        //     valueGetter: (params) => {
        //         if (params.node.group) {
        //             // const campaignName =
        //             //     params.node.groupData?.campaignname || params.node.key;
        //             // const campaign = campaignMap.get(campaignName);
        //             // return campaign && campaign.end
        //             //     ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //             //     : '-';
        //             const campaignName = params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";
        //             const campaignId = params.node?.childrenAfterGroup?.[0]?.data?.campaignid || params.node?.key || "";
        //             // console.log(params.node?.childrenAfterGroup?.[0], "childrenAfterGroup");
        //             // console.log(campaignName, "campaignName");
        //             // console.log(campaignId, "campaignId");

        //             const campaign = campaignMap.get(`${campaignName}_${campaignId}`);

        //             // console.log(campaign, "campaign");

        //             return campaign && campaign.end
        //                 ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //                 : '-';
        //         }
        //         return params.data?.to ? moment(params.data?.to, "YYYY-MM-DD").format("DD-MM-YYYY") : null;
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        to: {
            headerName: 'End',
            field: 'to',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue already Date from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.end || null;
                } else {
                    dateStr = params.data?.to || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        profitloss: {
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
                    return (revenue - spend) ? (revenue - spend).toFixed(2) : "" || "";
                }
                return '';
            },
            minWidth: 110,
            filter: "agNumberColumnFilter",
            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },
            cellStyle: { fontWeight: 'bold' },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        // date: {
        //     headerName: 'Date',
        //     field: 'date',
        //     minWidth: 110,
        //     sortable: true,
        //     // sort: "asc",
        //     filter: "agDateColumnFilter",
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             if (cellValue == null) return -1;

        //             // Convert your cell value string to a Date
        //             const cellDate = new Date(cellValue);

        //             if (cellDate < filterLocalDateAtMidnight) return -1;
        //             if (cellDate > filterLocalDateAtMidnight) return 1;
        //             return 0;
        //         },
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        //     // filterParams: {
        //     //     comparator: (filterLocalDateAtMidnight, cellValue) => {
        //     //         const dateAsString = cellValue;
        //     //         if (dateAsString == null) return -1;
        //     //         const dateParts = dateAsString.split("/");
        //     //         const cellDate = new Date(
        //     //             Number(dateParts[2]),
        //     //             Number(dateParts[1]) - 1,
        //     //             Number(dateParts[0])
        //     //         );

        //     //         if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        //     //             return 0;
        //     //         }

        //     //         if (cellDate < filterLocalDateAtMidnight) {
        //     //             return -1;
        //     //         }

        //     //         if (cellDate > filterLocalDateAtMidnight) {
        //     //             return 1;
        //     //         }
        //     //         return 0;
        //     //     },
        //     // },
        // },
        date: {
            headerName: 'Date',
            field: 'date',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            // 🔥 Convert raw YYYY-MM-DD → real Date object
            valueGetter: (params) => {
                const dateStr = params.data?.date;
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            // 🔥 Display format only
            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
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
            filter: "agNumberColumnFilter", // Keep filter active
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Total amount spent",
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),
        },
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            // filter: "agNumberColumnFilter",
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterValueGetter: (params) => parseFloat(params.data.revenue || 0),

        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            sortable: true,
            aggFunc: liveSpender,
            cellClassRules: {
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0,
            },
            // filter: "agNumberColumnFilter",
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Profit = Revenue - Spend",
            filterValueGetter: (params) => parseFloat(params.data.profit || 0),

        },
        margin: {
            headerName: 'Margin',
            field: 'margin',
            minWidth: 100,
            valueGetter: getMargin,
            sortable: true,
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
            valueGetter: getCpcLc,
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
            headerTooltip: 'fblinkclicks',
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
            headerClass: 'hide-menu',
            width: 500,
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
        },
        timezone: {
            headerName: 'TimeZone',
            field: 'timezone',
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu'
        },
        history: {
            headerName: 'Activity',
            field: 'history',
            minWidth: 90,
            sortable: false,
            filter: false,
            enableSorting: false,
            enableFilter: false,
            suppressMenu: true,
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignActualSpend, setCampaignActualSpend] = useState({});
                const [hasBudget, setHasBudget] = useState(false);
                const [confirmLoading, setConfirmLoading] = useState(false);

                const isGroupRow = !!params?.node?.groupData;

                // campaign id + campaign name for this row/group
                const campaignId = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.campaignid
                    : params?.data?.campaignid;

                const campaignname = isGroupRow
                    ? params?.node?.key
                    : params?.data?.campaignname;

                // ✅ the *accountNumber of this row/group* (not the selected accounts list)
                const rowAccountNumber = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.accountNumber
                    : params?.data?.accountNumber;



                if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return null;

                return (
                    <div>
                        <HistoryOutlined onClick={() => {
                            setHistoryOpen(true);
                            setSelectedCampaignIdForHistory(campaignId);
                            setSelectedAccountForHistory(rowAccountNumber)
                        }} />
                    </div>
                );
            },
        },
    };

    const columnDefsObjectAdsetLevelDaily = {
        accountNumber: {
            headerName: 'Account',
            field: 'accountNumber',
            showWhenGrouped: true,
            minWidth: 170,
            filter: "agTextColumnFilter",
            valueGetter: (params) => {
                if (params.data) return params.data.accountNumber;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.accountNumber || null;
            },
        },
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
        cpm: {
            headerName: 'CPM',
            field: 'cpm',
            sortable: true,
            filter: "agNumberColumnFilter",
            minWidth: 90,
            headerTooltip: '(Spend/Impressions)*1000',
            valueGetter: getCpm,
            hide: false,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        filteration: {
            headerName: "Filteration",
            field: 'filteration',
            width: 115,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueGetter: getFilteration,
            valueFormatter: params => `${params.value || 0}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            hide: false,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
        },
        // actions: {
        //     headerName: 'Actions',
        //     field: 'actions',
        //     minWidth: 90,
        //     sortable: false,    // Ensure sorting is disabled
        //     filter: false,      // Ensure filtering is disabled
        //     enableSorting: false,  // Disable sorting at the column level
        //     enableFilter: false,
        //     hide: false,
        //     suppressMenu: true,
        //     hide: !isYesterday(),
        //     cellRenderer: (params) => {
        //         const [isModalVisible, setIsModalVisible] = useState(false);
        //         const [newgroupedData, setNewGroupedData] = useState([]);
        //         const [groupedData, setGroupedData] = useState([]);
        //         const [changeBudget, onChangeBudget] = useState();
        //         const [campaignStatus, setCampaignStatus] = useState(true);
        //         const [campaignActualSpend, setCampaignActualSpend] = useState({});

        //         const onChangeSpendAndStatus = async () => {
        //             // Check if it's a group footer row (for groupIncludeFooter)
        //             if (params?.node?.footer) {
        //                 // console.log("This is a groupIncludeFooter row. Modal will not open.");
        //                 return; // Prevent modal from opening for group footer rows
        //             }

        //             // Ensure allLeafChildren exists and is an array before proceeding
        //             const allLeafChildren = params.node?.allLeafChildren || [];
        //             setNewGroupedData(groupedData);

        //             // Fetch all the rows under the current group
        //             const groupedData = allLeafChildren.map(node => node.data) || [];
        //             const campaignId = groupedData[0]?.campaignid;

        //             // Only show the modal if there is data (groupedData length is greater than 0)
        //             if (groupedData.length > 0) {
        //                 const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
        //                 const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
        //                 if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
        //                     setGroupedData(getCampaignResponse.data);
        //                     setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
        //                     onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
        //                 }
        //                 if(getCampaignActualSpend.status === 200){
        //                     // console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
        //                     setCampaignActualSpend(getCampaignActualSpend.data);
        //                 }

        //                 else {
        //                     setGroupedData(groupedData);
        //                     // console.log("dailyadd");
        //                 }
        //                 // Set the grouped data for the modal
        //                 setIsModalVisible(true); // Show the modal for non-footer rows
        //             }
        //         };

        //         const handleOk = async () => {
        //             setIsModalVisible(false); // Close the modal
        //             const object = {
        //                 campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
        //                 adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
        //                 campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
        //                 usercommit: userdetails?.email,
        //                 accountNumber: newaccount,
        //                 budget: changeBudget * 100,
        //                 status: campaignStatus
        //             };
        //             // console.log(object);
        //             const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
        //             const responseData = requestResponse.data;
        //             // console.log(responseData, "response");
        //             message.success("Budget and Status Updated");
        //             changeRRefrst();
        //         };

        //         const handleCancel = () => {
        //             setIsModalVisible(false);
        //             // console.log(changeBudget); // Close the modal
        //         };

        //         const getTotalSpend = (data) => {
        //             if (!data || data.length === 0) return 0;
        //             const total = data.reduce((total, item) => {
        //                 return total + (parseFloat(item?.spend) || 0);
        //             }, 0);
        //             return Math.round(total * 100) / 100; // Round to 2 decimal places
        //         };

        //         const onChangeBudgetValue = event => {
        //             onChangeBudget(event.target.value)
        //         }
        //         const onChangeCampaignStatus = async () => {
        //             const apiEndpoint = campaignStatus
        //                 ? 'https://prodapis.adsgoat.in/campaignStatusPause/' // Pause campaign
        //                 : 'https://prodapis.adsgoat.in/campaignStatusActive/'; // Activate campaign

        //             try {
        //                 const response = await axios.post(apiEndpoint, 
        //                     { campaignId: groupedData[0]?.campaignid }, 
        //                     { headers: { Authorization: token } }
        //                 );
        //                 if (response.status === 200) {
        //                     message.success(`Campaign ${groupedData[0]?.campaignid} status updated to ${campaignStatus ? 'Paused' : 'Active'}`);
        //                     setCampaignStatus((prev) => !prev); // Toggle the status
        //                 } else {
        //                     message.error('Failed to update campaign status.');
        //                 }
        //             } catch (error) {
        //                 console.error('Error updating campaign status:', error);
        //                 message.error('Error updating campaign status.');
        //             }
        //         };

        //         return (
        //             <div>
        //                 <div onClick={onChangeSpendAndStatus}>
        //                     <span>{params.value || "..."}</span> {/* Fallback to '...' if status is not available */}
        //                 </div>
        //                 {/* Modal should only be shown for non-footer rows and when groupedData length is greater than 0 */}
        //                 {isModalVisible && (
        //                     <Modal
        //                         title={groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignname : groupedData?.campaignname}
        //                         visible={isModalVisible}
        //                         onOk={handleOk}
        //                         onCancel={handleCancel}
        //                         width={600}  // Set a custom width for the modal
        //                         style={{ padding: '20px' }}  // Adjust body padding
        //                         okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }} 
        //                     >
        //                         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        //                             <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        //                                 <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
        //                                 <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#91C25F"}} onChange={onChangeCampaignStatus} />
        //                             </div>

        //                             {/* Input Field */}
        //                             <div style={{ display: 'flex', flexDirection: 'column' }}>
        //                                 <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
        //                                 <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
        //                             </div>

        //                             {/* Campaign ID */}
        //                             <div style={{ display: 'flex', flexDirection: 'column' }}>
        //                                 <Typography.Text strong>Campaign ID:</Typography.Text>
        //                                 <p>{campaignActualSpend?.id}</p>
        //                             </div>
        //                         </div>
        //                     </Modal>
        //                 )}
        //             </div>
        //         );
        //     },
        //     filterParams: { filterEnabled: false },

        // },
        actions: {
            headerName: 'Budget',
            field: 'actions',
            minWidth: 90,
            sortable: false,
            filter: false,
            enableSorting: false,
            enableFilter: false,
            suppressMenu: true,
            // hide: !isYesterday(),
            cellRenderer: (params) => {
                const {
                    // allCampaignData,
                    setCampaignRefreshTrigger,
                    changeRRefrst,
                    newaccount,
                    userdetails,
                    theme
                } = params.context;

                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [bidAmount, setBidAmount] = useState();
                const [adsetId, setAdsetId] = useState(null);
                const [adsetInfo, setAdsetInfo] = useState(null);
                const [confirmLoading, setConfirmLoading] = useState(false);
                //   const [, forceRerender] = useState(0);

                const isGroupRow = !!params?.node?.groupData;
                let campaignId = null;
                let initialAdsetId = null;
                let accountNumber = null;

                if (isGroupRow) {
                    const children = params?.node?.allLeafChildren || [];
                    campaignId = children[0]?.data?.campaignid;
                    initialAdsetId = children[0]?.data?.adsetid;
                    accountNumber = children[0]?.data?.accountNumber;
                } else {
                    campaignId = params?.data?.campaignid;
                    initialAdsetId = params?.data?.adsetid;
                    accountNumber = params?.data?.accountNumber;
                }

                const campaignname = isGroupRow
                    ? params?.node?.key
                    : params?.data?.campaignname;

                console.log("campaignId ar:", campaignId);

                useEffect(() => {
                    if (!campaignId || !initialAdsetId || !Array.isArray(Camapignlevelstatus)) return;
                    // const matchedCampaign = allCampaignData.find(c => c.campaign_id === campaignId);
                    // const matchedAdset = matchedCampaign?.adsets?.find(ad => ad.adset_id === initialAdsetId);
                    // const matchedAdset = Camapignlevelstatus.find(
                    //     (adset) => adset.campaignid === campaignId && adset.adset_id === initialAdsetId
                    // );
                    // if (matchedAdset) {
                    //     setAdsetInfo(matchedAdset);
                    // }
                    const matchedAdset = Camapignlevelstatus
                        .find(item =>
                            String(item.campaign_id) === String(campaignId) &&
                            String(item.accountNumber) === String(accountNumber)
                        )?.adsets.find(adset =>
                            String(adset.adset_id) === String(initialAdsetId)
                        );
                    if (matchedAdset?.budget) {
                        if (Number(matchedAdset.budget.daily_budget) === 0) {
                            matchedAdset.budget.daily_budget = null;
                        }
                        if (Number(matchedAdset.budget.lifetime_budget) === 0) {
                            matchedAdset.budget.lifetime_budget = null;
                        }
                    }
                    if (matchedAdset) {
                        setAdsetInfo(matchedAdset);
                    }
                }, [campaignId, initialAdsetId, Camapignlevelstatus]);

                const onChangeSpendAndStatus = async () => {
                    try {
                        const grouped = params?.node?.allLeafChildren?.map(node => node.data) || [];
                        const clickedAdsetId = grouped?.[0]?.adsetid || initialAdsetId;
                        //   const clickedCampaignId = grouped?.[0]?.campaignid || campaignId;

                        setGroupedData(grouped);
                        setAdsetId(clickedAdsetId);

                        const campaign = params.context.allCampaignData.find(c => c.campaign_id === campaignId);

                        // const adset = allCampaignData.find(
                        //     (adset) => adset.campaignid === campaignId && adset.adset_id === clickedAdsetId
                        // );

                        const adset = Camapignlevelstatus
                            .find(item =>
                                String(item.campaign_id) === String(campaignId) &&
                                String(item.accountNumber) === String(accountNumber)
                            )?.adsets.find(adset =>
                                String(adset.adset_id) === String(initialAdsetId)
                            );
                        if (adset?.budget) {
                            if (Number(adset.budget.daily_budget) === 0) {
                                adset.budget.daily_budget = null;
                            }
                            if (Number(adset.budget.lifetime_budget) === 0) {
                                adset.budget.lifetime_budget = null;
                            }
                        }

                        if (adset) {
                            const budget = parseFloat(adset?.budget?.daily_budget || adset?.budget?.lifetime_budget || 0) / 100;
                            onChangeBudget(budget);
                            setBidAmount(adset?.bid_amount / 100);
                            setAdsetInfo(adset);
                            setIsModalVisible(true);
                        } else {
                            message.error("Adset not found in backend response.");
                        }

                        //   setIsModalVisible(true);
                    } catch (err) {
                        console.error("❌ Failed to fetch adset:", err);
                        message.error("Failed to fetch adset data");
                    }
                };

                if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) {
                    return null;
                }

                const handleOk = async () => {
                    // setIsModalVisible(false);
                    const campaignname = groupedData?.[0]?.campaignname;
                    const adsetname = groupedData?.[0]?.adsetname;

                    console.log("Submitting budget change:", groupedData);

                    const campaignActualSpend = Camapignlevelstatus
                        .find(item =>
                            String(item.campaign_id) === String(campaignId) &&
                            String(item.accountNumber) === String(accountNumber)
                        )?.adsets.find(adset =>
                            String(adset.adset_id) === String(initialAdsetId)
                        );
                    if (campaignActualSpend?.budget) {
                        if (Number(campaignActualSpend.budget.daily_budget) === 0) {
                            campaignActualSpend.budget.daily_budget = null;
                        }
                        if (Number(campaignActualSpend.budget.lifetime_budget) === 0) {
                            campaignActualSpend.budget.lifetime_budget = null;
                        }
                    }
                    const bidAmountValue = Math.round(parseFloat(bidAmount) * 100);
                    const changeBudgetValue = Math.round(parseFloat(changeBudget) * 100);
                    const previousBudget = campaignActualSpend?.budget?.daily_budget != null ? Math.round(parseFloat(campaignActualSpend?.budget?.daily_budget)) :
                        campaignActualSpend?.budget?.lifetime_budget != null ? Math.round(parseFloat(campaignActualSpend?.budget?.lifetime_budget)) : 0;
                    const payload = {
                        adsetId,
                        campaignId,
                        accountNumber: accountNumber,
                        campaignname,
                        adsetname,
                        updatedby: userdetails?.email,
                        budgetType: campaignActualSpend?.budget?.daily_budget != null ? 'daily_budget' :
                            campaignActualSpend?.budget?.lifetime_budget != null ? 'lifetime_budget' : 'unknown',
                    };

                    if (
                        changeBudget !== undefined &&
                        changeBudget !== '' &&
                        !isNaN(changeBudget) &&
                        parseFloat(changeBudget) > 0 &&
                        changeBudgetValue !== previousBudget
                    ) {
                        payload.budget = Math.round(parseFloat(changeBudget) * 100);
                        payload.activity = {
                            editType: "Budget",
                            campaignid: campaignId,       // cents
                            adsetid: adsetId,
                            Account: String(accountNumber),    // ✅ update *this* row’s account
                            campaignname: campaignname,
                            adsetname: adsetname,
                            updatedBy: userdetails?.userName,
                            updatedUserEmail: userdetails?.email,
                            updateType: "Adset budget updated",
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                            updateDetail: `From $${campaignActualSpend?.budget?.daily_budget != null ? (Number(campaignActualSpend?.budget?.daily_budget) / 100) : campaignActualSpend?.budget?.lifetime_budget != null ? (Number(campaignActualSpend?.budget?.lifetime_budget) / 100) : 0} to $${(Number(changeBudget))}`,
                            budgetType: campaignActualSpend?.budget?.daily_budget != null ? 'daily_budget' :
                                campaignActualSpend?.budget?.lifetime_budget != null ? 'lifetime_budget' : 'unknown',
                        }
                    }

                    if (
                        bidAmount !== undefined &&
                        bidAmount !== '' &&
                        !isNaN(bidAmount) &&
                        parseFloat(bidAmount) * 100 >= 1 &&
                        bidAmountValue !== campaignActualSpend?.bid_amount
                    ) {
                        // payload.bidAmount = parseFloat(bidAmount) * 100;
                        payload.bidAmount = Math.round(parseFloat(bidAmount) * 100);
                        payload.bidactivity = {
                            editType: "Bid",
                            campaignid: campaignId,       // cents
                            adsetid: adsetId,
                            Account: String(accountNumber),    // ✅ update *this* row’s account
                            campaignname: campaignname,
                            adsetname: adsetname,
                            updatedBy: userdetails?.userName,
                            updatedUserEmail: userdetails?.email,
                            updateType: "Adset bid strategy updated",
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                            updateDetail: `From $${(Number(campaignActualSpend?.bid_amount) / 100)} to $${Math.round(bidAmount * 100) / 100}`,
                        }
                    }

                    const hasBudget = Object.prototype.hasOwnProperty.call(payload, 'budget');
                    const hasBidAmount = Object.prototype.hasOwnProperty.call(payload, 'bidAmount');

                    if (!hasBudget && !hasBidAmount) {
                        message.warning("Please enter Budget and/or Bid Amount before submitting.");
                        return;
                    }


                    try {
                        // await apiClient.post('/update/adset/budget', payload);
                        // message.success("Adset Budget and/or Bid Updated");
                        // setCampaignRefreshTrigger(prev => prev + 1); // ✅ Refresh campaign + adset data

                        // changeRRefrst();
                        setConfirmLoading(true);
                        const newResponse = await apiClient.post('/update/adset/budget/history', payload);
                        message.success("Adset Budget and/or Bid Updated");
                        if (newResponse.status === 200 || newResponse.status === 201) {
                            setConfirmLoading(false);
                            setCamapignlevelstatus(prevStatus =>
                                prevStatus.map(item =>
                                    String(item.campaign_id) === String(payload.campaignId) &&
                                        String(item.accountNumber) === String(payload.accountNumber)
                                        ? {
                                            ...item,
                                            adsets: item.adsets.map(adset =>
                                                String(adset.adset_id) === String(payload.adsetId)
                                                    ? {
                                                        ...adset,
                                                        ...(payload.budget !== undefined && {
                                                            budget: {
                                                                ...adset.budget,
                                                                daily_budget: String(payload.budget), // ✅ update daily_budget
                                                                lifetime_budget: null, // optional reset if needed
                                                            },
                                                        }),
                                                        ...(payload.bidAmount !== undefined && {
                                                            bid_amount: payload.bidAmount, // ✅ update bid_amount
                                                        }),
                                                        last_updated_by: payload.updatedby,
                                                        last_updated_at: new Date().toISOString(),
                                                    }
                                                    : adset
                                            ),
                                        }
                                        : item
                                )
                            );
                            setIsModalVisible(false);
                        }
                    } catch (err) {
                        setConfirmLoading(false);
                        console.error(err);
                        message.error("Failed to update adset");
                    }
                };

                const rawData = isGroupRow ? params?.node?.allLeafChildren?.[0]?.data : params?.data;

                const daily = adsetInfo?.budget?.daily_budget ?? rawData?.budget?.daily_budget;
                const lifetime = adsetInfo?.budget?.lifetime_budget ?? rawData?.budget?.lifetime_budget;
                const bid = adsetInfo?.bid_amount ?? rawData?.bid_amount;

                const hasBudget = (daily !== null && daily !== undefined && daily !== '') ||
                    (lifetime !== null && lifetime !== undefined && lifetime !== '');
                const hasBid = bid !== null && bid !== undefined && bid !== '';


                let tooltipText = 'Ad Set Budget & Bid are NOT available';
                let iconColor = '#FF4D4F'; // Red (default: none available)

                if (hasBudget && hasBid) {
                    tooltipText = 'Ad Set Budget & Bid are available';
                    iconColor = '#91C25F'; // Green
                } else if (hasBudget || hasBid) {
                    tooltipText = hasBudget ? 'Ad Set exists with Budget but no Bid' : 'Ad Set exists with Bid but no Budget';
                    iconColor = '#FFBF00'; // Yellow
                }

                return (
                    <div>
                        <Tooltip title={tooltipText}>
                            <DollarOutlined
                                style={{
                                    cursor: 'pointer',
                                    color: iconColor,
                                }}
                                onClick={onChangeSpendAndStatus}
                            />
                        </Tooltip>

                        {isModalVisible && (
                            <Modal
                                title={groupedData?.[0]?.campaignname || 'Edit Adset'}
                                open={isModalVisible}
                                // confirmLoading={confirmLoading}
                                onOk={handleOk}
                                onCancel={() => setIsModalVisible(false)}
                                width={600}
                                okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }}
                                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ display: 'flex' }}>
                                        <p style={{ marginBottom: '0px' }} >
                                            Budget Type:
                                        </p>{' '}
                                        <span style={{ fontWeight: 'normal' }}>
                                            {adsetInfo?.budget?.daily_budget ? 'Daily' :
                                                adsetInfo?.budget?.lifetime_budget ? 'Lifetime' : 'No budget'}
                                        </span>
                                    </div>

                                    <Input
                                        type="number"
                                        value={changeBudget}
                                        disabled={!hasBudget}
                                        onChange={(e) => onChangeBudget(e.target.value)}
                                        placeholder="Enter budget in USD"
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                    />

                                    <p style={{ marginBottom: '0px' }}>Bid amount</p>

                                    <Input
                                        type="number"
                                        value={bidAmount}
                                        disabled={!hasBid}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                        placeholder="Enter bid amount"
                                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                    />

                                    <div style={{ display: 'flex' }}>
                                        <p>
                                            Adset ID:
                                        </p>
                                        <p>{adsetId}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
        },
        adsetname: {
            // headerName: 'AdsetName', field: 'adsetname',
            // // resizeble: true,
            // sortable: true,
            // minWidth: 450,
            // filter: 'agSetColumnFilter',
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // },
            // width: 500,
            // hide: true,
            // rowGroup: true,
            // pinned: 'left',
            // enableRowGroup: true,
            headerName: 'AdsetId',
            field: 'adsetname',
            resizable: true,
            sortable: true,
            // hide: true,
            minWidth: 180,
            spanRows: true,
            filter: "agTextColumnFilter",
            // hide: true,
            // rowGroup: true,
            // enableRowGroup: true,
            // pinned: 'left',
            valueGetter: (params) => {
                if (params.data) return params.data.adsetid;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.adsetid || null;
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
        // from:{
        //     headerName: 'Start',
        //     field: 'from',
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //       if (params.node.group) {
        //         const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
        //         const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
        //         // const {  start } = campaignStatus;
        //         // console.log(params.node.groupData?.campaignname, "groupData");
        //         // console.log(params.node.key, "start");
        //         return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
        //       }
        //       return '';
        //     },
        //     cellClassRules: {
        //       'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        // },
        category: {
            headerName: 'Category',
            field: 'category',
            minWidth: 110,
            sortable: true,
            filter: "agTextColumnFilter",

            // ✅ Helper: Capitalize the first letter only
            valueFormatter: (params) => {
                if (!params.value) return '';
                return params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase();
            },

            // ✅ Show category for both grouped and normal rows
            valueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ For normal (leaf) rows
                return capitalize(params.data?.category);
            },

            // ✅ Filter uses same logic as valueGetter
            filterValueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ Include leaf rows in filtering
                return capitalize(params.data?.category);
            },

            // ✅ Dynamic filter list (from both grouped + leaf rows)
            filterParams: {
                values: (params) => {
                    const uniqueCategories = new Set();

                    params.api.forEachNode((node) => {
                        const capitalize = (val) =>
                            val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                        if (node.group) {
                            const firstChild = node.allLeafChildren?.[0];
                            const account = firstChild?.data?.accountNumber;
                            const campaignName = firstChild?.data?.campaignid;
                            const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                            const category = capitalize(campaign?.category);
                            if (category) uniqueCategories.add(category);
                        } else {
                            const category = capitalize(node.data?.category);
                            if (category) uniqueCategories.add(category);
                        }
                    });

                    // params.success(Array.from(uniqueCategories));
                    params.success && params.success(Array.from(uniqueCategories));
                },
            },

            // ✅ Safe comparator for sorting (group-aware)
            comparator: (valueA, valueB, nodeA, nodeB) => {
                const isGroupA = nodeA?.group;
                const isGroupB = nodeB?.group;
                if (isGroupA && isGroupB) {
                    return valueA?.localeCompare?.(valueB) ?? 0;
                }
                // sort normally for leaf nodes
                return valueA?.localeCompare?.(valueB) ?? 0;
            },

            // ✅ Optional — hide empty leaf cells (if any)
            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group && !params.value,
            },
            // cellRenderer: (props) => {
            //     if (props.node.rowPinned || props.node.footer) return "";
            //     if (props.value) return props.value;

            //     const [open, setOpen] = useState(false);
            //     const [category, setCategory] = useState("");
            //     const [row, setRow] = useState(null);

            //     const getRow = () => {
            //         return props.node.group
            //             ? props.node.allLeafChildren?.[0]?.data
            //             : props.node.data;
            //     };

            //     const onEdit = () => {
            //         const r = getRow();
            //         setRow(r);
            //         setCategory(r?.category || "");
            //         setOpen(true);
            //     };

            //     const save = async () => {
            //         if (!row) return;

            //         const payload = {
            //             accountNumber: row.accountNumber,
            //             campaignid: row.campaignid,
            //             level: "campaign",
            //             category,
            //         };

            //         try {
            //             const token = localStorage.getItem("token");

            //             await apiClient.post(
            //                 "/UpdateCategoryNew",
            //                 payload,
            //                 { headers: { Authorization: token } }
            //             );

            //             setCampaignComments((prev) => {
            //                 const arr = [...prev];
            //                 const idx = arr.findIndex(
            //                     (i) =>
            //                         i.campaignid == payload.campaignid &&
            //                         i.Account == payload.accountNumber &&
            //                         i.level == "campaign"
            //                 );
            //                 if (idx >= 0) {
            //                     arr[idx].category = payload.category;
            //                 } else {
            //                     arr.push({
            //                         campaignid: payload.campaignid,
            //                         Account: payload.accountNumber,
            //                         level: "campaign",
            //                         category: payload.category,
            //                     });
            //                 }
            //                 return arr;
            //             });

            //             const key = `${payload.campaignid}_${payload.accountNumber}_campaign`;
            //             commentsMap.set(key, { category: payload.category });
            //             message.success("Category updated");
            //         } catch (err) {
            //             console.error(err);
            //             message.error("Failed to update category");

            //         }

            //         setOpen(false);
            //     };

            //     return (
            //         <div>
            //             <span
            //                 onClick={onEdit}
            //                 style={{ cursor: "pointer", }}
            //             >
            //                 <PlusOutlined />
            //             </span>

            //             <Modal className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`} open={open} title="Edit Category" onOk={save} onCancel={() => setOpen(false)}>
            //                 <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            //             </Modal>
            //         </div>
            //     );
            // },
            cellRenderer: (props) => {
                if (props.node.rowPinned || props.node.footer) return null;

                const [editing, setEditing] = React.useState(false);
                const [value, setValue] = React.useState(props.value || "");

                const [open, setOpen] = React.useState(false);
                const [category, setCategory] = React.useState("");

                const getRow = () =>
                    props.node.group
                        ? props.node.allLeafChildren?.[0]?.data
                        : props.node.data;

                const openModal = () => {
                    const row = getRow();
                    if (!row) return;
                    setCategory(row.category || "");
                    setOpen(true);
                };

                const saveFromModal = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, category);
                    setOpen(false);
                };


                const saveInline = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, value);
                    setEditing(false);
                };


                const saveApi = async (row, catValue) => {
                    const payloadForActivity = {
                        editType: "Categoty",
                        campaignid: row.campaignid,       // cents
                        Account: row.accountNumber,    // ✅ update *this* row’s account
                        campaignname: row.campaignname,
                        updatedBy: userdetails?.userName || "Unknown",
                        updatedUserEmail: userdetails.email,
                        updateType: row.category ? "Campain category updated" : "Campain category created",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: row.category ? `From ${row.category || "N/A"} to ${catValue}` : `Category added as ${catValue}`,
                    }
                    const payload = {
                        accountNumber: row.accountNumber,
                        campaignid: row.campaignid,
                        level: "campaign",
                        category: catValue,
                        activity: payloadForActivity,
                    };

                    const token = localStorage.getItem("token");

                    await apiClient.post(
                        "/UpdateCategoryAndStoreHistory",
                        payload,
                        { headers: { Authorization: token } }
                    );

                    setCampaignComments((prev) => {
                        const arr = [...prev];
                        const idx = arr.findIndex(
                            i =>
                                String(i.campaignid) === String(payload.campaignid) &&
                                String(i.Account) === String(payload.accountNumber) &&
                                i.level === "campaign"
                        );

                        if (idx >= 0) arr[idx].category = catValue;
                        else arr.push({
                            campaignid: payload.campaignid,
                            Account: payload.accountNumber,
                            level: "campaign",
                            category: catValue,
                        });

                        return arr;
                    });

                    commentsMap.set(
                        `${payload.campaignid}_${payload.accountNumber}_campaign`,
                        { category: catValue }
                    );

                    message.success("Category updated");
                };


                if (props.value && !editing) {
                    return (
                        // <span
                        //     onClick={() => setEditing(true)}
                        //     style={{ cursor: "pointer" }}
                        // >
                        //     {props.value}
                        // </span>
                        <Tooltip title={props.value}
                            overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                // fontWeight: 500,
                            }}>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing(true);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {props.value}
                            </span>
                        </Tooltip>
                    );
                }

                if (props.value && editing) {
                    return (
                        <Input
                            autoFocus
                            size="small"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onPressEnter={saveInline}
                            onBlur={saveInline}
                        />
                    );
                }

                return (
                    <>
                        <PlusOutlined
                            // onClick={openModal}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal();
                            }}
                            style={{ cursor: "pointer" }}
                        />

                        <Modal
                            open={open}
                            title="Edit Category"
                            onOk={saveFromModal}
                            onCancel={() => setOpen(false)}
                        >
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Modal>
                    </>
                );
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        // from: {
        //     // headerName: 'Start',
        //     // field: 'from',
        //     // sortable: true,
        //     // minWidth: 110,
        //     // valueGetter: (params) => {
        //     //     // if (params.node.group) {
        //     //     //     const campaignName =
        //     //     //         params.node.groupData?.campaignname || params.node.key;
        //     //     //     const campaign = campaignMap.get(campaignName);
        //     //     //     return campaign && campaign.start
        //     //     //         ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //     //     //         : '-';
        //     //     // }
        //     //     // return '';
        //     //     if (params.node.group) {
        //     //         const campaignName =
        //     //             params.node.groupData?.campaignname || params.node.key;
        //     //         const campaign = campaignMap.get(campaignName);

        //     //         return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //     //     }
        //     //     return params.data?.from || null;
        //     // },
        //     // valueFormatter: (params) => {
        //     //     return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     // },
        //     // cellClassRules: {
        //     //     'hide-leaf-cell': (params) => !params.node.group,
        //     // },
        //     // suppressMenu: true,
        //     // menuTabs: [],
        //     // headerClass: 'hide-menu',
        //     headerName: 'Start',
        //     field: 'from',
        //     sortable: true,
        //     minWidth: 110,
        //     filter: "agDateColumnFilter",
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             if (cellValue == null) return -1;

        //             // Convert your cell value string to a Date
        //             const cellDate = new Date(cellValue);

        //             if (cellDate < filterLocalDateAtMidnight) return -1;
        //             if (cellDate > filterLocalDateAtMidnight) return 1;
        //             return 0;
        //         },
        //     },
        //     valueGetter: (params) => {
        //         // if (params.node.group) {
        //         //     const campaignName =
        //         //         params.node.groupData?.campaignname || params.node.key;
        //         //     const campaign = campaignMap.get(campaignName);
        //         //     return campaign && campaign.start
        //         //         ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //         //         : '-';
        //         // }
        //         // return '';
        //         if (params.node.group) {
        //             // const campaignName =
        //             //     params.node.groupData?.campaignname || params.node.key;
        //             const campaignName = params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";
        //             const campaignId = params.node?.childrenAfterGroup?.[0]?.data?.campaignid || "";

        //             const campaign = campaignMap.get(`${campaignName}_${campaignId}`);

        //             return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //         }
        //         return params.data?.from || null;
        //     },
        //     valueFormatter: (params) => {
        //         return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        // to: {
        //     // headerName: 'End',
        //     // field: 'to',
        //     // minWidth: 110,
        //     // valueGetter: (params) => {
        //     //     if (params.node.group) {
        //     //         const campaignName =
        //     //             params.node.groupData?.campaignname || params.node.key;
        //     //         const campaign = campaignMap.get(campaignName);
        //     //         return campaign && campaign.end
        //     //             ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //     //             : '-';
        //     //     }
        //     //     return params.data?.to || null;
        //     // },
        //     // cellClassRules: {
        //     //     'hide-leaf-cell': (params) => !params.node.group,
        //     // },
        //     // suppressMenu: true,
        //     // menuTabs: [],
        //     // headerClass: 'hide-menu',
        //     headerName: 'End',
        //     field: 'to',
        //     minWidth: 110,
        //     filter: "agDateColumnFilter",
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             if (cellValue == null) return -1;

        //             // Convert your cell value string to a Date
        //             const cellDate = new Date(cellValue);

        //             if (cellDate < filterLocalDateAtMidnight) return -1;
        //             if (cellDate > filterLocalDateAtMidnight) return 1;
        //             return 0;
        //         },
        //     },
        //     valueGetter: (params) => {
        //         if (params.node.group) {
        //             // const campaignName =
        //             //     params.node.groupData?.campaignname || params.node.key;
        //             // const campaign = campaignMap.get(campaignName);
        //             // return campaign && campaign.end
        //             //     ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //             //     : '-';
        //             const campaignName = params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";
        //             const campaignId = params.node?.childrenAfterGroup?.[0]?.data?.campaignid || params.node?.key || "";
        //             // console.log(params.node?.childrenAfterGroup?.[0], "childrenAfterGroup");
        //             // console.log(campaignName, "campaignName");
        //             // console.log(campaignId, "campaignId");

        //             const campaign = campaignMap.get(`${campaignName}_${campaignId}`);

        //             // console.log(campaign, "campaign");

        //             return campaign && campaign.end
        //                 ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //                 : '-';
        //         }
        //         return params.data?.to ? moment(params.data?.to, "YYYY-MM-DD").format("DD-MM-YYYY") : null;
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        from: {
            headerName: 'Start',
            field: 'from',
            sortable: true,
            minWidth: 110,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.start || null;
                } else {
                    dateStr = params.data?.from || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        to: {
            headerName: 'End',
            field: 'to',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue already Date from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.end || null;
                } else {
                    dateStr = params.data?.to || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        profitloss: {
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
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        // date: {
        //     headerName: 'Date', field: 'date', minWidth: 110, sortable: true,
        //     filter: "agDateColumnFilter",
        //     // sort: "asc",
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             const dateAsString = cellValue;
        //             if (dateAsString == null) return -1;
        //             const dateParts = dateAsString.split("/");
        //             const cellDate = new Date(
        //                 Number(dateParts[2]),
        //                 Number(dateParts[1]) - 1,
        //                 Number(dateParts[0])
        //             );

        //             if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        //                 return 0;
        //             }

        //             if (cellDate < filterLocalDateAtMidnight) {
        //                 return -1;
        //             }

        //             if (cellDate > filterLocalDateAtMidnight) {
        //                 return 1;
        //             }
        //             return 0;
        //         }
        //     },
        // },
        date: {
            headerName: 'Date',
            field: 'date',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            // 🔥 Convert raw YYYY-MM-DD → real Date object
            valueGetter: (params) => {
                const dateStr = params.data?.date;
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            // 🔥 Display format only
            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
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
            // filter: "agNumberColumnFilter",
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter, // Format display as currency
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),
        },
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            // filter: "agNumberColumnFilter",
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),
        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            cellClassRules: {
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0, // Conditional formatting for negative profit
            },
            // filter: "agNumberColumnFilter",
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: 'Profit = Revenue - Spend',
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),
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
            valueGetter: getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",

        },
        fblinkclicks: { headerName: 'FB_LC', field: 'fblinkclicks', headerTooltip: 'fblinkclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        fbclicks: { headerName: 'FBClicks', field: 'fbclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        impressions: { headerName: 'IMP', field: 'impressions', headerTooltip: "Impressions", minWidth: 100, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
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
            filter: 'agNumberColumnFilter',
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
        cpl: { headerName: 'CPL', field: 'cpl', minWidth: 80, valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "CPL = Spend / FBLeads" },
        ncpl: { headerName: 'NCPL', field: 'ncpl', minWidth: 90, valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "NCPL = Spend / Conversions" },
        fmargin: {
            headerName: 'FMargin', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: "agNumberColumnFilter",
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
            headerName: 'ROI', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: '(Profit/Spend)*100', filter: "agNumberColumnFilter",
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
        adsetid:
        {
            // headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter", hide: false, suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', minWidth: 180,
            // spanRows: true,
            // filter: "agTextColumnFilter",
            // // hide: true,
            // // rowGroup: true,
            // // enableRowGroup: true,
            // // pinned: 'left',
            // valueGetter: (params) => {
            //     if (params.data) return params.data.adsetid;
            //     const firstChild = params.node?.childrenAfterGroup?.[0];
            //     return firstChild?.data?.adsetid || null;
            // },
            headerName: 'AdsetId',
            field: 'adsetid',
            sortable: true,
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            width: 500,
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
        },
        campaignid: {
            headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', minWidth: 180,
            spanRows: true,
            filter: "agTextColumnFilter",
            // hide: true,
            // rowGroup: true,
            // enableRowGroup: true,
            // pinned: 'left',
            valueGetter: (params) => {
                if (params.data) return params.data.campaignid;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.campaignid || null;
            },
        },
        timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        history: {
            headerName: 'Activity',
            field: 'history',
            minWidth: 90,
            hide: true,
            sortable: false,
            filter: false,
            enableSorting: false,
            enableFilter: false,
            suppressMenu: true,
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignActualSpend, setCampaignActualSpend] = useState({});
                const [hasBudget, setHasBudget] = useState(false);
                const [confirmLoading, setConfirmLoading] = useState(false);

                const isGroupRow = !!params?.node?.groupData;

                // campaign id + campaign name for this row/group
                const campaignId = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.campaignid
                    : params?.data?.campaignid;

                const campaignname = isGroupRow
                    ? params?.node?.key
                    : params?.data?.campaignname;

                // ✅ the *accountNumber of this row/group* (not the selected accounts list)
                const rowAccountNumber = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.accountNumber
                    : params?.data?.accountNumber;

                if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return null;

                return (
                    <div>
                        <HistoryOutlined />
                    </div>
                );
            },
        },
    };

    const columnDefsObjectAdLevelDaily = {
        accountNumber: {
            headerName: 'Account',
            field: 'accountNumber',
            showWhenGrouped: true,
            minWidth: 170,
            filter: "agTextColumnFilter",
            valueGetter: (params) => {
                if (params.data) return params.data.accountNumber;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.accountNumber || null;
            },
        },
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
            // hide: true
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
            // hide: true
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
        keyword: {
            headerName: 'Keyword',
            field: 'keyword',
            resizable: true,
            sortable: true,
            filter: "agTextColumnFilter",
            // hide: false,    
        },
        cpm: {
            headerName: 'CPM',
            field: 'cpm',
            sortable: true,
            filter: "agNumberColumnFilter",
            minWidth: 90,
            headerTooltip: '(Spend/Impressions)*1000',
            valueGetter: getCpm,
            hide: false,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        filteration: {
            headerName: "Filteration",
            field: 'filteration',
            width: 115,
            filter: "agNumberColumnFilter",
            sortable: true,
            valueGetter: getFilteration,
            valueFormatter: params => `${params.value || 0}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            hide: false,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
        },
        actions: {
            headerName: 'Budget',
            field: 'actions',
            minWidth: 90,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            hide: true,
            suppressMenu: true,
            // hide: !isYesterday(),
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
                        if (getCampaignActualSpend.status === 200) {
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
                                okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }}
                                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{ backgroundColor: campaignStatus && "#91C25F" }} onChange={onChangeCampaignStatus} />
                                    </div>

                                    {/* Input Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{ fontWeight: 'normal' }}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget) / 100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget) / 100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>

                                    {/* Campaign ID */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ color: theme === "dark" && "white" }}>Campaign ID:</Typography.Text>
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
            // headerName: 'AdName', field: 'adname',
            // resizeble: true,
            // sortable: true,
            // // width: 300,
            // // rowGroup: true, 
            // // rowGroupIndex: 1, // Level 2
            // // hide: true,
            // // filter: 'agSetColumnFilter',
            // filterParams: {
            //     comparator: (a, b) => a.localeCompare(b),
            //     suppressAndOrCondition: true,
            // },
            // // showRowGroup: 'adname',
            // // hide: true,
            // width: 500,
            // hide: true,
            // rowGroup: true,
            // pinned: 'left',
            // enableRowGroup: true,
            headerName: 'AdID', field: 'adname',

            // headerName: 'AdsetId',
            // field: 'adsetname',
            resizable: true,
            sortable: true,
            // hide: true,
            minWidth: 180,
            spanRows: true,
            filter: "agTextColumnFilter",
            // hide: true,
            // rowGroup: true,
            // enableRowGroup: true,
            // pinned: 'left',
            valueGetter: (params) => {
                if (params.data) return params.data.adid;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.adid || null;
            },
        },
        adid: {
            // headerName: 'AdID',
            // field: 'adid',
            // // sortable: true,
            // // minWidth: 200,
            // // filter: 'agSetColumnFilter',
            // // hide: true,
            // // filterParams: {
            // //     comparator: (a, b) => a.localeCompare(b),
            // //     suppressAndOrCondition: true,
            // // },
            // // suppressMenu: true,    // Suppress the column menu
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
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
            pinned: 'left',

        },
        // from:{
        //     headerName: 'Start',
        //     field: 'from',
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //       if (params.node.group) {
        //         const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
        //         const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
        //         // const {  start } = campaignStatus;
        //         // console.log(params.node.groupData?.campaignname, "groupData");
        //         // console.log(params.node.key, "start");
        //         return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
        //       }
        //       return '';
        //     },
        //     cellClassRules: {
        //       'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        // },
        category: {
            headerName: 'Category',
            field: 'category',
            minWidth: 110,
            sortable: true,
            filter: "agTextColumnFilter",

            // ✅ Helper: Capitalize the first letter only
            valueFormatter: (params) => {
                if (!params.value) return '';
                return params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase();
            },

            // ✅ Show category for both grouped and normal rows
            valueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ For normal (leaf) rows
                return capitalize(params.data?.category);
            },

            // ✅ Filter uses same logic as valueGetter
            filterValueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ Include leaf rows in filtering
                return capitalize(params.data?.category);
            },

            // ✅ Dynamic filter list (from both grouped + leaf rows)
            filterParams: {
                values: (params) => {
                    const uniqueCategories = new Set();

                    params.api.forEachNode((node) => {
                        const capitalize = (val) =>
                            val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                        if (node.group) {
                            const firstChild = node.allLeafChildren?.[0];
                            const account = firstChild?.data?.accountNumber;
                            const campaignName = firstChild?.data?.campaignid;
                            const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                            const category = capitalize(campaign?.category);
                            if (category) uniqueCategories.add(category);
                        } else {
                            const category = capitalize(node.data?.category);
                            if (category) uniqueCategories.add(category);
                        }
                    });

                    // params.success(Array.from(uniqueCategories));
                    params.success && params.success(Array.from(uniqueCategories));
                },
            },

            // ✅ Safe comparator for sorting (group-aware)
            comparator: (valueA, valueB, nodeA, nodeB) => {
                const isGroupA = nodeA?.group;
                const isGroupB = nodeB?.group;
                if (isGroupA && isGroupB) {
                    return valueA?.localeCompare?.(valueB) ?? 0;
                }
                // sort normally for leaf nodes
                return valueA?.localeCompare?.(valueB) ?? 0;
            },

            // ✅ Optional — hide empty leaf cells (if any)
            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group && !params.value,
            },
            // cellRenderer: (props) => {
            //     if (props.node.rowPinned || props.node.footer) return "";
            //     if (props.value) return props.value;

            //     const [open, setOpen] = useState(false);
            //     const [category, setCategory] = useState("");
            //     const [row, setRow] = useState(null);

            //     const getRow = () => {
            //         return props.node.group
            //             ? props.node.allLeafChildren?.[0]?.data
            //             : props.node.data;
            //     };

            //     const onEdit = () => {
            //         const r = getRow();
            //         setRow(r);
            //         setCategory(r?.category || "");
            //         setOpen(true);
            //     };

            //     const save = async () => {
            //         if (!row) return;

            //         const payload = {
            //             accountNumber: row.accountNumber,
            //             campaignid: row.campaignid,
            //             level: "campaign",
            //             category,
            //         };

            //         try {
            //             const token = localStorage.getItem("token");

            //             await apiClient.post(
            //                 "/UpdateCategoryNew",
            //                 payload,
            //                 { headers: { Authorization: token } }
            //             );

            //             setCampaignComments((prev) => {
            //                 const arr = [...prev];
            //                 const idx = arr.findIndex(
            //                     (i) =>
            //                         i.campaignid == payload.campaignid &&
            //                         i.Account == payload.accountNumber &&
            //                         i.level == "campaign"
            //                 );
            //                 if (idx >= 0) {
            //                     arr[idx].category = payload.category;
            //                 } else {
            //                     arr.push({
            //                         campaignid: payload.campaignid,
            //                         Account: payload.accountNumber,
            //                         level: "campaign",
            //                         category: payload.category,
            //                     });
            //                 }
            //                 return arr;
            //             });
            //             const key = `${payload.campaignid}_${payload.accountNumber}_campaign`;
            //             commentsMap.set(key, { category: payload.category });
            //             message.success("Category updated");
            //         } catch (err) {
            //             console.error(err);
            //             message.error("Failed to update category");

            //         }

            //         setOpen(false);
            //     };

            //     return (
            //         <div>
            //             <span
            //                 onClick={onEdit}
            //                 style={{ cursor: "pointer", }}
            //             >
            //                 <PlusOutlined />
            //             </span>

            //             <Modal className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`} open={open} title="Edit Category" onOk={save} onCancel={() => setOpen(false)}>
            //                 <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            //             </Modal>
            //         </div>
            //     );
            // },
            cellRenderer: (props) => {
                if (props.node.rowPinned || props.node.footer) return null;

                const [editing, setEditing] = React.useState(false);
                const [value, setValue] = React.useState(props.value || "");

                const [open, setOpen] = React.useState(false);
                const [category, setCategory] = React.useState("");

                const getRow = () =>
                    props.node.group
                        ? props.node.allLeafChildren?.[0]?.data
                        : props.node.data;

                const openModal = () => {
                    const row = getRow();
                    if (!row) return;
                    setCategory(row.category || "");
                    setOpen(true);
                };

                const saveFromModal = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, category);
                    setOpen(false);
                };


                const saveInline = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, value);
                    setEditing(false);
                };


                const saveApi = async (row, catValue) => {
                    const payloadForActivity = {
                        editType: "Categoty",
                        campaignid: row.campaignid,       // cents
                        Account: row.accountNumber,    // ✅ update *this* row’s account
                        campaignname: row.campaignname,
                        updatedBy: userdetails?.userName || "Unknown",
                        updatedUserEmail: userdetails.email,
                        updateType: row.category ? "Campain category updated" : "Campain category created",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: row.category ? `From ${row.category || "N/A"} to ${catValue}` : `Category added as ${catValue}`,
                    }
                    const payload = {
                        accountNumber: row.accountNumber,
                        campaignid: row.campaignid,
                        level: "campaign",
                        category: catValue,
                        activity: payloadForActivity,
                    };

                    const token = localStorage.getItem("token");

                    await apiClient.post(
                        "/UpdateCategoryAndStoreHistory",
                        payload,
                        { headers: { Authorization: token } }
                    );

                    setCampaignComments((prev) => {
                        const arr = [...prev];
                        const idx = arr.findIndex(
                            i =>
                                String(i.campaignid) === String(payload.campaignid) &&
                                String(i.Account) === String(payload.accountNumber) &&
                                i.level === "campaign"
                        );

                        if (idx >= 0) arr[idx].category = catValue;
                        else arr.push({
                            campaignid: payload.campaignid,
                            Account: payload.accountNumber,
                            level: "campaign",
                            category: catValue,
                        });

                        return arr;
                    });

                    commentsMap.set(
                        `${payload.campaignid}_${payload.accountNumber}_campaign`,
                        { category: catValue }
                    );

                    message.success("Category updated");
                };


                if (props.value && !editing) {
                    return (
                        // <span
                        //     onClick={() => setEditing(true)}
                        //     style={{ cursor: "pointer" }}
                        // >
                        //     {props.value}
                        // </span>
                        <Tooltip title={props.value}
                            overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                // fontWeight: 500,
                            }}>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing(true);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {props.value}
                            </span>
                        </Tooltip>
                    );
                }

                if (props.value && editing) {
                    return (
                        <Input
                            autoFocus
                            size="small"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onPressEnter={saveInline}
                            onBlur={saveInline}
                        />
                    );
                }

                return (
                    <>
                        <PlusOutlined
                            // onClick={openModal}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal();
                            }}
                            style={{ cursor: "pointer" }}
                        />

                        <Modal
                            open={open}
                            title="Edit Category"
                            onOk={saveFromModal}
                            onCancel={() => setOpen(false)}
                        >
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Modal>
                    </>
                );
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        // from: {
        //     // headerName: 'Start',
        //     // field: 'from',
        //     // minWidth: 110,
        //     // sortable: true,
        //     // valueGetter: (params) => {
        //     //     // if (params.node.group) {
        //     //     //     const campaignName =
        //     //     //         params.node.groupData?.campaignname || params.node.key;
        //     //     //     const campaign = campaignMap.get(campaignName);
        //     //     //     return campaign && campaign.start
        //     //     //         ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //     //     //         : '-';
        //     //     // }
        //     //     // return '';
        //     //     if (params.node.group) {
        //     //         const campaignName =
        //     //             params.node.groupData?.campaignname || params.node.key;
        //     //         const campaign = campaignMap.get(campaignName);

        //     //         return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //     //     }
        //     //     return params.data?.from || null;
        //     // },
        //     // valueFormatter: (params) => {
        //     //     return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     // },
        //     // cellClassRules: {
        //     //     'hide-leaf-cell': (params) => !params.node.group,
        //     // },
        //     // suppressMenu: true,
        //     // menuTabs: [],
        //     // headerClass: 'hide-menu',
        //     headerName: 'Start',
        //     field: 'from',
        //     sortable: true,
        //     minWidth: 110,
        //     filter: "agDateColumnFilter",
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             if (cellValue == null) return -1;

        //             // Convert your cell value string to a Date
        //             const cellDate = new Date(cellValue);

        //             if (cellDate < filterLocalDateAtMidnight) return -1;
        //             if (cellDate > filterLocalDateAtMidnight) return 1;
        //             return 0;
        //         },
        //     },
        //     valueGetter: (params) => {
        //         // if (params.node.group) {
        //         //     const campaignName =
        //         //         params.node.groupData?.campaignname || params.node.key;
        //         //     const campaign = campaignMap.get(campaignName);
        //         //     return campaign && campaign.start
        //         //         ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //         //         : '-';
        //         // }
        //         // return '';
        //         if (params.node.group) {
        //             // const campaignName =
        //             //     params.node.groupData?.campaignname || params.node.key;
        //             const campaignName = params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";
        //             const campaignId = params.node?.childrenAfterGroup?.[0]?.data?.campaignid || "";

        //             const campaign = campaignMap.get(`${campaignName}_${campaignId}`);

        //             return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //         }
        //         return params.data?.from || null;
        //     },
        //     valueFormatter: (params) => {
        //         return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        // to: {
        //     // headerName: 'End',
        //     // field: 'to',
        //     // minWidth: 110,
        //     // valueGetter: (params) => {
        //     //     if (params.node.group) {
        //     //         const campaignName =
        //     //             params.node.groupData?.campaignname || params.node.key;
        //     //         const campaign = campaignMap.get(campaignName);
        //     //         return campaign && campaign.end
        //     //             ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //     //             : '-';
        //     //     }
        //     //     return params.data?.to || null;
        //     // },
        //     // cellClassRules: {
        //     //     'hide-leaf-cell': (params) => !params.node.group,
        //     // },
        //     // suppressMenu: true,
        //     // menuTabs: [],
        //     // headerClass: 'hide-menu',
        //     headerName: 'End',
        //     field: 'to',
        //     minWidth: 110,
        //     filter: "agDateColumnFilter",
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             if (cellValue == null) return -1;

        //             // Convert your cell value string to a Date
        //             const cellDate = new Date(cellValue);

        //             if (cellDate < filterLocalDateAtMidnight) return -1;
        //             if (cellDate > filterLocalDateAtMidnight) return 1;
        //             return 0;
        //         },
        //     },
        //     valueGetter: (params) => {
        //         if (params.node.group) {
        //             // const campaignName =
        //             //     params.node.groupData?.campaignname || params.node.key;
        //             // const campaign = campaignMap.get(campaignName);
        //             // return campaign && campaign.end
        //             //     ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //             //     : '-';
        //             const campaignName = params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";
        //             const campaignId = params.node?.childrenAfterGroup?.[0]?.data?.campaignid || params.node?.key || "";
        //             // console.log(params.node?.childrenAfterGroup?.[0], "childrenAfterGroup");
        //             // console.log(campaignName, "campaignName");
        //             // console.log(campaignId, "campaignId");

        //             const campaign = campaignMap.get(`${campaignName}_${campaignId}`);

        //             // console.log(campaign, "campaign");

        //             return campaign && campaign.end
        //                 ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //                 : '-';
        //         }
        //         return params.data?.to ? moment(params.data?.to, "YYYY-MM-DD").format("DD-MM-YYYY") : null;
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        from: {
            headerName: 'Start',
            field: 'from',
            sortable: true,
            minWidth: 110,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.start || null;
                } else {
                    dateStr = params.data?.from || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        to: {
            headerName: 'End',
            field: 'to',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue already Date from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.end || null;
                } else {
                    dateStr = params.data?.to || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        profitloss: {
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
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        // date: {
        //     headerName: 'Date', field: 'date', minWidth: 110, sortable: true,
        //     filter: "agDateColumnFilter",
        //     // sort: "asc",
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             const dateAsString = cellValue;
        //             if (dateAsString == null) return -1;
        //             const dateParts = dateAsString.split("/");
        //             const cellDate = new Date(
        //                 Number(dateParts[2]),
        //                 Number(dateParts[1]) - 1,
        //                 Number(dateParts[0])
        //             );

        //             if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        //                 return 0;
        //             }

        //             if (cellDate < filterLocalDateAtMidnight) {
        //                 return -1;
        //             }

        //             if (cellDate > filterLocalDateAtMidnight) {
        //                 return 1;
        //             }
        //             return 0;
        //         }
        //     },
        // },
        date: {
            headerName: 'Date',
            field: 'date',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            // 🔥 Convert raw YYYY-MM-DD → real Date object
            valueGetter: (params) => {
                const dateStr = params.data?.date;
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            // 🔥 Display format only
            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
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
            // filter: "agNumberColumnFilter",
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter, // Format display as currency
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),
        },
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            // filter: "agNumberColumnFilter",
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),
        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            cellClassRules: {
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0, // Conditional formatting for negative profit
            },
            // filter: "agNumberColumnFilter",
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: 'Profit = Revenue - Spend',
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),
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
            valueGetter: getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",

        },
        fblinkclicks: { headerName: 'FB_LC', field: 'fblinkclicks', headerTooltip: 'fblinkclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        fbclicks: { headerName: 'FBClicks', field: 'fbclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        impressions: { headerName: 'IMP', field: 'impressions', headerTooltip: "Impressions", minWidth: 100, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        ctr: {
            headerName: 'CTR', field: 'ctr', valueGetter: getCtr, sortable: true,
            minWidth: 100,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            filter: 'agNumberColumnFilter',
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
        cpl: { headerName: 'CPL', field: 'cpl', minWidth: 80, valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "CPL = Spend / FBLeads" },
        ncpl: { headerName: 'NCPL', field: 'ncpl', minWidth: 90, valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "NCPL = Spend / Conversions" },
        fmargin: {
            headerName: 'FMargin', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: "agNumberColumnFilter",
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
            headerName: 'ROI', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: '(Profit/Spend)*100', filter: "agNumberColumnFilter",
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
        adsetid: {
            headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter", hide: false, suppressMenu: true, menuTabs: [], headerClass: 'hide-menu',
            minWidth: 180,
            spanRows: true,
            filter: "agTextColumnFilter",
            // hide: true,
            // rowGroup: true,
            // enableRowGroup: true,
            // pinned: 'left',
            valueGetter: (params) => {
                if (params.data) return params.data.adsetid;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.adsetid || null;
            },
        },
        campaignid: {
            headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu',
            minWidth: 180,
            spanRows: true,
            filter: "agTextColumnFilter",
            // hide: true,
            // rowGroup: true,
            // enableRowGroup: true,
            // pinned: 'left',
            valueGetter: (params) => {
                if (params.data) return params.data.campaignid;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.campaignid || null;
            },
        },
        timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        history: {
            headerName: 'Activity',
            field: 'history',
            minWidth: 90,
            hide: true,
            sortable: false,
            filter: false,
            enableSorting: false,
            enableFilter: false,
            suppressMenu: true,
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignActualSpend, setCampaignActualSpend] = useState({});
                const [hasBudget, setHasBudget] = useState(false);
                const [confirmLoading, setConfirmLoading] = useState(false);

                const isGroupRow = !!params?.node?.groupData;

                // campaign id + campaign name for this row/group
                const campaignId = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.campaignid
                    : params?.data?.campaignid;

                const campaignname = isGroupRow
                    ? params?.node?.key
                    : params?.data?.campaignname;

                // ✅ the *accountNumber of this row/group* (not the selected accounts list)
                const rowAccountNumber = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.accountNumber
                    : params?.data?.accountNumber;

                if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return null;

                return (
                    <div>
                        <HistoryOutlined />
                    </div>
                );
            },
        },
    };

    const columnDefsObject1 = {
        accountNumber: {
            headerName: 'Account',
            field: 'accountNumber',
            hide: true,
        },
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
        cpm: {
            headerName: 'CPM',
            field: 'cpm',
            sortable: true,
            filter: "agNumberColumnFilter",
            minWidth: 90,
            headerTooltip: '(Spend/Impressions)*1000',
            valueGetter: getCpm,
            hide: false,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        filteration: {
            headerName: "Filteration",
            field: 'filteration',
            width: 115,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueGetter: getFilteration,
            valueFormatter: params => `${params.value || 0}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            hide: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
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
                        if (getCampaignActualSpend.status === 200) {
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
                                okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }}
                                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{ backgroundColor: campaignStatus && "#91C25F" }} onChange={onChangeCampaignStatus} />
                                    </div>

                                    {/* Input Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{ fontWeight: 'normal' }}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget) / 100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget) / 100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
                                    </div>

                                    {/* Campaign ID */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ color: theme === "dark" && "white" }}>Campaign ID:</Typography.Text>
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
            filter: 'agTextColumnFilter',
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
        // from:{
        //     headerName: 'Start',
        //     field: 'from',
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //       if (params.node.group) {
        //         const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
        //         const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
        //         // const {  start } = campaignStatus;
        //         // console.log(params.node.groupData?.campaignname, "groupData");
        //         // console.log(params.node.key, "start");
        //         return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
        //       }
        //       return '';
        //     },
        //     cellClassRules: {
        //       'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        // },
        category: {
            headerName: 'Category',
            field: 'category',
            minWidth: 110,
            sortable: true,
            filter: "agTextColumnFilter",

            // ✅ Helper: Capitalize the first letter only
            valueFormatter: (params) => {
                if (!params.value) return '';
                return params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase();
            },

            // ✅ Show category for both grouped and normal rows
            valueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ For normal (leaf) rows
                return capitalize(params.data?.category);
            },

            // ✅ Filter uses same logic as valueGetter
            filterValueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ Include leaf rows in filtering
                return capitalize(params.data?.category);
            },

            // ✅ Dynamic filter list (from both grouped + leaf rows)
            filterParams: {
                values: (params) => {
                    const uniqueCategories = new Set();

                    params.api.forEachNode((node) => {
                        const capitalize = (val) =>
                            val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                        if (node.group) {
                            const firstChild = node.allLeafChildren?.[0];
                            const account = firstChild?.data?.accountNumber;
                            const campaignName = firstChild?.data?.campaignid;
                            const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                            const category = capitalize(campaign?.category);
                            if (category) uniqueCategories.add(category);
                        } else {
                            const category = capitalize(node.data?.category);
                            if (category) uniqueCategories.add(category);
                        }
                    });

                    // params.success(Array.from(uniqueCategories));
                    params.success && params.success(Array.from(uniqueCategories));
                },
            },

            // ✅ Safe comparator for sorting (group-aware)
            comparator: (valueA, valueB, nodeA, nodeB) => {
                const isGroupA = nodeA?.group;
                const isGroupB = nodeB?.group;
                if (isGroupA && isGroupB) {
                    return valueA?.localeCompare?.(valueB) ?? 0;
                }
                // sort normally for leaf nodes
                return valueA?.localeCompare?.(valueB) ?? 0;
            },

            // ✅ Optional — hide empty leaf cells (if any)
            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group && !params.value,
            },
            // cellRenderer: (props) => {
            //     if (props.node.rowPinned || props.node.footer) return "";
            //     if (props.value) return props.value;

            //     const [open, setOpen] = useState(false);
            //     const [category, setCategory] = useState("");
            //     const [row, setRow] = useState(null);

            //     const getRow = () => {
            //         return props.node.group
            //             ? props.node.allLeafChildren?.[0]?.data
            //             : props.node.data;
            //     };

            //     const onEdit = () => {
            //         const r = getRow();
            //         setRow(r);
            //         setCategory(r?.category || "");
            //         setOpen(true);
            //     };

            //     const save = async () => {
            //         if (!row) return;

            //         const payload = {
            //             accountNumber: row.accountNumber,
            //             campaignid: row.campaignid,
            //             level: "campaign",
            //             category,
            //         };

            //         try {
            //             const token = localStorage.getItem("token");

            //             await apiClient.post(
            //                 "/UpdateCategoryNew",
            //                 payload,
            //                 { headers: { Authorization: token } }
            //             );

            //             setCampaignComments((prev) => {
            //                 const arr = [...prev];
            //                 const idx = arr.findIndex(
            //                     (i) =>
            //                         i.campaignid == payload.campaignid &&
            //                         i.Account == payload.accountNumber &&
            //                         i.level == "campaign"
            //                 );
            //                 if (idx >= 0) {
            //                     arr[idx].category = payload.category;
            //                 } else {
            //                     arr.push({
            //                         campaignid: payload.campaignid,
            //                         Account: payload.accountNumber,
            //                         level: "campaign",
            //                         category: payload.category,
            //                     });
            //                 }
            //                 return arr;
            //             });
            //             const key = `${payload.campaignid}_${payload.accountNumber}_campaign`;
            //             commentsMap.set(key, { category: payload.category });
            //             message.success("Category updated");
            //         } catch (err) {
            //             console.error(err);
            //             message.error("Failed to update category");

            //         }
            //         setOpen(false);
            //     };

            //     return (
            //         <div>
            //             <span
            //                 onClick={onEdit}
            //                 style={{ cursor: "pointer", }}
            //             >
            //                 <PlusOutlined />
            //             </span>

            //             <Modal className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`} open={open} title="Edit Category" onOk={save} onCancel={() => setOpen(false)}>
            //                 <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            //             </Modal>
            //         </div>
            //     );
            // },
            cellRenderer: (props) => {
                if (props.node.rowPinned || props.node.footer) return null;

                const [editing, setEditing] = React.useState(false);
                const [value, setValue] = React.useState(props.value || "");

                const [open, setOpen] = React.useState(false);
                const [category, setCategory] = React.useState("");

                const getRow = () =>
                    props.node.group
                        ? props.node.allLeafChildren?.[0]?.data
                        : props.node.data;

                const openModal = () => {
                    const row = getRow();
                    if (!row) return;
                    setCategory(row.category || "");
                    setOpen(true);
                };

                const saveFromModal = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, category);
                    setOpen(false);
                };


                const saveInline = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, value);
                    setEditing(false);
                };


                const saveApi = async (row, catValue) => {
                    const payloadForActivity = {
                        editType: "Categoty",
                        campaignid: row.campaignid,       // cents
                        Account: row.accountNumber,    // ✅ update *this* row’s account
                        campaignname: row.campaignname,
                        updatedBy: userdetails?.userName || "Unknown",
                        updatedUserEmail: userdetails.email,
                        updateType: row.category ? "Campain category updated" : "Campain category created",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: row.category ? `From ${row.category || "N/A"} to ${catValue}` : `Category added as ${catValue}`,
                    }
                    const payload = {
                        accountNumber: row.accountNumber,
                        campaignid: row.campaignid,
                        level: "campaign",
                        category: catValue,
                        activity: payloadForActivity,
                    };

                    const token = localStorage.getItem("token");

                    await apiClient.post(
                        "/UpdateCategoryAndStoreHistory",
                        payload,
                        { headers: { Authorization: token } }
                    );

                    setCampaignComments((prev) => {
                        const arr = [...prev];
                        const idx = arr.findIndex(
                            i =>
                                String(i.campaignid) === String(payload.campaignid) &&
                                String(i.Account) === String(payload.accountNumber) &&
                                i.level === "campaign"
                        );

                        if (idx >= 0) arr[idx].category = catValue;
                        else arr.push({
                            campaignid: payload.campaignid,
                            Account: payload.accountNumber,
                            level: "campaign",
                            category: catValue,
                        });

                        return arr;
                    });

                    commentsMap.set(
                        `${payload.campaignid}_${payload.accountNumber}_campaign`,
                        { category: catValue }
                    );

                    message.success("Category updated");
                };


                if (props.value && !editing) {
                    return (
                        // <span
                        //     onClick={() => setEditing(true)}
                        //     style={{ cursor: "pointer" }}
                        // >
                        //     {props.value}
                        // </span>
                        <Tooltip title={props.value}
                            overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                // fontWeight: 500,
                            }}>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing(true);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {props.value}
                            </span>
                        </Tooltip>
                    );
                }

                if (props.value && editing) {
                    return (
                        <Input
                            autoFocus
                            size="small"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onPressEnter={saveInline}
                            onBlur={saveInline}
                        />
                    );
                }

                return (
                    <>
                        <PlusOutlined
                            // onClick={openModal}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal();
                            }}
                            style={{ cursor: "pointer" }}
                        />

                        <Modal
                            open={open}
                            title="Edit Category"
                            onOk={saveFromModal}
                            onCancel={() => setOpen(false)}
                        >
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Modal>
                    </>
                );
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        // from: {
        //     headerName: 'Start',
        //     field: 'from',
        //     sortable: true,
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //         // if (params.node.group) {
        //         //     const campaignName =
        //         //         params.node.groupData?.campaignname || params.node.key;
        //         //     const campaign = campaignMap.get(campaignName);
        //         //     return campaign && campaign.start
        //         //         ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //         //         : '-';
        //         // }
        //         // return '';
        //         if (params.node.group) {
        //             const campaignName =
        //                 params.node.groupData?.campaignname || params.node.key;
        //             const campaign = campaignMap.get(campaignName);

        //             return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //         }
        //         return params.data?.from || null;
        //     },
        //     valueFormatter: (params) => {
        //         return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        // to: {
        //     headerName: 'End',
        //     field: 'to',
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //         if (params.node.group) {
        //             const campaignName =
        //                 params.node.groupData?.campaignname || params.node.key;
        //             const campaign = campaignMap.get(campaignName);
        //             return campaign && campaign.end
        //                 ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //                 : '-';
        //         }
        //         return params.data?.to || null;
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        from: {
            headerName: 'Start',
            field: 'from',
            sortable: true,
            minWidth: 110,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.start || null;
                } else {
                    dateStr = params.data?.from || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        to: {
            headerName: 'End',
            field: 'to',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue already Date from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.end || null;
                } else {
                    dateStr = params.data?.to || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        profitloss: {
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
            filter: "agNumberColumnFilter",
            headerClass: 'hide-menu', // Add a custom class
        },
        // date: {
        //     headerName: 'Date', field: 'date', minWidth: 110, sortable: true,
        //     filter: "agDateColumnFilter",
        //     sort: "asc",
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             const dateAsString = cellValue;
        //             if (dateAsString == null) return -1;
        //             const dateParts = dateAsString.split("/");
        //             const cellDate = new Date(
        //                 Number(dateParts[2]),
        //                 Number(dateParts[1]) - 1,
        //                 Number(dateParts[0])
        //             );

        //             if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        //                 return 0;
        //             }

        //             if (cellDate < filterLocalDateAtMidnight) {
        //                 return -1;
        //             }

        //             if (cellDate > filterLocalDateAtMidnight) {
        //                 return 1;
        //             }
        //             return 0;
        //         }
        //     },
        // },
        date: {
            headerName: 'Date',
            field: 'date',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            // 🔥 Convert raw YYYY-MM-DD → real Date object
            valueGetter: (params) => {
                const dateStr = params.data?.date;
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            // 🔥 Display format only
            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
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
            headerClass: 'hide-menu', // Add a custom class
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),
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
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),
        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            cellClassRules: {
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0, // Conditional formatting for negative profit
            },
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: 'Profit = Revenue - Spend',
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),
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
            valueGetter: getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",

        },
        fblinkclicks: { headerName: 'FB_LC', field: 'fblinkclicks', headerTooltip: 'fblinkclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        fbclicks: { headerName: 'FBClicks', field: 'fbclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        impressions: { headerName: 'IMP', field: 'impressions', headerTooltip: "Impressions", minWidth: 100, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
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
            filter: "agNumberColumnFilter",
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
        cpl: { headerName: 'CPL', field: 'cpl', minWidth: 80, valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "CPL = Spend / FBLeads" },
        ncpl: { headerName: 'NCPL', field: 'ncpl', minWidth: 90, valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', headerTooltip: "NCPL = Spend / Conversions" },
        fmargin: {
            headerName: 'FMargin', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: "agNumberColumnFilter",
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
            headerName: 'ROI', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: '(Profit/Spend)*100', filter: "agNumberColumnFilter",
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
        campaignid: { headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        history: {
            headerName: 'Activity',
            field: 'history',
            minWidth: 90,
            sortable: false,
            filter: false,
            enableSorting: false,
            enableFilter: false,
            suppressMenu: true,
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignActualSpend, setCampaignActualSpend] = useState({});
                const [hasBudget, setHasBudget] = useState(false);
                const [confirmLoading, setConfirmLoading] = useState(false);

                const isGroupRow = !!params?.node?.groupData;

                // campaign id + campaign name for this row/group
                const campaignId = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.campaignid
                    : params?.data?.campaignid;

                const campaignname = isGroupRow
                    ? params?.node?.key
                    : params?.data?.campaignname;

                // ✅ the *accountNumber of this row/group* (not the selected accounts list)
                const rowAccountNumber = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.accountNumber
                    : params?.data?.accountNumber;


                if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return null;

                return (
                    <div>
                        <HistoryOutlined onClick={() => {
                            setHistoryOpen(true);
                            setSelectedCampaignIdForHistory(campaignId);
                            setSelectedAccountForHistory(rowAccountNumber)
                        }} />
                    </div>
                );
            },
        },
    };

    const columnDefsObject2 = {
        accountNumber: {
            headerName: 'Account',
            field: 'accountNumber',
            showWhenGrouped: true,
            minWidth: 170,
            filter: "agTextColumnFilter",
            valueGetter: (params) => {
                if (params.data) return params.data.accountNumber;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.accountNumber || null;
            },
        },
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
            // headerName: 'CampaignName', field: 'campaignname', resizeble: true,
            // // sortable: true,
            // resizeble: true,
            // sortable: true,
            // width: 500,
            // hide: true,
            // rowGroup: true,
            // pinned: 'left',
            // enableRowGroup: true,
            // width: 450,
            // pinned: 'left',// Using the group cell renderer
            headerName: 'CampaignID',
            field: 'campaignname',
            resizable: true,
            sortable: true,
            // hide: true,
            minWidth: 180,
            spanRows: true,
            filter: "agTextColumnFilter",
            // hide: true,
            // rowGroup: true,
            // enableRowGroup: true,
            // pinned: 'left',
            valueGetter: (params) => {
                if (params.data) return params.data.campaignid;
                const firstChild = params.node?.childrenAfterGroup?.[0];
                return firstChild?.data?.campaignid || null;
            },
        },
        cpm: {
            headerName: 'CPM',
            field: 'cpm',
            sortable: true,
            filter: "agNumberColumnFilter",
            minWidth: 90,
            headerTooltip: '(Spend/Impressions)*1000',
            valueGetter: getCpm,
            hide: false,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        filteration: {
            headerName: "Filteration",
            field: 'filteration',
            width: 115,
            filter: "agNumberColumnFilter",
            sortable: true,
            valueGetter: getFilteration,
            valueFormatter: params => `${params.value || 0}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            hide: false,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
        },
        // actions: {
        //     headerName: 'Actions',
        //     field: 'actions',
        //     minWidth: 90,
        //     sortable: false,    // Ensure sorting is disabled
        //     filter: false,      // Ensure filtering is disabled
        //     enableSorting: false,  // Disable sorting at the column level
        //     enableFilter: false,
        //     hide: false,
        //     suppressMenu: true,
        //     hide: !isYesterday(),
        //     cellRenderer: (params) => {
        //         const [isModalVisible, setIsModalVisible] = useState(false);
        //         const [newgroupedData, setNewGroupedData] = useState([]);
        //         const [groupedData, setGroupedData] = useState([]);
        //         const [changeBudget, onChangeBudget] = useState();
        //         const [campaignStatus, setCampaignStatus] = useState(true);


        //         const [campaignActualSpend, setCampaignActualSpend] = useState({});


        //         const onChangeSpendAndStatus = async () => {
        //             // Check if it's a group footer row (for groupIncludeFooter)
        //             if (params?.node?.footer) {
        //                 // console.log("This is a groupIncludeFooter row. Modal will not open.");
        //                 return; // Prevent modal from opening for group footer rows
        //             }


        //             // Ensure allLeafChildren exists and is an array before proceeding
        //             const allLeafChildren = params.node?.allLeafChildren || [];


        //             // Fetch all the rows under the current group
        //             const groupedData = allLeafChildren.map(node => node.data) || [];
        //             setNewGroupedData(groupedData);
        //             const campaignId = groupedData[0]?.campaignid;


        //             // Only show the modal if there is data (groupedData length is greater than 0)
        //             if (groupedData.length > 0) {
        //                 const getCampaignResponse = await apiClient.get(`/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`);
        //                 const getCampaignActualSpend = await apiClient.get(`/get/ActualCampaginSpend?campaignId=${campaignId}`);
        //                 if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
        //                     setGroupedData(getCampaignResponse.data);
        //                     setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
        //                     onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
        //                 }
        //                 if(getCampaignActualSpend.status === 200){
        //                     // console.log(getCampaignActualSpend.data, "getCampaignActualSpend");
        //                     setCampaignActualSpend(getCampaignActualSpend.data);
        //                 }
        //                 else {
        //                     setGroupedData(groupedData);
        //                 }
        //                 // Set the grouped data for the modal
        //                 setIsModalVisible(true); // Show the modal for non-footer rows
        //             }
        //         };


        //         const handleOk = async () => {
        //             setIsModalVisible(false); // Close the modal
        //             const object = {
        //                 campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
        //                 adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
        //                 campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
        //                 usercommit: userdetails?.email,
        //                 accountNumber: newaccount,
        //                 budget: changeBudget * 100,
        //                 status: campaignStatus
        //             };
        //             // console.log(object);
        //             const requestResponse = await apiClient.post('/Comments/accountNumber/campaign', { formattedData: object });
        //             const responseData = requestResponse.data;
        //             // console.log(responseData, "response");
        //             message.success("Budget and Status Updated");
        //             changeRRefrst();
        //         };


        //         const handleCancel = () => {
        //             setIsModalVisible(false);
        //             // console.log(changeBudget); // Close the modal
        //         };


        //         const getTotalSpend = (data) => {
        //             if (!data || data.length === 0) return 0;
        //             const total = data.reduce((total, item) => {
        //                 return total + (parseFloat(item?.spend) || 0);
        //             }, 0);
        //             return Math.round(total * 100) / 100; // Round to 2 decimal places
        //         };


        //         const onChangeBudgetValue = event => {
        //             onChangeBudget(event.target.value)
        //         }


        //         const onChangeCampaignStatus = async () => {
        //             const apiEndpoint = campaignStatus
        //                 ? 'https://prodapis.adsgoat.in/campaignStatusPause/' // Pause campaign
        //                 : 'https://prodapis.adsgoat.in/campaignStatusActive/'; // Activate campaign


        //             try {
        //                 const response = await axios.post(apiEndpoint,
        //                     { campaignId: groupedData[0]?.campaignid },
        //                     { headers: { Authorization: token } }
        //                 );
        //                 if (response.status === 200) {
        //                     message.success(`Campaign ${groupedData[0]?.campaignid} status updated to ${campaignStatus ? 'Paused' : 'Active'}`);
        //                     setCampaignStatus((prev) => !prev); // Toggle the status
        //                 } else {
        //                     message.error('Failed to update campaign status.');
        //                 }
        //             } catch (error) {
        //                 console.error('Error updating campaign status:', error);
        //                 message.error('Error updating campaign status.');
        //             }
        //         };


        //         // console.log(groupedData);


        //         return (
        //             <div>
        //                 {/* Click action for status cell */}
        //                 <div onClick={onChangeSpendAndStatus}>
        //                     <span>{params.value || "..."}</span> {/* Fallback to '...' if status is not available */}
        //                 </div>
        //                 {/* Modal should only be shown for non-footer rows and when groupedData length is greater than 0 */}
        //                 {isModalVisible && (
        //                     <Modal
        //                         title={groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignname : groupedData?.campaignname}
        //                         visible={isModalVisible}
        //                         onOk={handleOk}
        //                         onCancel={handleCancel}
        //                         width={600}  // Set a custom width for the modal
        //                         style={{ padding: '20px' }}  // Adjust body padding
        //                         okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }}
        //                     >
        //                         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        //                             <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        //                                 <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
        //                                 <Switch checked={campaignStatus} style={{backgroundColor: campaignStatus && "#91C25F"}} onChange={onChangeCampaignStatus} />
        //                             </div>


        //                             {/* Input Field */}
        //                             <div style={{ display: 'flex', flexDirection: 'column' }}>
        //                                 <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{fontWeight:'normal'}}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
        //                                 <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget)/100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget)/100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
        //                             </div>


        //                             {/* Campaign ID */}
        //                             <div style={{ display: 'flex', flexDirection: 'column' }}>
        //                                 <Typography.Text strong>Campaign ID:</Typography.Text>
        //                                 <p>{campaignActualSpend?.id}</p>
        //                             </div>
        //                         </div>
        //                     </Modal>
        //                 )}
        //             </div>
        //         );
        //     },
        //     filterParams: { filterEnabled: false },


        // },
        actions: {
            headerName: 'Budget',
            field: 'actions',
            minWidth: 90,
            sortable: false,
            filter: false,
            enableSorting: false,
            enableFilter: false,
            suppressMenu: true,
            // hide: !isYesterday(),
            // cellRenderer: (params) => {
            //     const [isModalVisible, setIsModalVisible] = useState(false);
            //     const [groupedData, setGroupedData] = useState([]);
            //     const [changeBudget, onChangeBudget] = useState();
            //     const [campaignActualSpend, setCampaignActualSpend] = useState({});


            //     const isGroupRow = !!params?.node?.groupData;
            //     let campaignId = isGroupRow ? params?.node?.allLeafChildren?.[0]?.data?.campaignid : params?.data?.campaignid;
            //     const campaignname = isGroupRow ? params?.node?.key : params?.data?.campaignname;


            //     useEffect(() => {
            //         if (!campaignId || !Array.isArray(allCampaignData)) return;
            //         const matchedCampaign = allCampaignData.find(c => c.campaignid === campaignId);
            //         if (matchedCampaign) {
            //             setCampaignActualSpend(matchedCampaign);
            //         }
            //     }, [campaignId, allCampaignData]);


            //     const onChangeSpendAndStatus = () => {
            //         if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return;
            //         const allLeafChildren = params.node?.allLeafChildren || [];
            //         const grouped = allLeafChildren.map(node => node.data) || [];
            //         setGroupedData(grouped);


            //         if (!campaignId || !campaignname) {
            //             message.error("Campaign info missing");
            //             return;
            //         }




            //         const matchedCampaign = params.context.allCampaignData.find(c => c.campaignid === campaignId);


            //         if (matchedCampaign) {
            //             const budget = parseFloat(
            //                 matchedCampaign?.campaign_budget?.daily_budget ||
            //                 matchedCampaign?.campaign_budget?.lifetime_budget ||
            //                 0
            //             ) / 100;


            //             onChangeBudget(budget);
            //             setCampaignActualSpend(matchedCampaign); // ✅ critical
            //         } else {
            //             onChangeBudget(undefined);
            //             setCampaignActualSpend({});
            //         }


            //         setIsModalVisible(true);
            //     };


            //     const handleOk = async () => {
            //         setIsModalVisible(false);
            //         const isArray = Array.isArray(groupedData);
            //         const campaignIdFinal = isArray ? groupedData?.[0]?.campaignid : groupedData?.campaignid;
            //         const campaignnameFinal = isArray ? groupedData?.[0]?.campaignname : groupedData?.campaignname;


            //         const payload = {
            //             campaignId: campaignIdFinal,
            //             budget: parseFloat(changeBudget) * 100,
            //             accountNumber: newaccount,
            //             campaignname: campaignnameFinal,
            //             updatedby: userdetails?.email,
            //         };


            //         if (!payload.campaignId) {
            //             message.error("Campaign ID missing. Cannot update budget.");
            //             return;
            //         }


            //         try {
            //             await apiClient.post('/update/campaign/budget', payload);
            //             message.success("Budget Updated Successfully");
            //             // setCampaignRefreshTrigger(prev => prev + 1);
            //             // changeRRefrst();
            //             params.context.setCampaignRefreshTrigger(prev => prev + 1);
            //             params.context.changeRRefrst();
            //         } catch (err) {
            //             console.error(err);
            //             message.error("Failed to update budget");
            //         }
            //     };


            //     if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return null;


            //     return (
            //         <div>
            //             {campaignActualSpend?.campaign_budget &&
            //                 (campaignActualSpend?.campaign_budget?.daily_budget != null ||
            //                     campaignActualSpend?.campaign_budget?.lifetime_budget != null) ? (
            //                 <DollarOutlined
            //                     style={{ cursor: 'pointer' }}
            //                     onClick={onChangeSpendAndStatus}
            //                 />
            //             ) : (
            //                 <Tooltip title="No budget set for this campaign">
            //                     <WarningOutlined style={{ color: '#FAAD14', fontSize: 16 }} />
            //                 </Tooltip>
            //             )}


            //             {isModalVisible && (
            //                 <Modal
            //                     title={Array.isArray(groupedData) ? groupedData?.[0]?.campaignname : groupedData?.campaignname}
            //                     open={isModalVisible}
            //                     onOk={handleOk}
            //                     onCancel={() => setIsModalVisible(false)}
            //                     width={600}
            //                     okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }}
            //                     className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
            //                 >
            //                     <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            //                         <div style={{ display: 'flex', }}>
            //                             <p>
            //                                 Budget Type:
            //                             </p>{" "}
            //                             <span style={{ fontWeight: 'normal' }}>
            //                                 {campaignActualSpend?.campaign_budget?.daily_budget !== null ? "Daily" :
            //                                     campaignActualSpend?.campaign_budget?.lifetime_budget !== null ? "Lifetime" : "Unknown"}
            //                             </span>
            //                         </div>


            //                         <Input
            //                             type="number"
            //                             value={changeBudget}
            //                             onChange={(e) => onChangeBudget(e.target.value)}
            //                             placeholder="Enter budget in USD"
            //                             className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
            //                         />


            //                         <div style={{ display: 'flex' }}>
            //                             <p>Campaign ID: </p>
            //                             <p>{campaignId}</p>
            //                         </div>
            //                     </div>
            //                 </Modal>
            //             )}
            //         </div>
            //     );
            // },


            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignActualSpend, setCampaignActualSpend] = useState({});
                const [hasBudget, setHasBudget] = useState(false);
                const [confirmLoading, setConfirmLoading] = useState(false);


                const isGroupRow = !!params?.node?.groupData;


                // campaign id + campaign name for this row/group
                const campaignId = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.campaignid
                    : params?.data?.campaignid;


                const campaignname = isGroupRow
                    ? params?.node?.key
                    : params?.data?.campaignname;


                // ✅ the *accountNumber of this row/group* (not the selected accounts list)
                const rowAccountNumber = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.accountNumber
                    : params?.data?.accountNumber;


                // const { allCampaignData } = params.context;


                // ✅ find the exact record for (campaignId, rowAccountNumber)
                useEffect(() => {
                    if (!campaignId || !rowAccountNumber || !Array.isArray(Camapignlevelstatus)) return;


                    const matched = Camapignlevelstatus.find(
                        c =>
                            String(c.campaign_id) === String(campaignId) &&
                            String(c.accountNumber) === String(rowAccountNumber)
                    );


                    setCampaignActualSpend(matched ?? {});
                    setHasBudget(
                        !!(
                            matched?.campaign_budget &&
                            (matched.campaign_budget.daily_budget != null ||
                                matched.campaign_budget.lifetime_budget != null)
                        )
                    );
                }, [campaignId, rowAccountNumber, Camapignlevelstatus?.length]);


                const onChangeSpendAndStatus = () => {
                    if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return;


                    const grouped = (params.node?.allLeafChildren || []).map(n => n.data);
                    setGroupedData(grouped.length ? grouped : (params.data ? [params.data] : []));


                    if (!campaignId || !campaignname) {
                        message.error("Campaign info missing");
                        return;
                    }


                    // Prefill from the matched record for *this* account
                    const b = campaignActualSpend?.campaign_budget;
                    const budgetCents = b?.daily_budget ?? b?.lifetime_budget ?? null;
                    onChangeBudget(budgetCents != null ? Number(budgetCents) / 100 : undefined);


                    setIsModalVisible(true);
                };


                const handleOk = async () => {
                    setConfirmLoading(true);
                    const target = Array.isArray(groupedData) && groupedData.length ? groupedData[0] : params.data;
                    const campaignIdFinal = target?.campaignid;
                    const campaignnameFinal = target?.campaignname;

                    const payloadForActivity = {
                        editType: "Budget",
                        campaignid: campaignIdFinal,       // cents
                        Account: String(rowAccountNumber),    // ✅ update *this* row’s account
                        campaignname: campaignnameFinal,
                        updatedBy: userdetails?.userName || "Unknown",
                        updatedUserEmail: userdetails.email,
                        updateType: "Campain budget updated",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: `From $${campaignActualSpend?.campaign_budget?.daily_budget != null ? (Number(campaignActualSpend?.campaign_budget?.daily_budget) / 100) : campaignActualSpend?.campaign_budget?.lifetime_budget != null ? (Number(campaignActualSpend?.campaign_budget?.lifetime_budget) / 100) : 0} to $${(Number(changeBudget))}`,
                        budgetType: campaignActualSpend?.campaign_budget?.daily_budget != null ? 'daily_budget' :
                            campaignActualSpend?.campaign_budget?.lifetime_budget != null ? 'lifetime_budget' : 'unknown',
                    }


                    const payload = {
                        campaignId: campaignIdFinal,
                        budget: Math.round(Number(changeBudget) * 100),         // cents
                        accountNumber: String(rowAccountNumber),    // ✅ update *this* row’s account
                        campaignname: campaignnameFinal,
                        updatedby: params.context?.userdetails?.email,
                        budgetType: campaignActualSpend?.campaign_budget?.daily_budget != null ? 'daily_budget' :
                            campaignActualSpend?.campaign_budget?.lifetime_budget != null ? 'lifetime_budget' : 'unknown',
                        activity: payloadForActivity,
                    };




                    if (!payload.campaignId || !payload.accountNumber) {
                        message.error("Campaign ID or account missing. Cannot update budget.");
                        return;
                    }


                    try {
                        await apiClient.post('/update/campaign/budget/history', payload);
                        message.success("Budget Updated Successfully");
                        setCamapignlevelstatus(prev => {
                            const updated = prev.map(item => {
                                if (
                                    String(item.campaign_id) === String(payload.campaignId) &&
                                    String(item.accountNumber) === String(payload.accountNumber)
                                ) {
                                    return {
                                        ...item,
                                        campaign_budget: {
                                            ...item.campaign_budget,
                                            daily_budget: String(payload.budget),
                                        },
                                    };
                                }
                                return item;
                            });
                            return updated;
                        })
                        setConfirmLoading(false);
                        setIsModalVisible(false);
                        // params.context.setCampaignRefreshTrigger(prev => prev + 1);
                        // params.context.changeRRefrst();
                    } catch (err) {
                        setConfirmLoading(false);
                        console.error(err);
                        message.error("Failed to update budget");
                    }
                };


                if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return null;


                return (
                    <div>
                        {hasBudget ? (
                            <DollarOutlined style={{ cursor: 'pointer' }} onClick={onChangeSpendAndStatus} />
                        ) : (
                            <Tooltip title="No budget set for this campaign">
                                <WarningOutlined style={{ color: '#FAAD14', fontSize: 16 }} />
                            </Tooltip>
                        )}


                        {isModalVisible && (
                            <Modal
                                title={
                                    Array.isArray(groupedData) && groupedData.length
                                        ? groupedData[0]?.campaignname
                                        : campaignname
                                }
                                open={isModalVisible}
                                onOk={handleOk}
                                onCancel={() => setIsModalVisible(false)}
                                width={600}
                                okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }}
                                className={`custom-modal ${params.context?.theme === 'dark' ? 'dark-theme-modal' : ''}`}
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div style={{ display: 'flex' }}>
                                        <p>Budget Type:&nbsp;</p>
                                        <span style={{ fontWeight: 'normal' }}>
                                            {campaignActualSpend?.campaign_budget?.daily_budget != null
                                                ? 'Daily'
                                                : campaignActualSpend?.campaign_budget?.lifetime_budget != null
                                                    ? 'Lifetime'
                                                    : 'Unknown'}
                                        </span>
                                    </div>


                                    <Input
                                        type="number"
                                        value={changeBudget}
                                        onChange={(e) => onChangeBudget(e.target.value)}
                                        placeholder="Enter budget in USD"
                                        className={params.context?.theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                    />


                                    <div style={{ display: 'flex' }}>
                                        <p>Campaign ID:&nbsp;</p>
                                        <p>{campaignId}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
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
        // from:{
        //     headerName: 'Start',
        //     field: 'from',
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //       if (params.node.group) {
        //         const campaignName =  params.node.key;
        //         const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
        //         // const {  start } = campaignStatus;
        //         // console.log(params.node.groupData?.campaignname, "groupData");
        //         // console.log(params.node.key, "start");
        //         // console.log(campaignStatus?.start);
        //         // console.log(campaignStatus, "campaignStatus");
        //         return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
        //       }
        //       return '';
        //     },
        //     cellClassRules: {
        //       'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        // },
        category: {
            headerName: 'Category',
            field: 'category',
            minWidth: 110,
            sortable: true,
            filter: "agTextColumnFilter",


            // ✅ Helper: Capitalize the first letter only
            valueFormatter: (params) => {
                if (!params.value) return '';
                return params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase();
            },


            // ✅ Show category for both grouped and normal rows
            valueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;


                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }


                // ✅ For normal (leaf) rows
                return capitalize(params.data?.category);
            },


            // ✅ Filter uses same logic as valueGetter
            filterValueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;


                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }


                // ✅ Include leaf rows in filtering
                return capitalize(params.data?.category);
            },


            // ✅ Dynamic filter list (from both grouped + leaf rows)
            filterParams: {
                values: (params) => {
                    const uniqueCategories = new Set();


                    params.api.forEachNode((node) => {
                        const capitalize = (val) =>
                            val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;


                        if (node.group) {
                            const firstChild = node.allLeafChildren?.[0];
                            const account = firstChild?.data?.accountNumber;
                            const campaignName = firstChild?.data?.campaignid;
                            const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                            const category = capitalize(campaign?.category);
                            if (category) uniqueCategories.add(category);
                        } else {
                            const category = capitalize(node.data?.category);
                            if (category) uniqueCategories.add(category);
                        }
                    });


                    // params.success(Array.from(uniqueCategories));
                    params.success && params.success(Array.from(uniqueCategories));
                },
            },


            // ✅ Safe comparator for sorting (group-aware)
            comparator: (valueA, valueB, nodeA, nodeB) => {
                const isGroupA = nodeA?.group;
                const isGroupB = nodeB?.group;
                if (isGroupA && isGroupB) {
                    return valueA?.localeCompare?.(valueB) ?? 0;
                }
                // sort normally for leaf nodes
                return valueA?.localeCompare?.(valueB) ?? 0;
            },


            // ✅ Optional — hide empty leaf cells (if any)
            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group && !params.value,
            },
            // cellRenderer: (props) => {
            //     if (props.node.rowPinned || props.node.footer) return "";
            //     if (props.value) return props.value;


            //     const [open, setOpen] = useState(false);
            //     const [category, setCategory] = useState("");
            //     const [row, setRow] = useState(null);


            //     const getRow = () => {
            //         return props.node.group
            //             ? props.node.allLeafChildren?.[0]?.data
            //             : props.node.data;
            //     };


            //     const onEdit = () => {
            //         const r = getRow();
            //         setRow(r);
            //         setCategory(r?.category || "");
            //         setOpen(true);
            //     };


            //     const save = async () => {
            //         if (!row) return;


            //         const payload = {
            //             accountNumber: row.accountNumber,
            //             campaignid: row.campaignid,
            //             level: "campaign",
            //             category,
            //         };


            //         try {
            //             const token = localStorage.getItem("token");


            //             await apiClient.post(
            //                 "/UpdateCategoryNew",
            //                 payload,
            //                 { headers: { Authorization: token } }
            //             );


            //             setCampaignComments((prev) => {
            //                 const arr = [...prev];
            //                 const idx = arr.findIndex(
            //                     (i) =>
            //                         i.campaignid == payload.campaignid &&
            //                         i.Account == payload.accountNumber &&
            //                         i.level == "campaign"
            //                 );
            //                 if (idx >= 0) {
            //                     arr[idx].category = payload.category;
            //                 } else {
            //                     arr.push({
            //                         campaignid: payload.campaignid,
            //                         Account: payload.accountNumber,
            //                         level: "campaign",
            //                         category: payload.category,
            //                     });
            //                 }
            //                 return arr;
            //             });
            //             const key = `${payload.campaignid}_${payload.accountNumber}_campaign`;
            //             commentsMap.set(key, { category: payload.category });
            //             message.success("Category updated");
            //         } catch (err) {
            //             console.error(err);
            //             message.error("Failed to update category");


            //         }


            //         setOpen(false);
            //     };


            //     return (
            //         <div>
            //             <span
            //                 onClick={onEdit}
            //                 style={{ cursor: "pointer", }}
            //             >
            //                 <PlusOutlined />
            //             </span>


            //             <Modal className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`} open={open} title="Edit Category" onOk={save} onCancel={() => setOpen(false)}>
            //                 <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            //             </Modal>
            //         </div>
            //     );
            // },
            cellRenderer: (props) => {
                if (props.node.rowPinned || props.node.footer) return null;

                const [editing, setEditing] = React.useState(false);
                const [value, setValue] = React.useState(props.value || "");

                const [open, setOpen] = React.useState(false);
                const [category, setCategory] = React.useState("");

                const getRow = () =>
                    props.node.group
                        ? props.node.allLeafChildren?.[0]?.data
                        : props.node.data;

                const openModal = () => {
                    const row = getRow();
                    if (!row) return;
                    setCategory(row.category || "");
                    setOpen(true);
                };

                const saveFromModal = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, category);
                    setOpen(false);
                };


                const saveInline = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, value);
                    setEditing(false);
                };


                const saveApi = async (row, catValue) => {
                    const payloadForActivity = {
                        editType: "Categoty",
                        campaignid: row.campaignid,       // cents
                        Account: row.accountNumber,    // ✅ update *this* row’s account
                        campaignname: row.campaignname,
                        updatedBy: userdetails?.userName || "Unknown",
                        updatedUserEmail: userdetails.email,
                        updateType: row.category ? "Campain category updated" : "Campain category created",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: row.category ? `From ${row.category || "N/A"} to ${catValue}` : `Category added as ${catValue}`,
                    }
                    const payload = {
                        accountNumber: row.accountNumber,
                        campaignid: row.campaignid,
                        level: "campaign",
                        category: catValue,
                        activity: payloadForActivity,
                    };

                    const token = localStorage.getItem("token");

                    await apiClient.post(
                        "/UpdateCategoryAndStoreHistory",
                        payload,
                        { headers: { Authorization: token } }
                    );

                    setCampaignComments((prev) => {
                        const arr = [...prev];
                        const idx = arr.findIndex(
                            i =>
                                String(i.campaignid) === String(payload.campaignid) &&
                                String(i.Account) === String(payload.accountNumber) &&
                                i.level === "campaign"
                        );

                        if (idx >= 0) arr[idx].category = catValue;
                        else arr.push({
                            campaignid: payload.campaignid,
                            Account: payload.accountNumber,
                            level: "campaign",
                            category: catValue,
                        });

                        return arr;
                    });

                    commentsMap.set(
                        `${payload.campaignid}_${payload.accountNumber}_campaign`,
                        { category: catValue }
                    );

                    message.success("Category updated");
                };


                if (props.value && !editing) {
                    return (
                        // <span
                        //     onClick={() => setEditing(true)}
                        //     style={{ cursor: "pointer" }}
                        // >
                        //     {props.value}
                        // </span>
                        <Tooltip title={props.value}
                            overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                // fontWeight: 500,
                            }}>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing(true);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {props.value}
                            </span>
                        </Tooltip>
                    );
                }

                if (props.value && editing) {
                    return (
                        <Input
                            autoFocus
                            size="small"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onPressEnter={saveInline}
                            onBlur={saveInline}
                        />
                    );
                }

                return (
                    <>
                        <PlusOutlined
                            // onClick={openModal}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal();
                            }}
                            style={{ cursor: "pointer" }}
                        />

                        <Modal
                            open={open}
                            title="Edit Category"
                            onOk={saveFromModal}
                            onCancel={() => setOpen(false)}
                        >
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Modal>
                    </>
                );
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        // from: {
        //     // headerName: 'Start',
        //     // field: 'from',
        //     // sortable: true,
        //     // minWidth: 110,
        //     // valueGetter: (params) => {
        //     //     //   if (params.node.group) {
        //     //     //     const campaignName =
        //     //     //       params.node.groupData?.campaignname || params.node.key;
        //     //     //     const campaign = campaignMap.get(campaignName);
        //     //     //     return campaign && campaign.start
        //     //     //       ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //     //     //       : '-';
        //     //     //   }
        //     //     if (params.node.group) {
        //     //         const campaignName =
        //     //             params.node.groupData?.campaignname || params.node.key;
        //     //         const campaign = campaignMap.get(campaignName);


        //     //         return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //     //     }
        //     //     return params.data?.from || null;
        //     // },
        //     // valueFormatter: (params) => {
        //     //     return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     // },
        //     // cellClassRules: {
        //     //     'hide-leaf-cell': (params) => !params.node.group,
        //     // },
        //     // suppressMenu: true,
        //     // menuTabs: [],
        //     // headerClass: 'hide-menu',
        //     headerName: 'Start',
        //     field: 'from',
        //     sortable: true,
        //     minWidth: 110,
        //     filter: "agDateColumnFilter",
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             if (cellValue == null) return -1;


        //             // Convert your cell value string to a Date
        //             const cellDate = new Date(cellValue);


        //             if (cellDate < filterLocalDateAtMidnight) return -1;
        //             if (cellDate > filterLocalDateAtMidnight) return 1;
        //             return 0;
        //         },
        //     },
        //     valueGetter: (params) => {
        //         // if (params.node.group) {
        //         //     const campaignName =
        //         //         params.node.groupData?.campaignname || params.node.key;
        //         //     const campaign = campaignMap.get(campaignName);
        //         //     return campaign && campaign.start
        //         //         ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //         //         : '-';
        //         // }
        //         // return '';
        //         if (params.node.group) {
        //             // const campaignName =
        //             //     params.node.groupData?.campaignname || params.node.key;
        //             const campaignName = params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";
        //             const campaignId = params.node?.childrenAfterGroup?.[0]?.campaignid || params.node?.key || "";


        //             const campaign = campaignMap.get(`${campaignName}_${campaignId}`);


        //             return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //         }
        //         return params.data?.from || null;
        //     },
        //     valueFormatter: (params) => {
        //         return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        // to: {
        //     // headerName: 'End',
        //     // field: 'to',
        //     // minWidth: 110,
        //     // valueGetter: (params) => {
        //     //     if (params.node.group) {
        //     //         const campaignName =
        //     //             params.node.groupData?.campaignname || params.node.key;
        //     //         const campaign = campaignMap.get(campaignName);
        //     //         return campaign && campaign.end
        //     //             ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //     //             : '-';
        //     //     }
        //     //     return params.data?.to || null;
        //     // },
        //     // cellClassRules: {
        //     //     'hide-leaf-cell': (params) => !params.node.group,
        //     // },
        //     // suppressMenu: true,
        //     // menuTabs: [],
        //     // headerClass: 'hide-menu',
        //     headerName: 'End',
        //     field: 'to',
        //     minWidth: 110,
        //     filter: "agDateColumnFilter",
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             if (cellValue == null) return -1;


        //             // Convert your cell value string to a Date
        //             const cellDate = new Date(cellValue);


        //             if (cellDate < filterLocalDateAtMidnight) return -1;
        //             if (cellDate > filterLocalDateAtMidnight) return 1;
        //             return 0;
        //         },
        //     },
        //     valueGetter: (params) => {
        //         if (params.node.group) {
        //             // const campaignName =
        //             //     params.node.groupData?.campaignname || params.node.key;
        //             // const campaign = campaignMap.get(campaignName);
        //             // return campaign && campaign.end
        //             //     ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //             //     : '-';
        //             const campaignName = params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";
        //             const campaignId = params.node?.childrenAfterGroup?.[0]?.data?.campaignid || params.node?.key || "";
        //             // console.log(params.node?.childrenAfterGroup?.[0], "childrenAfterGroup");
        //             // console.log(campaignName, "campaignName");
        //             // console.log(campaignId, "campaignId");


        //             const campaign = campaignMap.get(`${campaignName}_${campaignId}`);


        //             // console.log(campaign, "campaign");


        //             return campaign && campaign.end
        //                 ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //                 : '-';
        //         }
        //         return params.data?.to ? moment(params.data?.to, "YYYY-MM-DD").format("DD-MM-YYYY") : null;
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // }, 
        from: {
            headerName: 'Start',
            field: 'from',
            sortable: true,
            minWidth: 110,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.start || null;
                } else {
                    dateStr = params.data?.from || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        to: {
            headerName: 'End',
            field: 'to',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue already Date from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.end || null;
                } else {
                    dateStr = params.data?.to || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        profitloss: {
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
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
        },
        // date: {
        //     headerName: 'Date', field: 'date',
        //     // sort: 'asc',
        //     sortable: true,
        //     filter: "agDateColumnFilter",
        //     // sort: "asc",
        //     minWidth: 110,
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             const dateAsString = cellValue;
        //             if (dateAsString == null) return -1;
        //             const dateParts = dateAsString.split("/");
        //             const cellDate = new Date(
        //                 Number(dateParts[2]),
        //                 Number(dateParts[1]) - 1,
        //                 Number(dateParts[0])
        //             );


        //             if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        //                 return 0;
        //             }


        //             if (cellDate < filterLocalDateAtMidnight) {
        //                 return -1;
        //             }


        //             if (cellDate > filterLocalDateAtMidnight) {
        //                 return 1;
        //             }
        //             return 0;
        //         },
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        // },
        date: {
            headerName: 'Date',
            field: 'date',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            // 🔥 Convert raw YYYY-MM-DD → real Date object
            valueGetter: (params) => {
                const dateStr = params.data?.date;
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            // 🔥 Display format only
            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        spend: {
            headerName: 'Spend',
            field: 'spend',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter", // Keep filter active
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Total amount spent",
            filterValueGetter: (params) => parseFloat(params.data.spend || 0),
        }
        ,
        revenue: {
            headerName: 'Revenue',
            field: 'revenue',
            minWidth: 105,
            aggFunc: liveSpender,
            sortable: true,
            // filter: "agNumberColumnFilter",
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            filterValueGetter: (params) => parseFloat(params.data.revenue || 0),


        },
        profit: {
            headerName: 'Profit',
            field: 'profit',
            minWidth: 105,
            sortable: true,
            aggFunc: liveSpender,
            cellClassRules: {
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0,
            },
            // filter: "agNumberColumnFilter",
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "Profit = Revenue - Spend",
            filterValueGetter: (params) => parseFloat(params.data.profit || 0),


        },
        margin: {
            headerName: 'Margin',
            field: 'margin',
            minWidth: 100,
            valueGetter: getMargin,
            sortable: true,
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
            valueGetter: getCpcLc,
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
            headerTooltip: 'fblinkclicks',
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
        campaignid: {
            // headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu'
            headerName: 'CampaignId',
            field: 'campaignid',
            sortable: true,
            filter: "agTextColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            width: 500,
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
        },
        adsetid: { headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        'fb-hour': { headerName: 'F-H', field: 'fb-hour', width: 85, sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        'mnet-hour': { headerName: 'M-H', field: 'mnet-hour', width: 85, sortable: true, hide: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        history: {
            headerName: 'Activity',
            field: 'history',
            minWidth: 90,
            sortable: false,
            filter: false,
            enableSorting: false,
            enableFilter: false,
            suppressMenu: true,
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignActualSpend, setCampaignActualSpend] = useState({});
                const [hasBudget, setHasBudget] = useState(false);
                const [confirmLoading, setConfirmLoading] = useState(false);

                const isGroupRow = !!params?.node?.groupData;

                // campaign id + campaign name for this row/group
                const campaignId = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.campaignid
                    : params?.data?.campaignid;

                const campaignname = isGroupRow
                    ? params?.node?.key
                    : params?.data?.campaignname;

                // ✅ the *accountNumber of this row/group* (not the selected accounts list)
                const rowAccountNumber = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.accountNumber
                    : params?.data?.accountNumber;




                if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return null;

                return (
                    <div>
                        <HistoryOutlined onClick={() => {
                            setHistoryOpen(true);
                            setSelectedCampaignIdForHistory(campaignId);
                            setSelectedAccountForHistory(rowAccountNumber)
                        }} />
                    </div>
                );
            },
        },
    };



    const KeywordCellRenderer = ({ params }) => {
        const [tooltipText, setTooltipText] = useState("Copy to clipboard");

        const keyword = params.value;
        const adId = params.data?.adId;
        const shouldAllowKeywordCopy =
            newRevenuePratner === "FB_Tonic1" ||
            newRevenuePratner === "FB_TonicRsoc";



        // const handleCopy = () => {
        //     navigator.clipboard.writeText(adId).then(() => {
        //         setTooltipText("Copied!");
        //         setTimeout(() => setTooltipText("Copy to clipboard"), 2000);
        //     }).catch(() => {
        //         alert('Failed to copy!');
        //     });
        // };

        const handleCopy = () => {
            const textToCopy = shouldAllowKeywordCopy ? keyword : adId;

            navigator.clipboard.writeText(textToCopy).then(() => {
                setTooltipText("Copied!");
                setTimeout(() => setTooltipText("Copy to clipboard"), 2000);
            }).catch(() => {
                alert('Failed to copy!');
            });
        };


        const popoverContent = (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{adId}</span>
                <Tooltip title={tooltipText}
                >
                    <div className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
                        <CopyOutlined
                            className="copy-icon"
                            onClick={handleCopy}
                            style={{
                                cursor: 'pointer',
                                fontSize: '16px',
                            }}
                        />
                    </div>
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
                <span style={{ cursor: 'pointer' }} >
                    {keyword}
                </span>
            </Popover>
        );
    };

    const columnDefsObject3 = {
        accountNumber: {
            headerName: 'Account',
            field: 'accountNumber',
            // hide: true,
        },
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
        cpm: {
            headerName: 'CPM',
            field: 'cpm',
            sortable: true,
            filter: "agTextColumnFilter",
            minWidth: 90,
            headerTooltip: '(Profit/Revenue)*100',
            valueGetter: getCpm,
            hide: false,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        filteration: {
            headerName: "Filteration",
            field: 'filteration',
            width: 115,
            sortable: true,
            sortable: true,
            valueGetter: getFilteration,
            valueFormatter: params => `${params.value || 0}%`,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            hide: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
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
                <KeywordCellRenderer params={params} />,
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
                        if (getCampaignActualSpend.status === 200) {
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
                                okButtonProps={{ style: { backgroundColor: '#91C25F', borderColor: '#91C25F' } }}
                                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} style={{ backgroundColor: campaignStatus && "#91C25F" }} onChange={onChangeCampaignStatus} />
                                    </div>

                                    {/* Input Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget: <span style={{ fontWeight: 'normal' }}>{campaignActualSpend.daily_budget ? "Daily" : campaignActualSpend.lifetime_budget ? "Lifetime" : "Adset"}</span></Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={campaignActualSpend.daily_budget ? parseFloat(campaignActualSpend.daily_budget) / 100 : campaignActualSpend.lifetime_budget ? parseFloat(campaignActualSpend.lifetime_budget) / 100 : (groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData))} onChange={onChangeBudgetValue} />
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
        // from:{
        //     headerName: 'Start',
        //     field: 'from',
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //       if (params.node.group) {
        //         const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
        //         const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);
        //         // const {  start } = campaignStatus;
        //         // console.log(params.node.groupData?.campaignname, "groupData");
        //         // console.log(params.node.key, "start");
        //         return moment(campaignStatus?.start, "YYYY-MM-DD").format("DD-MM-YYYY") || 'Unknown';
        //       }
        //       return '';
        //     },
        //     cellClassRules: {
        //       'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu', // Add a custom class
        // },
        category: {
            headerName: 'Category',
            field: 'category',
            minWidth: 110,
            sortable: true,
            filter: "agTextColumnFilter",

            // ✅ Helper: Capitalize the first letter only
            valueFormatter: (params) => {
                if (!params.value) return '';
                return params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase();
            },

            // ✅ Show category for both grouped and normal rows
            valueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ For normal (leaf) rows
                return capitalize(params.data?.category);
            },

            // ✅ Filter uses same logic as valueGetter
            filterValueGetter: (params) => {
                const capitalize = (val) =>
                    val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                if (params.node.group) {
                    const firstChild = params.node.allLeafChildren?.[0];
                    const account = firstChild?.data?.accountNumber;
                    const campaignName = firstChild?.data?.campaignid;
                    const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                    return capitalize(campaign?.category);
                }

                // ✅ Include leaf rows in filtering
                return capitalize(params.data?.category);
            },

            // ✅ Dynamic filter list (from both grouped + leaf rows)
            filterParams: {
                values: (params) => {
                    const uniqueCategories = new Set();

                    params.api.forEachNode((node) => {
                        const capitalize = (val) =>
                            val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;

                        if (node.group) {
                            const firstChild = node.allLeafChildren?.[0];
                            const account = firstChild?.data?.accountNumber;
                            const campaignName = firstChild?.data?.campaignid;
                            const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                            const category = capitalize(campaign?.category);
                            if (category) uniqueCategories.add(category);
                        } else {
                            const category = capitalize(node.data?.category);
                            if (category) uniqueCategories.add(category);
                        }
                    });

                    // params.success(Array.from(uniqueCategories));
                    params.success && params.success(Array.from(uniqueCategories));
                },
            },

            // ✅ Safe comparator for sorting (group-aware)
            comparator: (valueA, valueB, nodeA, nodeB) => {
                const isGroupA = nodeA?.group;
                const isGroupB = nodeB?.group;
                if (isGroupA && isGroupB) {
                    return valueA?.localeCompare?.(valueB) ?? 0;
                }
                // sort normally for leaf nodes
                return valueA?.localeCompare?.(valueB) ?? 0;
            },

            // ✅ Optional — hide empty leaf cells (if any)
            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group && !params.value,
            },
            // cellRenderer: (props) => {
            //     if (props.node.rowPinned || props.node.footer) return "";
            //     if (props.value) return props.value;

            //     const [open, setOpen] = useState(false);
            //     const [category, setCategory] = useState("");
            //     const [row, setRow] = useState(null);

            //     const getRow = () => {
            //         return props.node.group
            //             ? props.node.allLeafChildren?.[0]?.data
            //             : props.node.data;
            //     };

            //     const onEdit = () => {
            //         const r = getRow();
            //         setRow(r);
            //         setCategory(r?.category || "");
            //         setOpen(true);
            //     };

            //     const save = async () => {
            //         if (!row) return;

            //         const payload = {
            //             accountNumber: row.accountNumber,
            //             campaignid: row.campaignid,
            //             level: "campaign",
            //             category,
            //         };

            //         try {
            //             const token = localStorage.getItem("token");

            //             await apiClient.post(
            //                 "/UpdateCategoryNew",
            //                 payload,
            //                 { headers: { Authorization: token } }
            //             );

            //             setCampaignComments((prev) => {
            //                 const arr = [...prev];
            //                 const idx = arr.findIndex(
            //                     (i) =>
            //                         i.campaignid == payload.campaignid &&
            //                         i.Account == payload.accountNumber &&
            //                         i.level == "campaign"
            //                 );
            //                 if (idx >= 0) {
            //                     arr[idx].category = payload.category;
            //                 } else {
            //                     arr.push({
            //                         campaignid: payload.campaignid,
            //                         Account: payload.accountNumber,
            //                         level: "campaign",
            //                         category: payload.category,
            //                     });
            //                 }
            //                 return arr;
            //             });

            //             const key = `${payload.campaignid}_${payload.accountNumber}_campaign`;
            //             commentsMap.set(key, { category: payload.category });
            //             message.success("Category updated");
            //         } catch (err) {
            //             console.error(err);
            //             message.error("Failed to update category");

            //         }

            //         setOpen(false);
            //     };

            //     return (
            //         <div>
            //             <span
            //                 onClick={onEdit}
            //                 style={{ cursor: "pointer", }}
            //             >
            //                 <PlusOutlined />
            //             </span>

            //             <Modal className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`} open={open} title="Edit Category" onOk={save} onCancel={() => setOpen(false)}>
            //                 <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            //             </Modal>
            //         </div>
            //     );
            // },
            cellRenderer: (props) => {
                if (props.node.rowPinned || props.node.footer) return null;

                const [editing, setEditing] = React.useState(false);
                const [value, setValue] = React.useState(props.value || "");

                const [open, setOpen] = React.useState(false);
                const [category, setCategory] = React.useState("");

                const getRow = () =>
                    props.node.group
                        ? props.node.allLeafChildren?.[0]?.data
                        : props.node.data;

                const openModal = () => {
                    const row = getRow();
                    if (!row) return;
                    setCategory(row.category || "");
                    setOpen(true);
                };

                const saveFromModal = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, category);
                    setOpen(false);
                };


                const saveInline = async () => {
                    const row = getRow();
                    if (!row) return;

                    await saveApi(row, value);
                    setEditing(false);
                };


                const saveApi = async (row, catValue) => {
                    const payloadForActivity = {
                        editType: "Categoty",
                        campaignid: row.campaignid,       // cents
                        Account: row.accountNumber,    // ✅ update *this* row’s account
                        campaignname: row.campaignname,
                        updatedBy: userdetails?.userName || "Unknown",
                        updatedUserEmail: userdetails.email,
                        updateType: row.category ? "Campain category updated" : "Campain category created",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: row.category ? `From ${row.category || "N/A"} to ${catValue}` : `Category added as ${catValue}`,
                    }
                    const payload = {
                        accountNumber: row.accountNumber,
                        campaignid: row.campaignid,
                        level: "campaign",
                        category: catValue,
                        activity: payloadForActivity,
                    };

                    const token = localStorage.getItem("token");

                    await apiClient.post(
                        "/UpdateCategoryAndStoreHistory",
                        payload,
                        { headers: { Authorization: token } }
                    );

                    setCampaignComments((prev) => {
                        const arr = [...prev];
                        const idx = arr.findIndex(
                            i =>
                                String(i.campaignid) === String(payload.campaignid) &&
                                String(i.Account) === String(payload.accountNumber) &&
                                i.level === "campaign"
                        );

                        if (idx >= 0) arr[idx].category = catValue;
                        else arr.push({
                            campaignid: payload.campaignid,
                            Account: payload.accountNumber,
                            level: "campaign",
                            category: catValue,
                        });

                        return arr;
                    });

                    commentsMap.set(
                        `${payload.campaignid}_${payload.accountNumber}_campaign`,
                        { category: catValue }
                    );

                    message.success("Category updated");
                };


                if (props.value && !editing) {
                    return (
                        // <span
                        //     onClick={() => setEditing(true)}
                        //     style={{ cursor: "pointer" }}
                        // >
                        //     {props.value}
                        // </span>
                        <Tooltip title={props.value}
                            overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                // fontWeight: 500,
                            }}>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditing(true);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {props.value}
                            </span>
                        </Tooltip>
                    );
                }

                if (props.value && editing) {
                    return (
                        <Input
                            autoFocus
                            size="small"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onPressEnter={saveInline}
                            onBlur={saveInline}
                        />
                    );
                }

                return (
                    <>
                        <PlusOutlined
                            // onClick={openModal}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal();
                            }}
                            style={{ cursor: "pointer" }}
                        />

                        <Modal
                            open={open}
                            title="Edit Category"
                            onOk={saveFromModal}
                            onCancel={() => setOpen(false)}
                        >
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Modal>
                    </>
                );
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        // from: {
        //     headerName: 'Start',
        //     field: 'from',
        //     sortable: true,
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //         // if (params.node.group) {
        //         //     const campaignName =
        //         //         params.node.groupData?.campaignname || params.node.key;
        //         //     const campaign = campaignMap.get(campaignName);
        //         //     return campaign && campaign.start
        //         //         ? moment(campaign.start, "YYYY-MM-DD").format("DD-MM-YYYY")
        //         //         : '-';
        //         // }
        //         // return '';
        //         if (params.node.group) {
        //             const campaignName =
        //                 params.node.groupData?.campaignname || params.node.key;
        //             const campaign = campaignMap.get(campaignName);

        //             return campaign?.start || null; // ✅ return raw date (YYYY-MM-DD)
        //         }
        //         return params.data?.from || null;
        //     },
        //     valueFormatter: (params) => {
        //         return params.value ? moment(params.value, "YYYY-MM-DD").format("DD-MM-YYYY") : '';
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        // to: {
        //     headerName: 'End',
        //     field: 'to',
        //     minWidth: 110,
        //     valueGetter: (params) => {
        //         if (params.node.group) {
        //             const campaignName =
        //                 params.node.groupData?.campaignname || params.node.key;
        //             const campaign = campaignMap.get(campaignName);
        //             return campaign && campaign.end
        //                 ? moment(campaign.end, "YYYY-MM-DD").format("DD-MM-YYYY")
        //                 : '-';
        //         }
        //         return params.data?.to || null;
        //     },
        //     cellClassRules: {
        //         'hide-leaf-cell': (params) => !params.node.group,
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        from: {
            headerName: 'Start',
            field: 'from',
            sortable: true,
            minWidth: 110,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.start || null;
                } else {
                    dateStr = params.data?.from || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        to: {
            headerName: 'End',
            field: 'to',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue already Date from valueGetter
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            valueGetter: (params) => {
                let dateStr = null;

                if (params.node.group) {
                    const campaignName =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";

                    const campaignId =
                        params.node?.childrenAfterGroup?.[0]?.data?.campaignid ||
                        params.node?.key ||
                        "";

                    const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                    dateStr = campaign?.end || null;
                } else {
                    dateStr = params.data?.to || null;
                }

                // 🔥 Convert YYYY-MM-DD → real Date object
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
            },

            cellClassRules: {
                'hide-leaf-cell': (params) => !params.node.group,
            },

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        profitloss: {
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
        // date: {
        //     headerName: 'Date', field: 'date', minWidth: 120, sortable: true,
        //     sort: "asc",
        //     filter: "agDateColumnFilter",
        //     filterParams: {
        //         comparator: (filterLocalDateAtMidnight, cellValue) => {
        //             const dateAsString = cellValue;
        //             if (dateAsString == null) return -1;
        //             const dateParts = dateAsString.split("/");
        //             const cellDate = new Date(
        //                 Number(dateParts[2]),
        //                 Number(dateParts[1]) - 1,
        //                 Number(dateParts[0])
        //             );

        //             if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        //                 return 0;
        //             }

        //             if (cellDate < filterLocalDateAtMidnight) {
        //                 return -1;
        //             }

        //             if (cellDate > filterLocalDateAtMidnight) {
        //                 return 1;
        //             }
        //             return 0;
        //         }
        //     },
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        // },
        date: {
            headerName: 'Date',
            field: 'date',
            minWidth: 110,
            sortable: true,
            filter: "agDateColumnFilter",

            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    if (!cellValue) return -1;

                    // cellValue is already a Date object
                    const cellDate = new Date(
                        cellValue.getFullYear(),
                        cellValue.getMonth(),
                        cellValue.getDate()
                    );

                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                },
            },

            // 🔥 Convert raw YYYY-MM-DD → real Date object
            valueGetter: (params) => {
                const dateStr = params.data?.date;
                if (!dateStr) return null;

                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },

            // 🔥 Display format only
            valueFormatter: (params) => {
                const d = params.value;
                return d ? moment(d).format("DD-MM-YYYY") : '';
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
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0, // Conditional formatting for negative profit
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
        conversions: { headerName: 'Conv', headerTooltip: 'Conversions', field: 'conversions', minWidth: 85, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        cpc: {
            headerName: 'CPC', field: 'cpc',
            minWidth: 80,
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
            valueGetter: getCpcLc,
            minWidth: 80,
            sortable: true,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",

        },
        fbclicks: { headerName: 'FBClicks', field: 'fbclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        fblinkclicks: { headerName: 'FB_LC', headerTooltip: 'fblinkclicks', field: 'fblinkclicks', minWidth: 110, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        impressions: { headerName: 'IMP', headerTooltip: 'Impressions', field: 'impressions', minWidth: 100, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        ctr: {
            headerName: 'CTR', field: 'ctr', valueGetter: getCtr, sortable: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            minWidth: 100,
            valueFormatter: (params) => `${params.value}%`,
            headerTooltip: 'CTR = (FBClicks / Impressions) * 100',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        rpc: { headerName: 'RPC', minWidth: 80, field: 'rpc', valueGetter: getRpc, sortable: true, filter: 'agNumberColumnFilter', headerTooltip: 'RPC = Revenue / Conversions', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', cellStyle: { fontWeight: 'bold' } },
        cpl: { headerName: 'CPL', minWidth: 80, field: 'cpl', valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter', headerTooltip: 'CPL = Spend / FBLeads', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        ncpl: { headerName: 'NCPL', minWidth: 90, field: 'ncpl', valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter', headerTooltip: 'NCPL = Spend / Conversions', suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' },
        fmargin: {
            headerName: 'FMargin', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: "agTextColumnFilter",
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
            headerName: 'ROI', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: 'Profit/Spend', filter: "agNumberColumnFilter",
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
        history: {
            headerName: 'Activity',
            field: 'history',
            minWidth: 90,
            hide: true,
            sortable: false,
            filter: false,
            enableSorting: false,
            enableFilter: false,
            suppressMenu: true,
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignActualSpend, setCampaignActualSpend] = useState({});
                const [hasBudget, setHasBudget] = useState(false);
                const [confirmLoading, setConfirmLoading] = useState(false);

                const isGroupRow = !!params?.node?.groupData;

                // campaign id + campaign name for this row/group
                const campaignId = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.campaignid
                    : params?.data?.campaignid;

                const campaignname = isGroupRow
                    ? params?.node?.key
                    : params?.data?.campaignname;

                // ✅ the *accountNumber of this row/group* (not the selected accounts list)
                const rowAccountNumber = isGroupRow
                    ? params?.node?.allLeafChildren?.[0]?.data?.accountNumber
                    : params?.data?.accountNumber;




                if (params?.node?.rowPinned === 'bottom' || params?.node?.footer) return null;

                return (
                    <div>
                        <HistoryOutlined />
                    </div>
                );
            },
        },
    };

    const columnDefsObject4 = useMemo(() =>
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
        const newOrderItems = [columnDefsObject3["keyword"], ...orderItems];
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
        if (mainData?.length > 0 && Camapignlevelstatus.length > 0 && campaignComments.length > 0) {
            setColumnDefs(getColumnDefs(mainData));
            columnDefs1.current = getColumnDefs2(mainData);
            columnDefs2.current = getColumnDefs2(mainData);
            columnDefs3.current = getColumnDefs3(mainData);
            columnDefs4.current = getColumnDefs4(mainData);
            columnDefsAdsetLevel.current = getColumnDefsAdsetLevel(mainData);
            columnDefsAdLevel.current = getColumnDefsAdLevel([...(newRevenuePratner === "FB_TonicRsoc" ? ["keyword"] : []), ...(mainData)]);
            columnDefsAdsetLevelDaily.current = (getColumnDefsAdsetLevelDaily(mainData));
            columnDefsAdLevelDaily.current = (getColumnDefsAdLevelDaily([...(newRevenuePratner === "FB_TonicRsoc" ? ["keyword"] : []), ...(mainData)]));
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
    }, [mainData, Camapignlevelstatus, campaignComments]);


    const updatingColumnsStructure = async (updateDataArray) => {
        // console.log(updateDataArray);
        const response = await apiClient.put(`/api/updateUserData?email=${userdetails.email}`,
            {
                updateDataArray
            });
        // console.log(response.data);
        mainDataRef.current = updateDataArray;
        setColumnDefs(getColumnDefs(updateDataArray));
        columnDefs1.current = (getColumnDefs2(updateDataArray));
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
            setInitialLoading(true);
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
            columnDefsAdLevel.current = (getColumnDefsAdLevel([...(newRevenuePratner === "FB_TonicRsoc" ? ["keyword"] : []), ...(mainData.columnStructure)]));
            columnDefsAdsetLevelDaily.current = (getColumnDefsAdsetLevelDaily(mainData.columnStructure));
            columnDefsAdLevelDaily.current = (getColumnDefsAdLevelDaily([...(newRevenuePratner === "FB_TonicRsoc" ? ["keyword"] : []), ...(mainData.columnStructure)]));
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
            setInitialLoading(false);
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
        try {
            // setInitialLoading(true);
            setAllCampaignsStatus(false);
            // const fetchData = await apiClient.get(
            //     `/AllCampaigns?accountNumber=${newaccount}&timezone=${time}&network=${newtworkCollections[revenuePratner]}&campaignName=${inputValue}`
            // );
            // setAllProfitLossArray(fetchData?.data);
            setAllProfitLossArray([]);
            setAllCampaignsStatus(true);
        }
        catch (err) {
            setInitialLoading(false);
            setAllProfitLossArray([]);
            setAllCampaignsStatus(true);
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

    const functionCallForCommnets = async (accountOrAccounts) => {
        setCommentsStatus(false);
        // const accounts = Array.isArray(accountOrAccounts) ? accountOrAccounts.map(String) : [String(accountOrAccounts)];
        // const accounts = Array.isArray(accountOrAccounts) && accountOrAccounts?.length > 0 ? accountOrAccounts.map(String) : storedData?.account ? storedData?.account : [String(accountOrAccounts)];

        try {
            setInitialLoading(true);
            const { data } = await apiClient.post('/NewComment', { accountNumbers: accountOrAccounts });
            setCampaignComments(data);     // data already includes all selected accounts’ comments
            setInitialLoading(false);
        } catch {
            setCampaignComments([]);
            setInitialLoading(false);
        } finally {
            setCommentsStatus(true);
            setInitialLoading(false);
        }
    };


    const functionCallForCampaigns = async (accountOrAccounts) => {
        setCampaignsStatus(false);
        console.log("accountOrAccounts", accountOrAccounts);
        // console.log(storedData);

        // const accounts = Array.isArray(accountOrAccounts) && accountOrAccounts?.length > 0 ? accountOrAccounts.map(String) : storedData?.account ? storedData?.account : [String(accountOrAccounts)];

        // console.log("accounts", accounts);
        console.log(newaccount)
        try {
            setInitialLoading(true);
            const { data } = await apiClient.post('/Campaignstatusfb', { accountNumbers: accountOrAccounts });
            setCamapignlevelstatus(data);
            setInitialLoading(false);
        } catch {
            setCamapignlevelstatus([]);
            setInitialLoading(false);
        } finally {
            setCampaignsStatus(true);
            setInitialLoading(false);
        }
    };






    // const functionCallForCommnets = async (account) => {
    //     try {
    //         const commentFetch = await apiClient.get(`/Comments/${account}`);
    //         const campaignComments = commentFetch.data; // Set comments only if fetched successfully
    //         setCampaignComments(campaignComments);
    //         setCommentsStatus(true);

    //     } catch (err) {
    //         setCampaignComments([]); // Reset comments if fetch fails
    //         setCommentsStatus(true);
    //     }
    // };

    // const functionCallForCampaigns = async (account) => {
    //     try {
    //         const campaignStatusFetch = await apiClient.get(`/Campaignstatusfb/${account}`);

    //         if (campaignStatusFetch.status === 200) {
    //             setCamapignlevelstatus(campaignStatusFetch.data); // Update state with fetched campaign status
    //         }
    //         setCampaignsStatus(true);
    //     } catch (err) {
    //         setCamapignlevelstatus([]); // Reset campaign status if fetch fails
    //         setCampaignsStatus(true);
    //     }
    // };

    const deriveInitialArray = (dash, stored, nets) => {
        const fromDash = dash?.replace(/\+/g, " ").trim();
        if (fromDash) return [fromDash];

        const fromStore = stored?.account;
        if (Array.isArray(fromStore)) return fromStore.map(String);
        if (typeof fromStore === "string" && fromStore.trim()) {
            return fromStore.split(",").map(s => s.trim()).filter(Boolean).map(String);
        }

        const first =
            Array.isArray(nets) && nets.length
                ? (typeof nets[0] === "string" ? nets[0] : nets[0]?.accountNumber)
                : "";
        return first ? [String(first)] : [];
    };

    const arraysEqualSet = (a, b) => {
        if (a.length !== b.length) return false;
        const sa = new Set(a.map(String));
        for (const v of b) if (!sa.has(String(v))) return false;
        return true;
    };

    // useEffect(() => {
    //     const preferredArr = deriveInitialArray(accountNumberFromDashboard, storedData, networksData);
    //     if (!preferredArr.length) return;

    //     const isOnFallback =
    //         selectedValue.length === 0 ||
    //         (Array.isArray(networksData) &&
    //             networksData.length &&
    //             selectedValue.length === 1 &&
    //             selectedValue[0] === (typeof networksData[0] === "string"
    //                 ? networksData[0]
    //                 : networksData[0]?.accountNumber));

    //     // ✅ Only set if user hasn't manually picked AND current selection differs
    //     if (!userPickedRef.current && (isOnFallback || !arraysEqualSet(selectedValue, preferredArr))) {
    //         setSelectedValue(preferredArr.map(String));
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [accountNumberFromDashboard, storedData?.account, networksData]);

    // useEffect(() => {
    //     const preferredArr = deriveInitialArray(accountNumberFromDashboard, storedData, networksData) || [];
    //     if (!preferredArr.length) return;

    //     // normalize (stringify, dedupe, sort) to avoid ref/order churn
    //     const toNorm = (arr) =>
    //         Array.from(new Set((arr || []).map(String))).filter(Boolean).sort();

    //     const normPreferred = toNorm(preferredArr);
    //     const normSelected = toNorm(selectedValue);

    //     const same =
    //         normPreferred.length === normSelected.length &&
    //         normPreferred.every((v, i) => v === normSelected[i]);

    //     // ✅ Only set if user hasn't manually picked AND content actually differs
    //     if (!userPickedRef.current && !same) {
    //         setSelectedValue(normPreferred);
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [accountNumberFromDashboard, storedData?.account, networksData]);

    useEffect(() => {
        if (campaignsStatus && commentsStatus && columnStructureStatus && allCampaignsStatus) {
            setMoveForward(true);
        }
    }, [campaignsStatus, commentsStatus, columnStructureStatus, allCampaignsStatus]);

    const functionCall = async (account) => {
        await functionCallForAllCampaignsData();
        await functionCallForCampaigns(account);
        await functionCallForCommnets(account);
        await functionCallForUserColumnStructure();
    };

    // ✅ Calls `functionCall` when page loads
    // useEffect(() => {
    //     functionCall(account);
    // }, []);

    useEffect(() => {
        console.log(newaccount)
        functionCall(newaccount);  // pass the array
    }, []);



    const selectRevenuePartner = ["Fb_Mnet", "Fb_Enki"];
    let selectElementAccounts = [];
    const mnetAccounts = ['674038077865381', '665204411821465'];
    const enkiAccounts = ['364991119488050'];

    // const onChangeSelectRevenue = (value) => {
    //     const accountsForAccess = adAccounts[value];

    //     const accountsAccess = accountsForAccess === undefined ? [] : accountsForAccess;
    //     setNetworksData(accountsAccess);
    //     setRevenuePartner(value);
    //     value === "FB_Rsoc" || value === "FB_Tonic" || value === "FB_DomainActive" || value === "FB_Tonic1" || value === "FB_TonicRsoc" ? setTime('PDT') : setTime('UTC')
    // }

    // ✅ run once on mount (for default network)
    // useEffect(() => {
    //     const defaultNetwork = networkFromDashboard ?? storedData?.revenuePratner ?? networks[0];
    //     if (defaultNetwork) {
    //         onChangeSelectRevenue(defaultNetwork);
    //     }
    // }, []);

    // whenever network changes
    const onChangeSelectRevenue = (value) => {
        console.log(value);
        // userPickedRef.current = true;
        // const accountsForAccess = adAccounts[value];
        // const accountsAccess = accountsForAccess === undefined ? [] : accountsForAccess;

        // setNetworksData(accountsAccess);
        // setRevenuePartner(value)
        // setSelectedValue([]);
        // localStorage.getItem(" ")
        // onChangeSelect([]);
        // setAccountChanged(true);
        // setAccountName("");
        // setSearchText("");
        // setIsOpen(false);
        // localStorage.removeItem("selectedAccounts");


        // setAccount("");
        setAccountName("");
        setSelectedValue([])
        onChangeSelect([]);
        setAccountChanged(true);
        setSearchText("");
        setIsOpen(false);
        const accountsForAccess = adAccounts[value];
        console.log(accountsForAccess);
        const accountsAccess = accountsForAccess === undefined ? [] : accountsForAccess;
        console.log(accountsAccess);
        setNetworksData(accountsAccess);
        setRevenuePartner(value)
        setNewAccount([String(accountsAccess[0].accountNumber)])
        setAccount([String(accountsAccess[0].accountNumber)])
        setAccountName((accountsAccess[0].accountName))
        setnewAccountName((accountsAccess[0].accountName))

        // ⏰ set timezone
        // value === "FB_Rsoc" ||
        //     value === "FB_Tonic" ||
        //     value === "FB_DomainActive" ||
        //     value === "FB_Tonic1" ||
        //     value === "FB_TonicRsoc" ||
        //     value === "FB_Predicto" ||
        //     value === "FB_Sedo"
        //     ? setTime(
        //         value === "FB_Predicto"
        //             ? "EDT"
        //             : value === "FB_Sedo"
        //                 ? "CET"
        //                 : "PDT"
        //     )
        //     : setTime("UTC");

        setTime(NetworkDefaultTimezones[value] || "UTC")
        // ✅ pick first active account
        const firstActive = accountsAccess.find(acc => acc.status === "Active");
        if (firstActive) {
            setSelectedValue([String(firstActive.accountNumber)]);
        } else {
            setSelectedValue([]);
        }
    };

    const onChangeSelect = (value) => {
        setAccount(value);
    }

    const onChangeTime = (value) => {
        setTime(value);
        setTimezoneChanged(true);
    }

    const onClickButton = async () => {
        // Clear search input if account was changed
        if (accountChanged || dateChanged || timezoneChanged) {
            setInputValue(''); // ✅ Clear search input
            // Also clear AG Grid filter if you're using it
            // gridRef.current?.api?.setQuickFilter?.('');
        }

        // Reset change flags
        setAccountChanged(false);
        setDateChanged(false);
        setTimezoneChanged(false);

        localStorage.removeItem("storedData");

        const storedData = {
            startDate,
            endDate,
            revenuePratner,
            time,
            account,
            accountName
        };
        console.log(storedData, "storedData");
        localStorage.setItem("storedData", JSON.stringify(storedData));
        setCampaignsStatus(false);
        setCommentsStatus(false);
        setColumnStructureStatus(false);
        setAllCampaignsStatus(false);
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
        'CEST',
        'CET'
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
            setDateChanged(true);
        }
        // setDateChanged(true); 
    };


    const fetchCampaignComments = async () => {
        try {

            const response = await apiClient.get(`/Comments/${account}`);
            setCampaignComments(response.data); // Update the state with the fetched comments
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };


    // useEffect(() => {
    //     // Ensure it only runs if `refrst` changes after the first render
    //     if (hasFetched.current) {
    //         fetchCampaignComments();
    //     } else {
    //         hasFetched.current = true; // Set it to true after first render
    //     }
    // }, [refrst]); // Run this effect when refrst changes


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
            setRefreshContent("Refresh" + activeTab);
        }
            , 100);
        setTimeout(() => {
            setRefreshContent("");
        }
            , 500);

    };

    const onClickRefresh = async () => {
        // console.log(activeTab);
        // await functionCallForAllCampaignsData();

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
    // const [selectedValue, setSelectedValue] = useState(
    //     accountNumberFromDashboard ? accountNumberFromDashboard?.replace(/\+/g, " ") : (storedData ? storedData?.account : typeof networksData[0] === 'string' ? networksData[0] : networksData[0].accountNumber)
    // ); // Track selected value

    // before:
    // const [selectedValue, setSelectedValue] = useState(<string>);




    const handleDropdownVisibleChange = (open) => {
        setIsOpen(open); // Set dropdown open state
        setAccountNumberToPass(null);
    };

    // Handle option selection
    // const handleChange1 = (value) => {
    //     const findAccount = (data, accountNumber) =>
    //         Object.values(data).flat().find(item => item.accountNumber === accountNumber) || null;

    //     const accountNameForAccount = findAccount(userdetails?.adAccounts, value);
    //     setAccountName(accountNameForAccount.accountName)
    //     setSelectedValue(value); // Update selected value
    //     onChangeSelect(value); // Call onChangeSelect function

    //     // Mark that account was changed
    //     setAccountChanged(true);
    // };

    // value will be an array of accountNumbers (strings)
    //     const handleChange1 = (newValues) => {

    //         setAccount(newValues);
    //         // setNewAccount(newValues);
    //         const accountsNames = newValues.map(item => {
    //   const found = accountsAccess.find(acc => acc.accountNumber === item);
    //   return found ? found.accountName : null;
    // });
    //         setAccountName(accountsNames)
    //         // setnewAccountName(accountsNames)
    //     };

    const handleChange1 = (newValues) => {
        const normalized = newValues.map(String);
        const visibleSet = new Set(filteredAccounts.map(a => String(a.accountNumber)));

        setAccount((prevSelected) => {
            const prev = new Set(prevSelected.map(String));

            visibleSet.forEach(v => prev.delete(v));

            // Add newly selected
            normalized.forEach(v => prev.add(v));

            const final = Array.from(prev);

            // Save to localStorage
            localStorage.setItem("selectedAccounts", JSON.stringify(final));

            // Send to parent
            onChangeSelect(final);
            setAccountChanged(true);

            // Update names
            const names = final.map(num => {
                const f = accountsAccess.find(acc => String(acc.accountNumber) === num);
                return f ? f.accountName : null;
            });

            setAccountName(names);
            // setnewAccountName(names);

            return final;
        });
    };

    const filteredAccounts = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        if (!q) return accountsAccess;
        return accountsAccess.filter((a) =>
            `${a.accountNumber} ${a.accountName || ""}`.toLowerCase().includes(q)
        );
    }, [accountsAccess, searchText]);

    // helper to render the checkbox list using existing accountsAccess
    // const renderAccountsCheckboxes = (theme) => (
    //     <Checkbox.Group
    //         options={filteredAccounts.map((account) => ({
    //             value: String(account.accountNumber),
    //             label: (
    //                 <div
    //                     style={{
    //                         display: 'flex',
    //                         justifyContent: 'space-between',
    //                         alignItems: 'center',
    //                         padding: '5px 10px',
    //                         borderBottom: '1px solid #ddd'
    //                     }}
    //                 >
    //                     <div style={{ display: 'flex', flexDirection: 'column' }}>
    //                         <span style={{ fontWeight: 600 }}>{account.accountNumber}</span>
    //                         {/* show accountName only when dropdown open (same as your old pattern) */}
    //                         {isOpen && (
    //                             <span style={{ fontSize: 12, color: 'gray' }}>
    //                                 {account.accountName || ''}
    //                             </span>
    //                         )}
    //                     </div>
    //                     <span style={{ textAlign: 'right', marginLeft: 10 }}>
    //                         {account.status === "Active" ? (
    //                             <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} className='black-icon-active-1' />
    //                         ) : (
    //                             <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} className='black-icon-pause-1' />
    //                         )}
    //                     </span>
    //                 </div>
    //             ),
    //         }))}
    //         value={selectedValue}      // array of selected accountNumbers
    //         onChange={handleChange1}   // updates your selectedValue + notifies parent
    //         className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
    //     />
    // );

    const renderAccountsCheckboxes = (theme) => {

        const activeAccounts = filteredAccounts.filter(acc => acc.status === 'Active');

        return (
            <div>

                <div style={{ display: "flex", gap: 10 }}>
                    <Checkbox
                        className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
                        indeterminate={
                            account.length > 0 && account.length < activeAccounts.length
                        }
                        checked={account.length === activeAccounts.length}
                        onChange={(e) => {
                            if (e.target.checked) {
                                handleChange1(activeAccounts.map(acc => String(acc.accountNumber)));
                            } else {
                                handleChange1([]);
                            }
                        }}
                    >
                        <h5 style={{ color: theme === "dark" ? "#fff" : "#333", fontSize: '14px' }}> All Accounts</h5>
                    </Checkbox>
                    <TiTickOutline
                        style={{
                            fontSize: 20,
                            color: "#52c41a",
                            cursor: "pointer",
                        }}
                        title="Select All Active Accounts"
                        onClick={onClickButton}
                    />
                    <TiTimesOutline
                        style={{
                            fontSize: 20,
                            color: "#ff4d4f",
                            cursor: "pointer",
                        }}
                        title="Unselect All"
                        // onClick={async () => {
                        //     handleChange1([]);
                        //     setaccount([]);
                        //     setAccount([]);
                        //     await onClickButton();
                        // }}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleChange1([]);
                            // setaccount([]);
                            // setAccount([]);
                            // schedule toggle so state setters run first
                            // setTimeout(() => onClickButton(), 1500);
                        }}
                    />
                </div>
                {/* Individual account checkboxes */}
                {/* <Checkbox.Group
                    options={filteredAccounts.map((account) => ({
                        value: String(account.accountNumber),
                        label: (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '5px 10px',
                                    borderBottom: '1px solid #ddd'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600 }}>{account.accountNumber}</span>
                                    {isOpen && (
                                        <span style={{ fontSize: 12, color: 'gray' }}>
                                            {account.accountName || ''}
                                        </span>
                                    )}
                                </div>
                                <span style={{ textAlign: 'right', marginLeft: 10 }}>
                                    {account.status === 'Active'
                                        ? <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} className='black-icon-active-1' />
                                        : <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} className='black-icon-pause-1' />}
                                </span>
                            </div>
                        ),
                    }))}
                    value={account}
                    // onChange={handleChange1}
                    onChange={(checkedList) => handleChange1(checkedList)}

                    className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
                /> */}
                <Checkbox.Group
                    options={filteredAccounts.map((account) => ({
                        value: String(account.accountNumber),
                        label: (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '5px 10px',
                                    borderBottom: '1px solid #ddd',
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600 }}>{account.accountNumber}</span>
                                    {isOpen && (
                                        <span style={{ fontSize: 12, color: 'gray' }}>
                                            {account.accountName || ''}
                                        </span>
                                    )}
                                </div>
                                <span style={{ textAlign: 'right', marginLeft: 10 }}>
                                    {account.status === 'Active' ? (
                                        <CheckCircleFilled
                                            style={{ color: '#91C25F', fontSize: 15 }}
                                            className="black-icon-active-1"
                                        />
                                    ) : (
                                        <CloseCircleFilled
                                            style={{ color: '#EC7117', fontSize: 15 }}
                                            className="black-icon-pause-1"
                                        />
                                    )}
                                </span>
                            </div>
                        ),
                    }))}

                    // ✅ Show checked only for visible accounts
                    value={account.filter((v) =>
                        filteredAccounts.some(
                            (acc) => String(acc.accountNumber) === String(v)
                        )
                    )}

                    // ✅ Send only visible checked list to handler
                    onChange={(checkedList) => handleChange1(checkedList)}

                    className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
                />

            </div>
        );
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
                                // fontWeight: 'bold',
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
                                <CheckCircleFilled style={{ color: '#91C25F', fontSize: '15px' }} className='black-icon-active-1' />
                            ) : (
                                <CloseCircleFilled style={{ color: '#EC7117', fontSize: '15px' }} className='black-icon-pause-1' />
                            )}
                        </span>
                    </div>
                ),
                text: account.accountNumber, // For sorting/filtering purposes
            };
        }
    };

    const resetColumnStructure = () => {
        updatingColumnsStructure(columnStructure)
    }

    // const refreshComments = (comment) => {
    //     functionCallForCommnets(comment);
    // }

    const refreshComments = () => functionCallForCommnets(selectedValue);


    const items = [
        { key: '1', label: 'Live', content: 'Content for Live data' },
        { key: '2', label: 'Daily', content: 'Content for Daily data' },
        // { key: '3', label: 'Campaigns', content: 'Content for Campaign data' },
        { key: '4', label: 'Agency', content: 'Content for BMName data' },
        ...(newRevenuePratner === "FB_Mnet" ? [{ key: '5', label: 'Domain', content: 'Content for Domain data' }] : []),
        ...(newRevenuePratner === "FB_DomainActive" ? [{ key: '5', label: 'Keywords', content: 'Content for Keyword data' }] : []),
        ...(newRevenuePratner === "FB_System1" ? [{ key: '5', label: 'Domain', content: 'Content for Domain data' }] : []),
        ...(newRevenuePratner === "FB_Tonic1" ? [{ key: '5', label: 'Keywords', content: 'Content for Keyword data' }] : []),
        ...(newRevenuePratner === "FB_Inmobi" ? [{ key: '5', label: 'Keywords', content: 'Content for Keyword data' }] : []),
        ...(newRevenuePratner === "FB_TonicRsoc" ? [{ key: '5', label: 'Keywords', content: 'Content for Keyword data' }] : []),

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
        <StickyBox offsetTop={64} offsetBottom={20} style={{
            zIndex: 1, padding: '0px', marginLeft: '10px', paddingLeft: '12px',
            borderRadius: 12,
            backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
            padding: 1,
            boxShadow:
                theme === 'dark'
                    ? '0 1px 3px rgba(0,0,0,0.6)'
                    : '0 1px 6px rgba(0,0,0,0.08)',
        }}>

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
    // const [aiLoading, setAiLoading] = useState(false);
    // const [aiError, setAiError] = useState(null);
    // const [recDataByAccount, setRecDataByAccount] = useState({});
    // const [recAccounts, setRecAccounts] = useState([]);
    // const network = networkFromDashboard ?? storedData?.revenuePratner ?? networks[0]
    // function buildAiAssistantHref(selectedValue, network, time) {
    //     const accounts = Array.isArray(selectedValue)
    //         ? selectedValue
    //         : String(selectedValue || '')
    //             .split(',')
    //             .map(s => s.trim())
    //             .filter(Boolean);

    //     if (!accounts.length) return '';
    //     const accountsParam = encodeURIComponent(accounts.join(','));
    //     const qs = new URLSearchParams();
    //     if (network) qs.set('network', String(network));
    //     if (time) qs.set('time', String(time));

    //     const q = qs.toString();
    //     return q
    //         ? `/AiAssistant/${accountsParam}?${q}`
    //         : `/AiAssistant/${accountsParam}`;
    // }

    // useEffect(() => {
    //     const accounts = Array.isArray(newaccount)
    //         ? newaccount
    //         : String(newaccount || '').split(',').map(s => s.trim()).filter(Boolean);

    //     if (!accounts.length) {
    //         setRecDataByAccount({});
    //         setRecAccounts([]);
    //         setAiLoading(false);
    //         setAiError(null);
    //         return;
    //     }

    //     // const url =
    //     //     accounts.length === 1
    //     //         ? `https://prodapis.adsgoat.in/Recommendations/${encodeURIComponent(accounts[0])}`
    //     //         : `https://prodapis.adsgoat.in/Recommendations?accounts=${accounts.join(',')}`;

    //     // const token = localStorage.getItem('token');

    //     (async () => {
    //         try {
    //             setInitialLoading(true);
    //             setAiLoading(true);
    //             setAiError(null);

    //             const headers = {};
    //             if (token) {
    //                 headers['Authorization'] = token;
    //             }

    //             const authHeaders = { headers: { Authorization: localStorage.getItem("token") } };

    //             const res = await axios.post(
    //                 `https://prodapis.adsgoat.in/Recommendations`,
    //                 { "accounts": accounts, ...(accounts.length > 1 ? { "merge": true, "includeAccounts": true } : {}) },
    //                 authHeaders
    //             );
    //             if (res.status === 404) {
    //                 setRecDataByAccount({});
    //                 setRecAccounts([]);
    //                 setAiLoading(false);
    //                 return;
    //             }

    //             // if (!res.ok) throw new Error(`HTTP ${res.status}`);

    //             const data = res.data;
    //             setRecDataByAccount(data);
    //             // setRecAccounts(accounts.filter(acc => data?.[acc]));
    //             const validAccounts = accounts.filter(acc => {
    //                 const accountData = data?.[acc];
    //                 if (!accountData) return false;

    //                 const hasConditions = Array.isArray(accountData.condition) && accountData.condition.length > 0;
    //                 const hasSummary = accountData.summary && Object.keys(accountData.summary).length > 0;

    //                 return hasConditions || hasSummary;
    //             });

    //             setRecAccounts(validAccounts);
    //             setInitialLoading(false);
    //         } catch (e) {
    //             setInitialLoading(false);
    //             setAiError(e.message || 'Failed to load');
    //             setRecDataByAccount({});
    //             setRecAccounts([]);
    //         } finally {
    //             setAiLoading(false);
    //             setInitialLoading(false);
    //         }
    //     })();
    // }, [newaccount]);
    // const aiItems = useMemo(() => {
    //     if (aiLoading) {
    //         return [
    //             {
    //                 key: 'loading',
    //                 disabled: true,
    //                 label: (
    //                     <span style={{ fontSize: 13, color: theme === 'dark' ? '#bbb' : '#666' }}>
    //                         Loading recommendations…
    //                     </span>
    //                 ),
    //             },
    //         ];
    //     }
    //     // if (aiError) {
    //     //     return [
    //     //         {
    //     //             key: 'error',
    //     //             disabled: true,
    //     //             label: (
    //     //                 <span style={{ fontSize: 13, color: '#d4380d' }}>
    //     //                     Error: {aiError}
    //     //                 </span>
    //     //             ),
    //     //         },
    //     //     ];
    //     // }
    //     if (recAccounts.length === 0) {
    //         return [
    //             {
    //                 key: 'empty',
    //                 disabled: true,
    //                 label: (
    //                     <span style={{ fontSize: 12, color: theme === 'dark' ? '#bbb' : '#666' }}>
    //                         No recommendations found (last 2 days).
    //                     </span>
    //                 ),
    //             },
    //         ];
    //     }
    //     // const first = recDataByAccount[recAccounts[0]] || {};
    //     // const condition = Array.isArray(first.condition) ? first.condition : [];
    //     // Collect all conditions across valid accounts
    //     const allConditions = new Set();
    //     recAccounts.forEach(acc => {
    //         const accConditions = recDataByAccount[acc]?.condition || [];
    //         accConditions.forEach(c => allConditions.add(c));
    //     });
    //     const condition = Array.from(allConditions);

    //     const totals = {};
    //     condition.forEach(k => (totals[k] = 0));
    //     recAccounts.forEach(acc => {
    //         const s = recDataByAccount[acc]?.summary;
    //         if (!s) return;
    //         condition.forEach(k => {
    //             totals[k] += Number(s?.[k]?.count || 0);
    //         });
    //     });
    //     const LABEL_TEXT_BY_CONDITION = {
    //         highROI: 'campaigns showing ROI > 20%',
    //         lowROI: 'campaigns showing ROI < -20%',
    //         lowCTR: 'campaigns showing CTR < 3%',
    //     };
    //     const buildQuery = (obj) => {
    //         const qs = new URLSearchParams();
    //         Object.entries(obj).forEach(([k, v]) => {
    //             if (v !== undefined && v !== null && String(v).trim() !== '') {
    //                 qs.set(k, String(v));
    //             }
    //         });
    //         return qs.toString();
    //     };

    //     const arr = condition.map((k, idx) => {
    //         const text = LABEL_TEXT_BY_CONDITION[k] || 'campaigns';
    //         return {
    //             key: String(idx + 1),
    //             label: (
    //                 <div>
    //                     <strong>{k} Campaigns</strong>
    //                     <div style={{ fontSize: 12, color: theme === 'dark' ? '#bbb' : '#888' }}>
    //                         {totals[k]} {text}
    //                     </div>
    //                 </div>
    //             ),
    //         };
    //     });
    //     arr.push({
    //         type: 'divider',
    //         style: {
    //             border: theme === 'dark' ? '1px solid #ccc' : '1px solid #f0f0f0',
    //             margin: '6px 0',
    //         },
    //     });


    //     arr.push({
    //         key: 'view-all',
    //         label: (
    //             <Button
    //                 type="link"
    //                 onClick={() => {
    //                     const href = buildAiAssistantHref(selectedValue, network, time);
    //                     if (href) window.open(href, '_blank', 'noopener,noreferrer');
    //                 }}
    //                 style={{ color: theme === 'dark' ? '#52c41a' : '#389e0d', padding: 0 }}
    //             >
    //                 View All Recommendations
    //             </Button>
    //         ),
    //     });

    //     return arr;
    // }, [aiLoading, aiError, recAccounts, recDataByAccount, theme]);

    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [aiSummary, setAiSummary] = useState(null);
    const [aiRequested, setAiRequested] = useState(false);




    const network = networkFromDashboard ?? storedData?.revenuePratner ?? networks[0];


    function buildAiAssistantHref(selectedValue, network, time) {
        const accounts = Array.isArray(selectedValue)
            ? selectedValue
            : String(selectedValue || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);


        if (!accounts.length) return '';
        const accountsParam = encodeURIComponent(accounts.join(','));
        const qs = new URLSearchParams();
        if (network) qs.set('network', String(network));
        if (time) qs.set('time', String(time));


        const q = qs.toString();
        return q
            ? `/AiAssistant/${accountsParam}?${q}`
            : `/AiAssistant/${accountsParam}`;
    }


    function resolveAiNetwork(network) {
        if (!network) return network;




        if (networkCollectionsForAiAssistant[network]) {
            return networkCollectionsForAiAssistant[network];
        }


        return network;
    }


    useEffect(() => {
        if (!aiRequested) return; // 🔑 stop auto call on page load


        const accounts = Array.isArray(newaccount)
            ? newaccount
            : String(newaccount || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);


        if (!accounts.length) {
            setAiSummary(null);
            setAiError(null);
            setAiLoading(false);
            return;
        }


        const resolvedNetwork = resolveAiNetwork(network);


        (async () => {
            try {
                setAiLoading(true);
                setAiError(null);


                const res = await axios.post(
                    'https://prodapis.adsgoat.in/AiCampaignRecommendations',
                    {
                        accountNumbers: accounts,
                        network: resolvedNetwork,
                        timezone: time,
                    },
                    {
                        headers: {
                            Authorization: localStorage.getItem('token'),
                        },
                    }
                );


                setAiSummary(res.data?.summary || null);
            } catch (e) {
                setAiError(e.message || 'Failed to load AI recommendations');
                setAiSummary(null);
            } finally {
                setAiLoading(false);
            }
        })();
    }, [aiRequested, newaccount, network, time]);


    useEffect(() => {
        setAiRequested(false);
        setAiSummary(null);
    }, [newaccount, network, time]);


    function buildConditionsFromSummary(summary) {
        if (!summary) return [];


        const conditions = [];


        if (summary.pause_loss_makers > 0) {
            conditions.push({
                key: 'pause_loss_makers',
                title: 'Pause Loss Makers',
                count: summary.pause_loss_makers,
                desc: 'campaigns losing money consistently',
            });
        }


        if (summary.scale_winners > 0) {
            conditions.push({
                key: 'scale_winners',
                title: 'Scale Winners',
                count: summary.scale_winners,
                desc: 'high ROI campaigns',
            });
        }


        if (summary.reallocate_budget?.low_performers > 0) {
            conditions.push({
                key: 'reallocate_low',
                title: 'Reallocate Budget (Low)',
                count: summary.reallocate_budget.low_performers,
                desc: 'low performing campaigns',
            });
        }


        if (summary.reallocate_budget?.high_performers > 0) {
            conditions.push({
                key: 'reallocate_high',
                title: 'Reallocate Budget (High)',
                count: summary.reallocate_budget.high_performers,
                desc: 'top performing campaigns',
            });
        }


        if (summary.risk_alert > 0) {
            conditions.push({
                key: 'risk_alert',
                title: 'Risk Alerts',
                count: summary.risk_alert,
                desc: 'early performance decline',
            });
        }
        if (summary.filtration > 0) {
            conditions.push({
                title: 'Filteration',
                count: summary.filtration,
                desc: 'Filtered campaigns',
            })
        }

        return conditions;
    }
    const aiItems = useMemo(() => {
        if (aiLoading) {
            return [{
                key: 'loading',
                disabled: true,
                label: (
                    <span style={{ fontSize: 13, color: theme === 'dark' ? '#bbb' : '#666' }}>
                        Loading recommendations…
                    </span>
                ),
            }];
        }


        if (aiError) {
            return [{
                key: 'error',
                disabled: true,
                label: (
                    <span style={{ fontSize: 12, color: '#d4380d' }}>
                        Failed to load recommendations
                    </span>
                ),
            }];
        }


        if (!aiSummary) {
            return [{
                key: 'empty',
                disabled: true,
                label: (
                    <span style={{ fontSize: 12, color: theme === 'dark' ? '#bbb' : '#666' }}>
                        No recommendations found (last 4 days).
                    </span>
                ),
            }];
        }


        const conditions = buildConditionsFromSummary(aiSummary);


        if (!conditions.length) {
            return [{
                key: 'empty',
                disabled: true,
                label: (
                    <span style={{ fontSize: 12, color: theme === 'dark' ? '#bbb' : '#666' }}>
                        No recommendations found (last 4 days).
                    </span>
                ),
            }];
        }


        const items = conditions.map((c, idx) => ({
            key: String(idx + 1),
            label: (
                <div>
                    <strong>{c.title}</strong>
                    <div style={{ fontSize: 12, color: theme === 'dark' ? '#bbb' : '#888' }}>
                        {c.count} {c.desc}
                    </div>
                </div>
            ),
        }));


        items.push({
            type: 'divider',
            style: {
                border: theme === 'dark' ? '1px solid #333' : '1px solid #f0f0f0',
                margin: '6px 0',
            },
        });


        items.push({
            key: 'view-all',
            label: (
                <Button
                    type="link"
                    onClick={() => {
                        const resolvedNetwork = resolveAiNetwork(network);


                        const href = buildAiAssistantHref(
                            newaccount,
                            resolvedNetwork,
                            time
                        );


                        if (href) {
                            window.open(href, '_blank', 'noopener,noreferrer');
                        }
                    }}


                    style={{
                        color: theme === 'dark' ? '#52c41a' : '#389e0d',
                        padding: 0,
                    }}
                >
                    View All Recommendations
                </Button>
            ),
        });


        return items;
    }, [aiLoading, aiError, aiSummary, theme, selectedValue, network, time]);

    return (
        <div className='reports-container'>
            {/* className='select-container' */}
            {/* <Space direction="vertical" style={{ width: '100%', padding: "1%" }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6} lg={5} xl={4} xxl={3}>
                        <Select
                            showSearch
                            className='select-element'
                            onChange={onChangeSelectRevenue}
                            style={{
                                width: '100%',
                                backgroundColor: theme === 'dark' && '#333', 
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
                            onChange={handleChange1} 
                            dropdownClassName={theme === 'dark' ? "custom-dropdown" : ''} 
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            style={{
                                width: '100%',
                                maxWidth: '100%',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }} 
                            placeholder="Select Account"
                            optionFilterProp="value"
                            value={accountNumberToPass ? accountNumberToPass : selectedValue}  
                            defaultValue={accountNumberFromDashboard ? accountNumberFromDashboard : (storedData ? storedData?.account : (networksData[0].accountNumber))}
                            options={accountsAccess.map((item) => createOption(item))} 
                            onDropdownVisibleChange={handleDropdownVisibleChange} 
                        />
                    </Col>
                    <Col xs={24} sm={24} md={15} lg={6} className=' Dashboard-Details-1'>
                        <ConfigProvider 
                            locale={locale}
                            theme={{
                                token: {
                                  colorPrimary: '#91C25F', 
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
                    <Col xs={24} sm={24} md={15} lg={6} className=' Dashboard-Details-2'>
                        <ConfigProvider 
                            locale={locale}
                            theme={{
                                token: {
                                  colorPrimary: '#91C25F', 
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
                                dropdownClassName={`custom-single-month-picker Dashboard-Details-2 ${theme === 'dark' ? 'dark-theme-dropdown' : ''}`}
                            />
                        </ConfigProvider>
                    </Col>

                    <Col xs={12} sm={12} md={3} lg={3} xl={2}>
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

                    <Col xs={12} sm={12} md={2}>
                       
                        <Button
  className='submit-button'
  type='primary'
  onClick={onClickButton}
  block
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  style={{
    backgroundColor: hovered ? '#91C25F' : 'transparent',
    border: '2px solid green',
    color: 'black',
    fontWeight: '600',
    transition: 'all 0.1s ease-in-out',
  }}
>
  Apply
</Button>
                    </Col>
                </Row>
            </Space> */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                // padding: "8px 0",
                flexWrap: "wrap",
                gap: "12px"
            }}>

                <Row align="middle" style={{ gap: "8px" }}
                >

                    <Col flex="none">
                        <Select
                            showSearch
                            onChange={onChangeSelectRevenue}
                            placeholder="Select Network"
                            defaultValue={networkFromDashboard ?? storedData?.revenuePratner ?? networks[0]}
                            dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
                            style={{
                                width: '160px',
                                backgroundColor: theme === 'dark' ? '#333' : undefined,
                                color: theme === 'dark' ? '#fff' : undefined,
                                border: '1px solid #4CAF50',
                                borderRadius: '6px'
                            }}
                            // optionFilterProp="label"
                            // options={networks.map(item => ({ value: item, label: item, title: '' }))}
                            options={
                                networks
                                    .sort((a, b) => {
                                        const aActive = networksWithStatus.find(n => n.Network === a)?.Status === 'Active' ? 1 : 0;
                                        const bActive = networksWithStatus.find(n => n.Network === b)?.Status === 'Active' ? 1 : 0;
                                        return bActive - aActive;
                                    })
                                    .map(network => {
                                        const isActive = networksWithStatus.find(n => n.Network === network)?.Status === 'Active';
                                        return {
                                            value: network,
                                            label: (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    {isActive ? (
                                                        <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} />
                                                    ) : (
                                                        <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} />
                                                    )}
                                                    <span>{network}</span>
                                                </div>
                                            ),
                                        };
                                    })
                            }

                            optionLabelProp="label"
                            title=''

                        />
                    </Col>
                    {/* Account Selector */}
                    {/* <Select
                    showSearch
                    onChange={handleChange1}
                    placeholder="Select Account"
                    value={accountNumberToPass ?? selectedValue}
                    defaultValue={
                        accountNumberFromDashboard ??
                        storedData?.account ??
                        networksData[0]?.accountNumber
                    }
                    dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
                    className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                    style={{
                        width: '230px',
                        whiteSpace: 'nowrap',
                        color: theme === 'dark' ? 'white' : undefined,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        border: '1px solid #4CAF50',
                        borderRadius: '6px',
                    }}
                    optionFilterProp="value"
                    options={accountsAccess.map(createOption)}
                    onDropdownVisibleChange={handleDropdownVisibleChange}
                /> */}


                    <Col flex="none">
                        <Select
                            showSearch
                            onSearch={setSearchText}
                            searchValue={searchText}
                            placeholder="Select Accounts"
                            // Keep the visible state you already have
                            open={isOpen}
                            onDropdownVisibleChange={handleDropdownVisibleChange}

                            // 👇 Show first account + count
                            value={
                                account?.length === 0
                                    ? undefined
                                    : account?.length === 1
                                        ? account[0] // just that account number
                                        : `${account[0]}, +${account?.length - 1} more`
                            }

                            dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            style={{
                                width: '290px',
                                whiteSpace: 'nowrap',
                                color: theme === 'dark' ? 'white' : undefined,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                border: '1px solid #4CAF50',
                                borderRadius: '6px',
                            }}

                            // We are not using built-in options anymore
                            optionFilterProp="value"
                            // options={accountsAccess.map(createOption)}  // ❌ remove
                            // onChange={handleChange1}                    // ❌ remove

                            // Custom dropdown with checkboxes (no tick marks in the menu)
                            dropdownRender={() => (

                                <div style={{ maxHeight: 300, overflowY: 'auto', padding: 8 }}>
                                    {renderAccountsCheckboxes(theme)}
                                </div>
                            )}
                        />
                    </Col>



                    {/* Date Range */}
                    <Col flex="none" className='Dashboard-Details-1'>
                        <ConfigProvider
                            locale={locale}
                            theme={{
                                token: {
                                    colorPrimary: '#91C25F',
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
                                    width: '240px',
                                    backgroundColor: theme === 'dark' ? '#555' : undefined,
                                    color: theme === 'dark' ? 'white' : undefined,
                                    border: '1px solid #4CAF50',
                                    borderRadius: '6px'
                                }}
                                dropdownClassName={`${theme === 'dark' ? 'dark-theme-dropdown' : 'light-theme-dropdown'}`}
                            />
                        </ConfigProvider>
                    </Col>
                    <Col flex="none" className='Dashboard-Details-2'>
                        <ConfigProvider
                            locale={locale}
                            theme={{
                                token: {
                                    colorPrimary: '#91C25F',
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
                                    width: '240px',
                                    backgroundColor: theme === 'dark' ? '#555' : undefined,
                                    color: theme === 'dark' ? 'white' : undefined,
                                    border: '1px solid #4CAF50',
                                    borderRadius: '6px'
                                }}
                                // dropdownClassName={theme === 'dark' ? 'dark-theme-dropdown' : 'light-theme-dropdown'}
                                dropdownClassName={`custom-single-month-picker Dashboard-Details-2${theme === 'dark' ? 'dark-theme-dropdown' : 'light-theme-dropdown'}`}
                            />
                        </ConfigProvider>
                    </Col>
                    {/* Timezone Selector */}

                    <Col>
                        <Select
                            showSearch
                            onChange={onChangeTime}
                            placeholder="Timezone"
                            dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
                            style={{ width: '100px', border: '1px solid #4CAF50', borderRadius: '6px' }}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            optionFilterProp="label"
                            value={time}
                            options={timezones.map(item => ({ value: item, label: item }))}
                            title=''
                        />
                    </Col>


                    {/* Apply Button */}

                    {/* <Col>
                        <Button
                            type='primary'
                            onClick={onClickButton}
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                            style={{
                                backgroundColor: hovered ? '#91C25F' : 'transparent',
                                border: '1px solid #4CAF50',
                                borderRadius: '6px',
                                color: theme === 'dark' ? '#ffffff' : '#000000',
                                // fontWeight: '600',
                                padding: '0 16px',
                                height: '32px',
                                transition: 'all 0.15s ease-in-out',
                            }}
                        >
                            Apply
                        </Button>
                        <Button
  icon={<RightOutlined />}
  onClick={() => router.push("/Basereport")}
  style={{
    border: "1px solid #4CAF50",
    borderRadius: "6px",
    height: "32px",
  }}
/>
                        
                    </Col> */}
                    <Col>
                        <Button
                            type="primary"
                            onClick={onClickButton} // Apply action
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                            style={{
                                backgroundColor: hovered ? "#91C25F" : "transparent",
                                border: "1px solid #4CAF50",
                                borderRadius: "6px",
                                color: theme === "dark" ? "#ffffff" : "#000000",
                                padding: "0 12px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                transition: "all 0.15s ease-in-out",
                            }}
                        >
                            Apply

                            {/* Divider */}
                            {/* <span style={{ opacity: 0.4 }}>|</span> */}

                            {/* <RightOutlined
      onClick={(e) => {
        e.stopPropagation(); 
        router.push("/Basereport");
      }}
      style={{ cursor: "pointer" }}
    /> */}
                            {/* <Tooltip title="Revenue base report">
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push("/Basereport");
                                    }}
                                    style={{
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        padding: "0 4px",
                                    }}
                                >
                                    R
                                </span>
                            </Tooltip> */}
                        </Button>
                    </Col>
                    {(revenuePratner === "FB_Mnet" || revenuePratner === "FB_MnetBing") && (
                        <Col>
                            <Button
                                type="primary"
                                onMouseEnter={() => setRHovered(true)}
                                onMouseLeave={() => setRHovered(false)}
                                style={{
                                    backgroundColor: Rhovered
                                        ? theme === "dark"
                                            ? "rgba(24,144,255,0.06)"
                                            : "#e6f7ff"
                                        : "transparent",
                                    border: '1px solid #91d5ff',
                                    borderRadius: "6px",
                                    color: theme === "dark" ? "#ffffff" : "#000000",
                                    padding: "0 12px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "all 0.15s ease-in-out",
                                }}
                            >
                                <Tooltip title="Revenue base report" overlayInnerStyle={{
                                    backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    border: '1px solid #ccc',
                                    borderRadius: 6,
                                    // fontWeight: 500,
                                }}>
                                    <span
                                        onClick={(e) => {
                                            // e.stopPropagation();
                                            router.push("/Basereport");
                                        }}
                                        style={{
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            padding: "0 4px",
                                        }}
                                    >
                                        R
                                    </span>
                                </Tooltip>
                            </Button>
                        </Col>
                    )}


                    <div className='Dashboard-Details-2'>
                        <Col flex="auto" style={{ textAlign: "right", marginLeft: "auto" }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 600,
                                color: theme === 'dark' ? '#fff' : '#4b5563'
                            }}>
                                Strategic Reports Center
                            </h3>
                            <p style={{
                                margin: 0,
                                fontSize: '13px',
                                color: theme === 'dark' ? '#cbd5e1' : '#6b7280'
                            }}>
                                Deep insights for strategic decisions
                            </p>
                        </Col>
                    </div>
                    {/* </Space> */}
                </Row>
                <div className='Dashboard-Details-1'>
                    <Col flex="auto" style={{ textAlign: "right", marginLeft: "auto" }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: 600,
                            color: theme === 'dark' ? '#fff' : '#4b5563'
                        }}>
                            Strategic Reports Center
                        </h3>
                        <p style={{
                            margin: 0,
                            fontSize: '13px',
                            color: theme === 'dark' ? '#cbd5e1' : '#6b7280'
                        }}>
                            Deep insights for strategic decisions
                        </p>
                    </Col>
                </div>

            </div>

            <div style={{ padding: '0px', marginLeft: '0px' }}>
                <Row gutter={8} style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    {renderCarouselNav()}
                    {/* <div style={{display: 'flex', marginRight: '15px'}}>
                      
                            <Col>
                                <Input
                                placeholder="Search keyword"
                                value={inputValue}
                                onChange={handleChangeInput}
                                onBlur={handleBlur}
                                className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                                style={{ width: '225px', borderRadius: '5px', height:'30px', backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555' }}
                                />
                            </Col>
                            <Col>
                                <Button
                                style={{
                                    backgroundColor: '#91C25F',
                                    border: 'solid 0px',
                                    color: 'black',
                                    height:'30px'
                                }}
                                icon={<SearchOutlined  className="black-icon"/>}
                                />
                            </Col>
                            <Col>
                                <Tooltip title="Click to Refresh Tables">
                                    <Button
                                    type="primary"
                                    style={{
                                        backgroundColor: '#91C25F',
                                        border: 'solid 0px',
                                        color: 'black',
                                        height:'30px'
                                    }}
                                    icon={<ReloadOutlined  className="black-icon" />}
                                    onClick={onClickRefresh}
                                    />
                                </Tooltip>
                            </Col>
                    </div> */}
                    {activeTab === '3' && (
                        <Col>
                            <Space size={2} style={{ marginRight: '10px' }}>
                                <Col sm={12} >
                                    <Input
                                        placeholder="Search..."
                                        //  prefix={<SearchOutlined />}
                                        onChange={handleChangeInput}
                                        onBlur={handleBlur}
                                        //  value={inputValue}
                                        allowClear
                                        className={theme === 'dark' ? 'inputat400px custom-input-dark' : 'inputat400px custom-input-light'}
                                        style={{
                                            borderRadius: 8,
                                            border: '1px solid #4CAF50',
                                            // background: theme === 'dark' ? '#2a2a2a' : '#fff',
                                            // border: `1px solid ${theme === 'dark' ? '#444' : '#d9d9d9'}`,
                                            color: theme === 'dark' ? '#fff' : '#000',
                                            fontWeight: 500,
                                            // width: 170,
                                            marginRight: '5px',

                                        }}
                                    />

                                </Col>
                                {/* <Tooltip 
                                title={`🍳 This feature is cooking—almost ready to serve 😜`}
                                overlayInnerStyle={{
                                    backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    border: '1px solid #ccc',   
                                    borderRadius: 6,
                                    // fontWeight: 500,
                                }}
                            > */}
                                <Dropdown
                                    overlay={
                                        <Menu
                                            className={theme === 'dark' ? 'custom-dropdown-menu-dark' : 'custom-dropdown-menu-light'}
                                            onClick={({ key }) => handleStatusFilterChange(key)}
                                            items={[
                                                {
                                                    key: 'all',
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
                                                    key: 'active',
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
                                                    key: 'pause', label: <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
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
                                            {campaignStatusLabel}
                                            <DownOutlined style={{ fontSize: 10 }} />
                                        </Space>
                                    </Button>
                                </Dropdown>
                                {/* </Tooltip>         */}

                                {/* 
                                <Tooltip
                                    title={`🍳 This feature is cooking—almost ready to serve 😜`}
                                    overlayInnerStyle={{
                                        backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        border: '1px solid #ccc',
                                        borderRadius: 6,
                                        // fontWeight: 500,
                                    }}
                                >
                                    <Button
                                        type="default"
                                        icon={<FaRobot style={{ fontSize: 20 }} />}
                                        disabled
                                        style={{
                                            borderRadius: 8,
                                            background: theme === 'dark' ? 'rgba(82,196,26,0.06)' : '#f0fdf4',
                                            border: '1px solid #4CAF50',
                                            color: theme === 'dark' ? '#52c41a' : '#389e0d',
                                            fontWeight: 500,
                                            cursor: 'not-allowed',
                                            marginRight: '5px'
                                        }}
                                    >
                                        AI Assistant
                                    </Button>
                                </Tooltip> */}
                                {/* <Dropdown
                                    menu={{
                                        items: aiItems,
                                        className: theme === 'dark' ? 'custom-dropdown-menu-dark' : 'custom-dropdown-menu-light',
                                    }}
                                    trigger={['click']}
                                >
                                    <Button
                                        type="default"
                                        icon={<FaRobot style={{ fontSize: 20 }} />}
                                        disabled={aiLoading} // only disable while *loading*; keep enabled for "no data" to show message
                                        style={{
                                            borderRadius: 8,
                                            background: theme === 'dark' ? 'rgba(82,196,26,0.06)' : '#f0fdf4',
                                            border: '1px solid #4CAF50',
                                            color: theme === 'dark' ? '#52c41a' : '#389e0d',
                                            fontWeight: 500,
                                            marginRight: '5px',
                                        }}
                                    >
                                        AI Assistant
                                    </Button>
                                </Dropdown> */}
                                <Dropdown
                                    menu={{
                                        items: aiItems,
                                        className: theme === 'dark'
                                            ? 'custom-dropdown-menu-dark'
                                            : 'custom-dropdown-menu-light',
                                    }}
                                    trigger={['click']}
                                    onOpenChange={(open) => {
                                        if (open && !aiRequested) {
                                            setAiRequested(true);
                                        }
                                    }}
                                >
                                    <Button
                                        type="default"
                                        icon={<FaRobot style={{ fontSize: 20 }} />}
                                        loading={aiLoading}
                                        style={{
                                            borderRadius: 8,
                                            background: theme === 'dark'
                                                ? 'rgba(82,196,26,0.06)'
                                                : '#f0fdf4',
                                            border: '1px solid #4CAF50',
                                            color: theme === 'dark' ? '#52c41a' : '#389e0d',
                                            fontWeight: 500,
                                            marginRight: '5px',
                                        }}
                                    >
                                        AI Assistant
                                    </Button>
                                </Dropdown>
                                <Tooltip
                                    title={`🍳 This feature is cooking—almost ready to serve 😜`}
                                    overlayInnerStyle={{
                                        backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        border: '1px solid #ccc',
                                        borderRadius: 6,
                                        // fontWeight: 500,
                                    }}
                                >
                                    <Button
                                        type="default"
                                        icon={<SettingOutlined />}
                                        disabled
                                        style={{
                                            borderRadius: 8,
                                            background: theme === 'dark' ? 'rgba(24,144,255,0.06)' : '#e6f7ff',
                                            border: '1px solid #91d5ff',
                                            color: theme === 'dark' ? '#69c0ff' : '#1d39c4',
                                            fontWeight: 500,
                                            cursor: 'not-allowed',
                                            marginRight: '5px'
                                        }}
                                    >
                                        Rules
                                    </Button>
                                </Tooltip>

                                {/* <Tooltip title="Click to Refresh Tables"> */}
                                <Button
                                    type="primary"
                                    style={{
                                        backgroundColor: '#91C25F',
                                        border: 'solid 0px',
                                        color: 'black',
                                        height: '30px'
                                    }}
                                    icon={<ReloadOutlined className="black-icon" />}
                                    onClick={onClickRefresh}
                                />
                                {/* </Tooltip> */}
                            </Space>
                        </Col>
                    )}
                </Row>
            </div>
            {!moveForward ?
                (
                    <div style={{ padding: '24px' }}>
                        <Skeleton active paragraph={{ rows: 15 }} />
                    </div>
                ) :
                (
                    //  initialLoading ?
                    //     <div style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    //         <div style={{ padding: '24px' }}>
                    //             <Skeleton active paragraph={{ rows: 20 }} />
                    //         </div>
                    //     </div>
                    //     :
                    <div>

                        <Tabs className="zoom-95" activeKey={activeTab} onChange={handleTabChange} renderTabBar={() => <></>}>
                            <Tabs.TabPane key="1">
                                {/* {Camapignlevelstatus.length > 0 && ( */}
                                <LiveReports
                                    startDate={newStartDate}
                                    endDate={newendDate}
                                    columnStructure={mainData}
                                    allCampaignData={allCampaignData}
                                    allProfitLossArray={allProfitLossArray}
                                    // newaccount={newaccount}
                                    newaccount={newaccount}
                                    newtime={newtime}
                                    newRevenuePratner={newRevenuePratner}
                                    inputValue={inputValue}
                                    newAccountName={newAccountName}
                                    columnDefs={columnDefs}
                                    columnDefs1={columnDefsAdsetLevel.current}
                                    columnDefs2={columnDefsAdLevel.current}
                                    campaignComments={campaignComments}
                                    setCampaignComments={setCampaignComments}
                                    campaignStatusFilter={campaignStatusFilter}
                                    Camapignlevelstatus={Camapignlevelstatus}
                                    setCamapignlevelstatus={setCamapignlevelstatus}
                                    commentsMap={commentsMap}
                                    changeRRefrst={resetColumnStructure}
                                    debouncedHandleColumnMove={debouncedHandleColumnMove}
                                    userdetails={userdetails}
                                    refreshComments={refreshComments}
                                    refreshpage={refreshContent}
                                    getMainMenuItems={getMainMenuItems}
                                    toggleStatus={checked}
                                    handleChangeToggle={handleChangeToggle}
                                    theme={theme}
                                    functionCallForCommnets={functionCallForCommnets}
                                    functionCallForCampaigns={functionCallForCampaigns}
                                    context={{
                                        allCampaignData,
                                        setCampaignRefreshTrigger,
                                        changeRRefrst,
                                        newaccount,
                                        userdetails,
                                        theme,
                                        setCamapignlevelstatus,
                                        campaignStatusOverridesRef, // ✅ ADD THIS
                                        adsetStatusOverridesRef,
                                        adsetPinOverridesRef,
                                        adsetCommentOverridesRef,
                                        adStatusOverridesRef,
                                        adPinOverridesRef,
                                        adCommentOverridesRef,
                                    }}
                                    handleChangeInput={handleChangeInput}
                                    handleBlur={handleBlur}
                                    onClickRefresh={onClickRefresh}
                                    accountsAccess={accountsAccess}
                                />
                                {/* )} */}
                            </Tabs.TabPane>

                            <Tabs.TabPane key="2">
                                <DailyReports
                                    startDate={newStartDate}
                                    endDate={newendDate}
                                    // newaccount={newaccount}
                                    newaccount={newaccount}
                                    newtime={newtime}
                                    newRevenuePratner={newRevenuePratner}
                                    inputValue={inputValue}
                                    newAccountName={newAccountName}
                                    columnDefs={columnDefs1}
                                    columnDefs1={columnDefsAdsetLevelDaily}
                                    columnDefs2={columnDefsAdLevelDaily}
                                    campaignComments={campaignComments}
                                    setCampaignComments={setCampaignComments}
                                    campaignStatusFilter={campaignStatusFilter}
                                    Camapignlevelstatus={Camapignlevelstatus}
                                    setCamapignlevelstatus={setCamapignlevelstatus}
                                    commentsMap={commentsMap}
                                    changeRRefrst={resetColumnStructure}
                                    debouncedHandleColumnMove={debouncedHandleColumnMove}
                                    userdetails={userdetails}
                                    refreshComments={refreshComments}
                                    refreshpage={refreshContent}
                                    getMainMenuItems={getMainMenuItems}
                                    toggleStatus={checked}
                                    handleChangeToggle={handleChangeToggle}
                                    functionCallForCommnets={functionCallForCommnets}
                                    functionCallForCampaigns={functionCallForCampaigns}
                                    context={{
                                        allCampaignData,
                                        setCampaignRefreshTrigger,
                                        changeRRefrst,
                                        newaccount,
                                        userdetails,
                                        theme,
                                        campaignStatusOverridesRef, // ✅ ADD THIS
                                        adsetStatusOverridesRef,
                                        adsetPinOverridesRef,
                                        adsetCommentOverridesRef,
                                        adStatusOverridesRef,
                                        adPinOverridesRef,
                                        adCommentOverridesRef,

                                    }}
                                    theme={theme}
                                    handleChangeInput={handleChangeInput}
                                    handleBlur={handleBlur}
                                    onClickRefresh={onClickRefresh}
                                    accountsAccess={accountsAccess}
                                />
                            </Tabs.TabPane>

                            {/* <Tabs.TabPane key="3">
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
                                    campaignStatusFilter={campaignStatusFilter}
                                    campaignStatusLabel={campaignStatusLabel}
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
                                    handleChangeInput={handleChangeInput}
                                    handleBlur={handleBlur}
                                    onClickRefresh={onClickRefresh}
                                    accountsAccess={accountsAccess}
                                />
                            </Tabs.TabPane> */}

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

                            {newRevenuePratner === "FB_TonicRsoc" && (
                                <Tabs.TabPane key="5">
                                    <TonicRsocKeywordReports
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

                            {newRevenuePratner === "FB_Inmobi" && (
                                <Tabs.TabPane key="5">
                                    <InmobiKeywordReports
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
                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
            >
                <Input value={newColumnName} placeholder='Enter Column Name' style={{ marginBottom: '10px' }} onChange={(e) => setNewColumnName(e.target.value)} />
                <Input value={formula} placeholder='Enter Formula' style={{ marginBottom: '10px' }} onChange={(e) => setFormula(e.target.value)} />
            </Modal>
            <CampaignHistoryModal
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
                campaignId={selectedCampaignIdForHistory}
                accountNumber={selectedAccountForHistory}
                adAccounts={adAccounts}
            />

        </div>
    );
};
export default MyTablePage;
