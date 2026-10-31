"use client"
import React from 'react';
import axios from 'axios';
// import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import moment from 'moment-timezone';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useTokenContext } from '../../../components/parent'
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Spin, Row, Col, Select, Input, Button, Skeleton, Switch, Tooltip, Modal, message } from 'antd';
import { ReloadOutlined, BarChartOutlined, EditOutlined, DollarOutlined } from '@ant-design/icons';
Chart.register(...registerables);
import debounce from 'lodash.debounce';

const datasetColorMap = {
    Spend: 'rgba(75, 192, 192, 1)',
    Revenue: 'rgba(54, 162, 235, 1)',
    RPC: 'rgba(255, 99, 132, 1)',
    CPL: 'rgba(255, 159, 64, 1)',
    Profit: 'rgba(255, 206, 86, 1)',
    Margin: 'rgba(153, 102, 255, 1)',
};

export default function AdsetNameAndAccount({ params }) {

    const { userdetails } = useTokenContext();

    const { apiClient } = useTokenContext();

    const gridRef = useRef();

    const [searchText, setSearchText] = useState("");

    const [uniqueObject, setUniqueObject] = useState({});

    const [selectedCells, setSelectedCells] = useState([]);
    const [firstSelectedCell, setFirstSelectedCell] = useState(null);

    const { theme } = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

    // console.log(userdetails, "userDetails");

    const user = userdetails?.email;

    // const [isGraphVisible, setIsGraphVisible] = useState(() => {
    //     const stored = localStorage.getItem('isGraphVisible');
    //     return stored ? JSON.parse(stored) : false
    // });

    const [adsetName, setAdsetName] = useState("");

    const [isGraphVisible, setIsGraphVisible] = useState(false);

    const [hovered, setHovered] = useState(false);

    const [copied, setCopied] = useState(false);

    const [comment, setComment] = useState("");

    const [isModalVisibles, setIsModalVisibles] = useState(false);

    const [campaignComments, setCampaignComments] = useState([]);

    const [columnDefs, setColumnStructure] = useState([]);

    const [isLoading, setLoading] = useState(true);
    const [dailyData, setdailyData] = useState([]);
    const [chartData, setChartData] = useState({ dates: [], spend: [], revenue: [], profit: [], margin: [] });

    const paramsData = ((params.AdsetName).split("-"));
    const decodedString = adsetName;
    // let decodedString = decodeURIComponent(paramsData[0]);
    // decodedString = decodedString.replace(/\*/g, "/").replace(/\^/g, "-");
    const AdsetId = paramsData[0];
    const accountNumber = paramsData[1];
    const timeZone = paramsData[2];
    const network = paramsData[3];
    // console.log(decodedString, "decode");
    // console.log(accountNumber);
    // console.log(timeZone);
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

    const [hiddenKeys, setHiddenKeys] = useState([
        'Spend', 'Revenue', 'RPC', 'CPL', 'Margin', // ❌ Only "Profit" shown by default
    ]);

    const toggleLegend = (label) => {
        setHiddenKeys(prev =>
            prev.includes(label) ? prev.filter(k => k !== label) : [...prev, label]
        );
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(decodedString).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500); // Reset after 1.5 seconds
        });
    };

    const datasets = Object.keys(datasetColorMap).map(label => ({
        label,
        data: chartData[label.toLowerCase()],
        borderColor: datasetColorMap[label],
        // backgroundColor: datasetColorMap[label].replace('1)', '0.2)'),
        // fill: true,
        hidden: hiddenKeys.includes(label),
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: datasetColorMap[label],
        pointHoverBackgroundColor: datasetColorMap[label],
    }));

    const getMargin = (params) => {
        if (params.data !== undefined) {
            const { revenue, spend } = params.data;

            if (revenue !== "0.00" || revenue !== undefined) {
                const RPC = ((revenue - spend) / revenue) * 100;
                if (RPC === Infinity || isNaN(RPC) || RPC === -Infinity) {
                    return `0%`;
                }
                return `${Math.round(RPC * 100) / 100}%`;

            }
        }
        if (params.node.aggData !== undefined) {
            const { revenue, spend } = params.node.aggData;
            if (revenue !== "0.00" || revenue !== undefined) {
                const RPC = ((revenue - spend) / revenue) * 100;
                if (RPC === Infinity || isNaN(RPC) || RPC === -Infinity) {
                    return `0%`;
                }
                return `${Math.round(RPC * 100) / 100}%`;

            }
        }

        return 0;
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
        if (params.data !== undefined) {
            const { impressions, fbclicks } = params.data;
            if (impressions !== 0) {
                const RPC = (fbclicks / impressions) * 100;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return `${Number(RPC.toFixed(2))}%`;

            }
        }
        if (params.node.aggData !== undefined) {
            const { impressions, fbclicks } = params.node.aggData;
            if (impressions !== 0) {
                const RPC = (fbclicks / impressions) * 100;
                return `${Number(RPC.toFixed(2))}%`;
            }
        }

        return 0;
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
                return `${Number(RPC.toFixed(2))}%`;

            }
        }
        if (params.node.aggData !== undefined) {
            const { profit } = params.node.aggData;
            if (revenue !== 0) {
                const RPC = (profit / revenue) * 100;
                return `${Number(RPC.toFixed(2))}%`;
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
                return Number(RPC.toFixed(2));
            }
        }

        return 0;
    }



    const getROI = (params) => {
        if (params.data !== undefined) {
            const { revenue, spend } = params.data;

            if (revenue !== "0.00" || revenue !== undefined) {
                const RPC = ((revenue - spend) / spend) * 100;
                if (RPC === Infinity || isNaN(RPC) || RPC === -Infinity) {
                    return `0%`;
                }
                return `${Math.round(RPC * 100) / 100}%`;

            }
        }
        if (params.node.aggData !== undefined) {
            const { revenue, spend } = params.node.aggData;
            if (revenue !== "0.00" || revenue !== undefined) {
                const RPC = ((revenue - spend) / spend) * 100;
                if (RPC === Infinity || isNaN(RPC) || RPC === -Infinity) {
                    return `0%`;
                }
                return `${Math.round(RPC * 100) / 100}%`;

            }
        }

        return 0;
    }
    const getCPM = (params) => {
        if (params.data !== undefined) {
            const { impressions, spend } = params.data;

            if (spend !== "0.00" || spend !== undefined) {
                const RPC = (spend / impressions) * 1000;
                if (RPC === Infinity || isNaN(RPC) || RPC === -Infinity) {
                    return `0%`;
                }
                return `${Math.round(RPC * 100) / 100}%`;

            }
        }
        if (params.node.aggData !== undefined) {
            const { impressions, spend } = params.node.aggData;
            if (spend !== "0.00" || spend !== undefined) {
                const RPC = (spend / impressions) * 1000;
                if (RPC === Infinity || isNaN(RPC) || RPC === -Infinity) {
                    return `0%`;
                }
                return `${Math.round(RPC * 100) / 100}%`;

            }
        }

        return 0;
    }
    const agFunc = (params) => {
        let sum = 0;
        params.values.forEach((value) => (sum += parseFloat(value)));
        return sum;
    }

    const getColumnDefs = (order) => {
        return order?.map(colKey => columnDefsObject[colKey]);
    };

    const columnStructure = [
        "M_tq",
        "D_tq",
        "adname",
        "date_n",
        "date_f",
        "hour_n",
        "hour_f",
        "date",
        "campaignname",
        "adsetname",
        "spend",
        "revenue",
        "profit",
        "margin",
        "rpc",
        "cpm",
        "cpl",
        "ncpl",
        "fbleads",
        "filteration",
        "conversions",
        "fmargin",
        "roi",
        "cpc",
        "fbclicks",
        "impressions",
        "ctr",
        "fblinkclicks",
        "cpclinkclicks",
    ];

    const dateOptions = [
        "All",
        "Today",
        "Yesterday",
        "Last 7 Days",
        "Last 15 Days",
        "Last 20 Days",
        "Last 25 Days",
        "Last 30 Days",
        "Last 60 Days",
        "Last 90 Days",
        "This Month",
        "Last Month",
    ];

    const [selectedValue, setSelectedValue] = useState("All");
    const [filteredData, setFilteredData] = useState(dailyData);
    const [budgetAndStatusData, setBudgetAndStatusData] = useState(null);
    const [isCampaignModalVisibles, setIsCampaignModalVisibles] = useState(false);
    const [nextChecked, setNextChecked] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [showTables, setShowTables] = useState(false);
    const [bidAmount, setBidAmount] = useState("");
    // const [switchChecked, setSwitchChecked] = useState(false);
    const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
    const [changeBudget, setChangeBudget] = useState("");

    const [domainFixedFooter, setDomainFixedFooter] = useState([]);

    const handleColumnMove = async (params, gridId) => {
        const columnState = params.api.getColumnState();
        // console.log('Column moved in grid:', gridId);
        const fieldOrder = columnState.map(col => col.colId);
        // console.log(fieldOrder);
        const newFieldOrder = fieldOrder.filter(item => item !== 'ag-Grid-AutoColumn-adsetnname' && item !== 'ag-Grid-AutoColumn' && columnStructure.includes(item));
        // localStorage.setItem('columnState', JSON.stringify(newFieldOrder));
        // updatingColumnsStructure(newFieldOrder);
        // console.log(newFieldOrder);
        setColumnStructure(getColumnDefs(newFieldOrder));
        // console.log(newFieldOrder);
        await apiClient.post(`/reports/historyactions/columnstructure?email=${userdetails?.email}`, { updateDataArray: newFieldOrder });
        // console.log(`Updating columns structure for grid: ${gridId}`);
    };

    const debouncedHandleColumnMove = useCallback(debounce((params, gridId) => handleColumnMove(params, gridId), 600), []);

    const onGridReady = (params, gridId, gridRef) => {
        gridRef.current = params;
        params.api.applyColumnState({ state: columnDefs, applyOrder: true });
        params.api.addEventListener('dragStopped', (e) => debouncedHandleColumnMove(e, gridId));
    };

    const handleChange = (value) => {
        setSelectedValue(value);

        const today = moment();
        const startOfMonth = moment().startOf("month");
        const endOfMonth = moment().endOf("month");
        const startOfLastMonth = moment().subtract(1, "month").startOf("month");
        const endOfLastMonth = moment().subtract(1, "month").endOf("month");

        const dynamicDaysFilter = (days) =>
            dailyData.filter((item) =>
                moment(item.date).isBetween(
                    moment().subtract(days, "days"),
                    today,
                    undefined,
                    "[]"
                )
            );

        const filterLogic = {
            All: () => dailyData,
            Today: () => dailyData.filter((item) => item.date === today.format("YYYY-MM-DD")),
            Yesterday: () =>
                dailyData.filter(
                    (item) =>
                        item.date === today.clone().subtract(1, "days").format("YYYY-MM-DD")
                ),
            "Last 7 Days": () => dynamicDaysFilter(7),
            "Last 15 Days": () => dynamicDaysFilter(15),
            "Last 20 Days": () => dynamicDaysFilter(20),
            "Last 25 Days": () => dynamicDaysFilter(25),
            "Last 30 Days": () => dynamicDaysFilter(30),
            "Last 60 Days": () => dynamicDaysFilter(60),
            "Last 90 Days": () => dynamicDaysFilter(90),
            "This Month": () =>
                dailyData.filter((item) =>
                    moment(item.date).isBetween(startOfMonth, endOfMonth, undefined, "[]")
                ),
            "Last Month": () =>
                dailyData.filter((item) =>
                    moment(item.date).isBetween(
                        startOfLastMonth,
                        endOfLastMonth,
                        undefined,
                        "[]"
                    )
                ),
        };

        const filtered = filterLogic[value] ? filterLogic[value]() : data;
        setFilteredData(filtered);
    };

    const token = localStorage.getItem("token")


    const functionCallForCommnets = async (accountNumber) => {
        try {
            const commentFetch = await apiClient.get(`/reports/historyactions/comments/${accountNumber}/${"adsetid"}/${AdsetId}/${"adset"}`);
            const campaignComments = commentFetch.data.data; // Set comments only if fetched successfully
            setCampaignComments(campaignComments);
            if (campaignComments.length > 0) {
                const comment = campaignComments[0];
                // console.log(comment, "comment");
                // console.log(comment?.comment, "comment");
                setComment(comment?.comment ? comment?.comment : "");
            }

        } catch (err) {
            setComment("");
        }
    };
    const functionCallForBudgetAndStatus = async (
        id = AdsetId,
        level = "adset",
        accountNumber
    ) => {
        try {
            const response = await apiClient.post(`/reports/historyactions/campaignadsetadstatus`,
                {
                    id,
                    level,
                    accountNumber
                }
            );

            const data = response?.data?.data;
            // console.log(data, "budget and status");
            setBudgetAndStatusData(data);

        } catch (err) {
            console.log(err);
        }
    };
    const functionCallForUserColumnStructure = async () => {
        const fetchData = await apiClient.get(`/reports/historyactions/columnstructure?email=${user}`);
        // const data = await fetchData.json();
        const mainData = fetchData.data.data;
        // console.log(mainData.historyStructure, "columnStructure");
        const filteredData = mainData.filter((each) => each !== "fb-hour" && each !== "mnet-hour" && each !== "timezone" && each !== "actions");
        // console.log(filteredData);
        setColumnStructure(getColumnDefs(filteredData));
        // setRowStructure(mainData.rows); 
    }

    const getHistoryData = async () => {
        const fetchData = await apiClient.get(`/reports/dailyhistory/adsethistory?AdsetId=${AdsetId}&accountNumber=${accountNumber}&timezone=${timeZone}&network=${network}`);
        // console.log(`https://prodapis.adsgoat.in/LiveAdsetHistory?adsetName=${decodedString}&accountNumber=${accountNumber}&timezone=${timeZone}&network=${network}`, "url");
        // const url = `https://prodapis.adsgoat.in/MnetLiveCampaignHistory?adsetName=${decodedString}&accountNumber=${accountNumber}&timezone=${timeZone}`

        const mainData = fetchData.data.data;
        setAdsetName(mainData[0]?.adsetName);
        // console.log(mainData, "adset");
        setUniqueObject(mainData.find(
            obj => obj.campaign_id && obj.adset_id
        ))

        const specifiedTimeZone = selectTimezone[timeZone];
        // const sortedArray = mainData?.sort((a, b) => new Date(a[specifiedTimeZone]) - new Date(b[specifiedTimeZone]));
        // console.log(sortedArray, "sort");
        const filteredData = mainData && mainData.length > 0 ?
            mainData.map(eachData => {
                const Revenue = eachData.estimated_revenue !== undefined ? (eachData.estimated_revenue) : 0;
                const profit = Math.round((Revenue - eachData.spend) * 100) / 100;
                const margin = Revenue !== 0 ? `${Math.round((((Revenue - eachData.spend) / eachData.estimated_revenue) * 100) * 100) / 100}%` : '0%'
                let rpc = eachData.conversions !== 0 ? (Math.round((Revenue / eachData.conversions) * 100) / 100) : 0;
                const revenue = ((eachData.estimated_revenue - eachData.spend) / (eachData.fbLeads * rpc)) * 100;
                let fMargin = revenue !== 0 ? Math.round(((profit / revenue) * 100) * 100) / 100 : 0;
                const cpl = eachData.fbLeads !== 0 ? Math.round((eachData.spend / eachData.fbLeads) * 100) / 100 : 0;
                let ncpl = eachData.conversions !== 0 ? Math.round((eachData.spend / eachData.conversions) * 100) / 100 : 0;
                const roi = eachData.spend !== 0 ? `${Math.round((((Revenue - eachData.spend) / eachData.spend) * 100) * 100) / 100}%` : '0%';
                const ctr = eachData.impressions !== 0 ? `${Math.round(((eachData.fbClicks / eachData.impressions) * 100) * 100) / 100}%` : '0%';
                const mainRvenue = ((Math.round(Revenue * 100) / 100)).toString();
                const conversions = eachData.conversions !== undefined && eachData.conversions !== null ? eachData.conversions : '0';
                // console.log(conversions, "conversions");
                rpc = !isNaN(rpc) ? rpc : 0;
                ncpl = !isNaN(ncpl) ? ncpl : 0;
                fMargin = !isNaN(fMargin) ? `${fMargin}%` : '0%';
                const fbLClicks = parseInt(eachData.fbLinkClicks, 10);
                const spend = parseFloat(eachData.spend);
                const cpcLinkClicks = isNaN(fbLClicks) || fbLClicks === 0 ? 0 : Math.round((spend / fbLClicks) * 100) / 100;
                return (
                    {
                        campaignName: eachData.campaign_name,
                        date: eachData[specifiedTimeZone],
                        hour_f: eachData[specifiedTimeZone],
                        hour_n: eachData[specifiedTimeZone],
                        date_f: eachData[specifiedTimeZone],
                        date_n: eachData[specifiedTimeZone],
                        adsetname: eachData.adsetName,
                        adname: "",
                        spend: (eachData.spend).toString(),
                        revenue: mainRvenue,
                        profit: profit.toString(),
                        margin: margin,
                        rpc: rpc.toString(),
                        cpl: cpl.toString(),
                        ncpl: ncpl.toString(),
                        roi: roi,
                        cpc: (eachData.cpc).toString(),
                        cpclinkclicks: cpcLinkClicks.toString(),
                        fbleads: (eachData.fbLeads).toString(),
                        // filterarion: eachData.fbLeads && parseInt((eachData.fbLeads)) !==0 ? (((parseInt(eachData.fbLeads)-parseInt(eachData.conversions))/parseInt(eachData.fbLeads))*100).toString(2) : 0,
                        filteration: parseInt(eachData.fbLeads) !== 0 ? Math.round((((parseInt(eachData.fbLeads) - parseInt(eachData.conversions)) / parseInt(eachData.fbLeads)) * 100) * 100) / 100 : 0,
                        fbclicks: (eachData.fbClicks).toString(),
                        fblinkclicks: (eachData.fbLinkClicks).toString(),
                        impressions: (eachData.impressions).toString(),
                        conversions: conversions.toString(),
                        fmargin: fMargin,
                        ctr: ctr,
                        adsetId: eachData.adset_id,
                        campaignId: eachData.campaign_id,
                        M_tq: "",
                        D_tq: "",
                    }
                )
            })
            : null;
        // setdailyData(filteredData);
        setLoading(false);
        const newFilterData = filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));
        setdailyData(newFilterData);
        setFilteredData(newFilterData);
        const dates = newFilterData.map(d => d.date);
        const spend = newFilterData.map(d => d.spend);
        const revenue = newFilterData.map(d => d.revenue);
        const profit = newFilterData.map(d => d.profit);
        const rpc = newFilterData.map(d => d.rpc);
        const cpl = newFilterData.map(d => d.cpl);

        const margin = newFilterData.map(d => parseFloat(d.margin));

        setChartData({ dates, spend, revenue, profit, margin, rpc, cpl });
    }

    useEffect(() => {
        setDomainFixedFooter([
            {
                adsetName: 'Total',
                spend: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend || 0), 0).toFixed(2),
                revenue: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue || 0), 0).toFixed(2),
                profit: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit || 0), 0).toFixed(2),
                margin: `${(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)}%`,
                filteration: `${(((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0) - filteredData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0)) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0)) * 100).toFixed(2)}`,
                rpc: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / filteredData?.length,
                cpl: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / filteredData?.length,
                ncpl: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / filteredData?.length,
                fbleads: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0),
                conversions: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0),
                fmargin: `${(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)}%`,
                roi: `${(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100}%`,
                cpc: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / filteredData?.length,
                fbclicks: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0),
                cpclinkclicks: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks), 0) / filteredData?.length,
                fblinkclicks: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0),
                impressions: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0),
                ctr: `${(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)}%`,
                //   tq: filteredData?.length
                //   ? Math.round(
                //       filteredData.reduce((acc, curr) =>
                //           acc + (curr.tq !== undefined && !isNaN(curr.tq) ? Number(curr.tq) : 0), 0
                //   ) * 100) / 100
                //   : 0,
            }
        ]);
    }, [filteredData])

    const debouncedFunctionCallForUserColumnStructure = debounce(async () => {
        await functionCallForUserColumnStructure();
    }, 100);

    const debouncedFunctionCall = debounce(async () => {
        await getHistoryData();
    }, 100);

    useEffect(() => {
        if (userdetails?.adAccounts) {
            const functionCall = async () => {
                await functionCallForCommnets(accountNumber);
                await debouncedFunctionCallForUserColumnStructure();
                await debouncedFunctionCall();
                await functionCallForBudgetAndStatus(
                    AdsetId,
                    "adset",
                    accountNumber
                );
            }
            functionCall();
        }
    }, [userdetails]);
    const onChangeBudget = (value) => {
        setChangeBudget(value);
    };
    useEffect(() => {

        if (isBudgetModalVisible) {

            // ✅ Budget
            setChangeBudget(
                budgetAndStatusData?.selected_adset?.budget_amount
                    ? Number(
                        budgetAndStatusData?.selected_adset?.budget_amount
                    ) / 100
                    : ""
            );

            // ✅ Bid Amount
            setBidAmount(
                budgetAndStatusData?.selected_adset?.bid_amount
                    ? budgetAndStatusData?.selected_adset?.bid_amount / 100
                    : ""
            );

        }

    }, [isBudgetModalVisible]);
    // const pinnedBottomRowData = [
    //     {
    //         campaignName: 'Total',
    //         spend: dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0),
    //         revenue: dailyData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0),
    //         profit: dailyData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0),
    //         margin: `${(dailyData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)}%`,
    //         rpc: dailyData.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / dailyData.length,
    //         cpl: dailyData.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / dailyData.length,
    //         ncpl: dailyData.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / dailyData.length,
    //         fbleads: dailyData.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0),
    //         // filterarion: "",
    //         conversions: dailyData.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0),
    //         fmargin: `${(dailyData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)}%`,
    //         roi: `${(dailyData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100}%`,
    //         cpc: dailyData.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / dailyData.length,
    //         fbclicks: dailyData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0),
    //         impressions: dailyData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0),
    //         ctr: `${(dailyData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)}%`
    //     }
    // ];

    // const columnDefsObject = {
    //     campaignname: {headerName:'CampaignName', field:'campaignName',
    //             // rowGroup: true,
    //             // filter: true,
    //             // hide: true,
    //             // resizable: true,
    //             // enableRowGroup: true,
    //             // groupDisplayType: 'group',
    //             width: 450,
    //         },
    //         adsetname: { headerName: 'AdsetName', field: 'adsetName',
    //         // resizeble: true,
    //         // sortable: true,
    //         width: 500,
    //         // hide: true,
    //         // // resizable:false,
    //         // rowGroup: true,
    //         // filter: true,
    //         // pinned: 'left',
    //         // enableRowGroup: true,
    //         // autoHeight: true, 
    //         },
    //         date:{ headerName: 'Date', field: 'date', width: 120, sort: 'asc',
    //             comparator: (valueA, valueB) => {
    //                 if (valueA == null && valueB == null) return 0;
    //                 if (valueA == null) return -1;
    //                 if (valueB == null) return 1;

    //                 const dateA = new Date(valueA);
    //                 const dateB = new Date(valueB);

    //                 // Compare valid dates
    //                 if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
    //                     return dateA - dateB;
    //                 }

    //                 // Fallback for invalid dates (compare as strings)
    //                 return valueA.toString().localeCompare(valueB.toString());
    //             }
    //          },
    //         spend:{ headerName: 'Spend', field: 'spend', width: 120,
    //             aggFunc: agFunc, 
    //             valueFormatter: params => params.value ? Math.round(params.value*100)/100 : '',
    //         },
    //         revenue:{ headerName: 'Revenue', field: 'revenue', width: 120,
    //             aggFunc: agFunc,
    //             valueFormatter: params => params.value ? Math.round(params.value*100)/100 : '', 
    //         },
    //         profit:{ headerName: 'Profit', field: 'profit', width: 120, cellClassRules:{
    //             'font-red': p => p.value < 0
    //             },
    //             aggFunc: agFunc,
    //             valueFormatter: params => params.value ? Math.round(params.value*100)/100 : '',
    //         },
    //         margin:{ headerName: 'Margin', field: 'margin', valueGetter: getMargin,

    //         },
    //         rpc:{ headerName: 'Rpc', field: 'rpc', valueGetter: getRpc},
    //         cpl:{ headerName: 'Cpl', field: 'cpl', valueGetter: getCpl},
    //         ncpl:{ headerName: 'Ncpl', field: 'ncpl', valueGetter: getNcpl },
    //         fbleads:{ headerName: 'FbLeads', field: 'fbleads', width: 120, aggFunc: agFunc,   },
    //         conversions:{ headerName: 'Conversions', field: 'conversions', width: 120, aggFunc: agFunc,   },
    //         fmargin:{ headerName: 'Fmargin', field: 'fmargin', valueGetter: getFmargin},
    //         roi:{ headerName: 'ROI', field: 'roi', valueGetter: getROI},
    //         cpc:{ headerName: 'cpc', field: 'cpc',
    //             aggFunc: (params) => {
    //                 const sum = params.values.reduce((sum, value) => sum + parseFloat(value), 0);
    //                 return sum / params.values.length;
    //             },
    //             valueFormatter: params => params.value !== undefined ? Math.round(params.value*100)/100 : '',

    //         },
    //         fbclicks:{ headerName: 'FbClicks', field: 'fbclicks', width: 120, aggFunc: agFunc,  },
    //         impressions:{ headerName: 'Impressions', field: 'impressions', width: 120, aggFunc: agFunc,   },
    //         ctr:{ headerName: 'Ctr', field: 'ctr', valueGetter: getCtr},

    //         adsetid: { headerName: 'AdsetId', field: 'adsetId' },
    //         campaignid: {headerName: "CampaignId", field:'campaignId'}
    //     };

    const onCellClicked = (params) => {
        if (params.column.getColId() === "adsetname" && params.value) {
            // Copy the cell value to clipboard
            navigator.clipboard.writeText(params.value).then(() => {
                const originalValue = params.value; // Store original value
                const copiedText = `${originalValue} Copied!`; // Append "Copied!" to the text

                // Temporarily update the cell content
                params.node.setDataValue("adsetname", copiedText);

                // Revert back to original value after 1.5 seconds
                setTimeout(() => {
                    params.node.setDataValue("adsetname", originalValue);
                }, 1500);
            }).catch(err => console.error("Copy failed:", err));
        }
        // ✅ Ensure first selected cell gets highlighted
        if (params.event?.shiftKey || params.event?.ctrlKey) {
            // Add to selection when Shift/Ctrl is pressed
            setSelectedCells((prev) => [...prev, { rowIndex: params.node.rowIndex, colId: params.column.getId() }]);
        } else {
            // Single click selects only one cell
            setFirstSelectedCell({ rowIndex: params.node.rowIndex, colId: params.column.getId() });
            setSelectedCells([{ rowIndex: params.node.rowIndex, colId: params.column.getId() }]);
        }
    };

    const gridOptions = {
        onCellClicked,
    };

    // Initialize AG Grid after DOM is loaded
    document.addEventListener("DOMContentLoaded", function () {
        const gridDiv = document.querySelector("#myGrid");
        new agGrid.Grid(gridDiv, gridOptions);
    });

    const columnDefsObject = {
        M_tq: {
            headerName: 'M_TQ',
            field: 'M_tq',
            // aggFunc: 'sum',
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            // aggFunc: liveSpender,
            hide: true,
        },
        D_tq: {
            headerName: 'D_TQ',
            field: 'D_tq',
            // aggFunc: 'sum',
            // valueFormatter: currencyFormatter, 
            valueFormatter: (params) => {
                const val = Number(params.value);
                return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            sortable: true,
            // aggFunc: liveSpender,
            hide: true,
        },
        campaignname: {
            headerName: 'CampaignName', field: 'campaignname',
            // rowGroup: true,
            // filter: true,
            // hide: true,
            // resizable: true,
            // enableRowGroup: true,
            // groupDisplayType: 'group',
            width: 450,
            hide: true,

        },
        adsetname: {
            headerName: 'Adset-Name', field: 'adsetname',
            // resizeble: true,
            // sortable: true,
            width: 300,
            cellStyle: { whiteSpace: "normal", lineHeight: "1.5" }, // Enables text wrapping
            autoHeight: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            cellRenderer: (params) => {
                if (params.value && params.value.includes("Copied!")) {
                    return (
                        <span>
                            {params.value.replace("Copied!", "")}
                            <span style={{ color: "#5B8CFF", fontWeight: "bold" }}>Copied!</span>
                        </span>
                    );
                }
                return params.value;
            },
            hide: true,
            // // resizable:false,
            // rowGroup: true,
            // filter: true,
            // pinned: 'left',
            // enableRowGroup: true,
            // autoHeight: true, 
        },
        adname: {
            headerName: 'Ad-Name', field: 'adname',
            // resizeble: true,
            // sortable: true,
            width: 300,
            cellStyle: { whiteSpace: "normal", lineHeight: "1.5" }, // Enables text wrapping
            autoHeight: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            cellRenderer: (params) => {
                if (params.value && params.value.includes("Copied!")) {
                    return (
                        <span>
                            {params.value.replace("Copied!", "")}
                            <span style={{ color: "#5B8CFF", fontWeight: "bold" }}>Copied!</span>
                        </span>
                    );
                }
                return params.value;
            },
            hide: true,
        },
        date: {
            headerName: 'Date', field: 'date', width: 160, sort: 'desc',
            comparator: (valueA, valueB) => {
                if (valueA == null && valueB == null) return 0;
                if (valueA == null) return -1;
                if (valueB == null) return 1;

                const dateA = new Date(valueA);
                const dateB = new Date(valueB);

                // Compare valid dates
                if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                    return dateA - dateB;
                }

                // Fallback for invalid dates (compare as strings)
                return valueA.toString().localeCompare(valueB.toString());
            },
            //   cellStyle: {
            //       fontWeight: 'bold', // Makes the cell text bold
            //   },
            valueFormatter: (params) => {
                // If the row is grouped or pinned, return the original value (or empty for pinned rows)
                if (params.node.group) {
                    return "";
                }
                if (params.node.rowPinned) {
                    return ''; // Return an empty value for pinnedBottomRowData
                }
                // Format the value for leaf nodes
                return `${params.value} (${moment(params.value).format('ddd')})`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        hour_f: {
            headerName: 'Date', field: 'hour_f', width: 160, sort: 'asc',
            comparator: (valueA, valueB) => {
                if (valueA == null && valueB == null) return 0;
                if (valueA == null) return -1;
                if (valueB == null) return 1;

                const dateA = new Date(valueA);
                const dateB = new Date(valueB);

                // Compare valid dates
                if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                    return dateA - dateB;
                }

                // Fallback for invalid dates (compare as strings)
                return valueA.toString().localeCompare(valueB.toString());
            },

            cellStyle: {
                fontWeight: 'bold', // Makes the cell text bold
            },
            valueFormatter: (params) => {
                // If the row is grouped or pinned, return the original value (or empty for pinned rows)
                if (params.node.group) {
                    return "";
                }
                if (params.node.rowPinned) {
                    return ''; // Return an empty value for pinnedBottomRowData
                }
                // Format the value for leaf nodes
                return `${params.value} (${moment(params.value).format('ddd')})`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            hide: true
        },
        hour_n: {
            headerName: 'Date', field: 'hour_n', width: 160, sort: 'asc',
            comparator: (valueA, valueB) => {
                if (valueA == null && valueB == null) return 0;
                if (valueA == null) return -1;
                if (valueB == null) return 1;

                const dateA = new Date(valueA);
                const dateB = new Date(valueB);

                // Compare valid dates
                if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                    return dateA - dateB;
                }

                // Fallback for invalid dates (compare as strings)
                return valueA.toString().localeCompare(valueB.toString());
            },

            cellStyle: {
                fontWeight: 'bold', // Makes the cell text bold
            },
            valueFormatter: (params) => {
                // If the row is grouped or pinned, return the original value (or empty for pinned rows)
                if (params.node.group) {
                    return "";
                }
                if (params.node.rowPinned) {
                    return ''; // Return an empty value for pinnedBottomRowData
                }
                // Format the value for leaf nodes
                return `${params.value} (${moment(params.value).format('ddd')})`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            hide: true
        },
        date_f: {
            headerName: 'Date', field: 'date_f', width: 160, sort: 'asc',
            comparator: (valueA, valueB) => {
                if (valueA == null && valueB == null) return 0;
                if (valueA == null) return -1;
                if (valueB == null) return 1;

                const dateA = new Date(valueA);
                const dateB = new Date(valueB);

                // Compare valid dates
                if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                    return dateA - dateB;
                }

                // Fallback for invalid dates (compare as strings)
                return valueA.toString().localeCompare(valueB.toString());
            },

            cellStyle: {
                fontWeight: 'bold', // Makes the cell text bold
            },
            valueFormatter: (params) => {
                // If the row is grouped or pinned, return the original value (or empty for pinned rows)
                if (params.node.group) {
                    return "";
                }
                if (params.node.rowPinned) {
                    return ''; // Return an empty value for pinnedBottomRowData
                }
                // Format the value for leaf nodes
                return `${params.value} (${moment(params.value).format('ddd')})`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            hide: true
        },
        date_n: {
            headerName: 'Date', field: 'date_n', width: 160, sort: 'asc',
            comparator: (valueA, valueB) => {
                if (valueA == null && valueB == null) return 0;
                if (valueA == null) return -1;
                if (valueB == null) return 1;

                const dateA = new Date(valueA);
                const dateB = new Date(valueB);

                // Compare valid dates
                if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                    return dateA - dateB;
                }

                // Fallback for invalid dates (compare as strings)
                return valueA.toString().localeCompare(valueB.toString());
            },

            cellStyle: {
                fontWeight: 'bold', // Makes the cell text bold
            },
            valueFormatter: (params) => {
                // If the row is grouped or pinned, return the original value (or empty for pinned rows)
                if (params.node.group) {
                    return "";
                }
                if (params.node.rowPinned) {
                    return ''; // Return an empty value for pinnedBottomRowData
                }
                // Format the value for leaf nodes
                return `${params.value} (${moment(params.value).format('ddd')})`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            hide: true
        },
        spend: {
            headerName: 'Spend', field: 'spend', width: 105,
            aggFunc: agFunc,
            valueFormatter: params => params.value ? Math.round(params.value * 100) / 100 : '',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            valueFormatter: (params) => `$${params.value}`,
        },
        revenue: {
            headerName: 'Revenue', field: 'revenue', width: 105,
            aggFunc: agFunc,
            valueFormatter: params => params.value ? Math.round(params.value * 100) / 100 : '',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            valueFormatter: (params) => `$${params.value}`,
        },
        profit: {
            headerName: 'Profit', field: 'profit', width: 100,
            cellClassRules: {
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0,

            },
            aggFunc: agFunc,
            valueFormatter: params => params.value ? Math.round(params.value * 100) / 100 : '',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            valueFormatter: (params) => `$${params.value}`,
            headerToolTip: 'Profit = Revenue - Spend',
        },
        margin: {
            headerName: 'Margin', field: 'margin', valueGetter: getMargin,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            width: 105,
            valueFormatter: (params) => `${params.value}`,
            headerToolTip: 'Margin = ((Revenue - Spend) / Revenue) * 100',

        },
        rpc: {
            headerName: 'RPC', field: 'rpc', valueGetter: getRpc,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            headerToolTip: 'RPC = Revenue / Conversions',
            width: 85,
            cellStyle: { fontWeight: 'bold' }
        },
        cpl: {
            headerName: 'CPL', field: 'cpl', valueGetter: getCpl,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            headerToolTip: 'CPL = Spend / FBLeads',
            width: 85,
        },
        ncpl: {
            headerName: 'NCPL', field: 'ncpl', valueGetter: getNcpl,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            headerToolTip: 'NCPL = Spend / Conversions',
            width: 95
        },
        fbleads: {
            headerName: 'Leads', field: 'fbleads', width: 100, aggFunc: agFunc,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        // { headerName: "Filteration", field:'filterarion', width: 120,  valueGetter: getFilteration},
        filteration: {
            headerName: "Filteration", field: 'filteration', width: 115,
            valueFormatter: params => params.value ? `${params.value}%` : '0%',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        conversions: {
            headerName: 'Conv', field: 'conversions', width: 90, aggFunc: agFunc,
            suppressMenu: true,
            menuTabs: [],
            headerToolTip: 'Conversions',
            headerClass: 'hide-menu',
        },
        fmargin: {
            headerName: 'FMargin', field: 'fmargin', valueGetter: getFmargin,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            valueFormatter: (params) => `${params.value}`,
            headerToolTip: 'FMargin = (Profit / Revenue) * 100',
            width: 110
        },
        roi: {
            headerName: 'ROI', field: 'roi', valueGetter: getROI,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            valueFormatter: (params) => `${params.value}`,
            headerToolTip: 'ROI = ((Revenue - Spend) / Spend) * 100',
            width: 90
        },
        cpm: {
            headerName: 'CPM', field: 'cpm', valueGetter: getCPM,
            // comparator: defaultComparator,
            valueFormatter: (params) => `${params.value}`,
            width: 90,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            headerToolTip: 'CPM = (spend/impressions) * 1000',
        },
        cpc: {
            headerName: 'CPC', field: 'cpc',
            aggFunc: (params) => {
                const sum = params.values.reduce((sum, value) => sum + parseFloat(value), 0);
                return sum / params.values.length;
            },
            valueFormatter: params => params.value !== undefined ? Math.round(params.value * 100) / 100 : '',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            width: 90,
            headerToolTip: 'CPC = Spend / FBClicks',

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
            headerTooltip: "CPC = Spend / FBLinkClicks",

        },
        fbclicks: {
            headerName: 'FBClicks', field: 'fbclicks', width: 110, aggFunc: agFunc,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        fblinkclicks: {
            headerName: 'FB_LC', field: 'fblinkclicks', width: 110, aggFunc: agFunc,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        impressions: {
            headerName: 'IMP', field: 'impressions', width: 80, aggFunc: agFunc,
            suppressMenu: true,
            menuTabs: [],
            headerToolTip: 'Impressions',
            headerClass: 'hide-menu',
        },
        ctr: {
            headerName: 'CTR', field: 'ctr', valueGetter: getCtr,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            headerToolTip: 'CTR = (FBClicks / Impressions) * 100',
            width: 90
        },

        // { headerName: 'AdsetId', field: 'adsetId' },
        // {headerName: "CampaignId", field:'campaignId'}
    };

    // console.log(columnDefs);

    const defaultComparator = (valueA, valueB) => {
        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return -1;
        if (valueB == null) return 1;

        const numA = parseFloat(valueA);
        const numB = parseFloat(valueB);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return valueA.localeCompare(valueB);
    };

    const defaultColDef = useMemo(() => ({
        comparator: defaultComparator,
        sortable: true,
        filter: true,
    }), []);

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

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const colorMap = {};

    const getColorForValue = (value) => {
        if (!colorMap[value]) {
            colorMap[value] = getRandomColor(); // Generate and assign a color
        }
        return colorMap[value]; // Return the assigned color
    };

    // const sendNewCommentToAPI = async (logData) => {
    //     try {
    //         const response = await apiClient.post('/Comments', {
    //             commentsdatas: logData,
    //         });
    //         // console.log('Response from server:', response.data);
    //     } catch (error) {
    //         console.error('Error sending data to server:', error);
    //     }
    // };

    const sendEditedCommentToAPI = async () => {
        try {
            // console.log("comment:")
            const payloadForActivity = {
                editType: "Comment",
                campaignid: uniqueObject?.campaign_id,       // cents
                adsetid: uniqueObject?.adset_id,
                Account: accountNumber,    // ✅ update *this* row’s account
                campaignname: uniqueObject?.campaign_name,
                adsetname: adsetName,
                updatedBy: userdetails?.userName,
                updatedUserEmail: userdetails?.email,
                updateType: "Adset comment updated",
                updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
            }
            const response = await apiClient.post('/reports/historyactions/comments/update', {
                accountNumber: accountNumber,
                campaignname: adsetName,
                campaignid: uniqueObject?.campaign_id,
                adsetid: uniqueObject?.adset_id,
                comment: comment,
                usercommit: userdetails?.email,
                level: "adset",
                activity: payloadForActivity
            }
            );
            if (response.status === 200 || response.status === 201) {
                await functionCallForCommnets(accountNumber);
            }
            return response.data;
        } catch (error) {
            console.error('Error sending edited comment to server:', error);
            throw error;
        }
    };

    const handleOks = async () => {
        try {
            // const logData = {
            //     Account: accountNumber,
            //     usercommit: userdetails?.email,
            //     campaignname: decodedString,
            //     comment: comment,
            //     campaignid: campaignid,
            //     adsetid: adsetid
            // };


            // Check if comment already exists
            // const relatedComment = campaignComments.find(
            //     (cmt) => cmt.campaignname === decodedString && cmt.Account === accountNumber
            // );

            // if (relatedComment) {
            //     await sendEditedCommentToAPI(logData);
            // } else {
            //     await sendNewCommentToAPI(logData);
            // }

            if (typeof comment === 'string' && comment.trim() !== '') {
                await sendEditedCommentToAPI();
                setComment(comment);
                message.success("Comment saved!");
                setIsModalVisibles(false);
            }

            // if (relatedComment) {
            //     await sendEditedCommentToAPI(logData);
            //     refreshComments(account);
            //     message.success("Comment updated successfully!");
            // } else {
            //     await sendNewCommentToAPI(logData);
            //     refreshComments(account);
            //     message.success("New comment added successfully!");
            // }

            // const updatedComments = relatedComment
            //     ? campaignComments.map(cmt => (cmt.campaignname === firstColumnValue ? { ...cmt, comment } : cmt))
            //     : [...campaignComments, logData];
            // setCampaignComments(updatedComments);

            // changeRRefrst();
            // ✅ Update local state immediately
            // const updatedComments = [...campaignComments];
            // const index = updatedComments.findIndex(c => c.campaignname === decodedString && c.Account === accountNumber);
            // if (index !== -1) {
            //     updatedComments[index] = {
            //         ...updatedComments[index],
            //         comment: comment,
            //         editedTime: new Date().toISOString(), // optional: update time
            //     };
            // } else {
            //     updatedComments.push({
            //         campaignname: decodedString,
            //         Account: accountNumber,
            //         comment: comment,
            //         editedTime: new Date().toISOString(),
            //     });
            // }
            // setCampaignComments(updatedComments);
            // setComment(comment);
            // message.success("Comment saved!");
            // setIsModalVisibles(false);
        } catch (error) {
            console.error('Error while submitting comment:', error);
            message.error("Error while submitting the comment.");
        }
    };

    const handleDelete = async () => {
        try {
            // Prepare the payload for the API call
            const payloadForActivity = {
                editType: "Comment",
                campaignid: uniqueObject?.campaign_id,       // cents
                adsetid: uniqueObject?.adset_id,
                Account: accountNumber,    // ✅ update *this* row’s account
                campaignname: uniqueObject?.campaign_name,
                adsetname: adsetName,
                updatedBy: userdetails?.userName,
                updatedUserEmail: userdetails?.email,
                updateType: "Adset comment cleared",
                updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
            }
            const payload = {
                accountNumber: accountNumber,
                campaignname: adsetName,
                campaignid: uniqueObject?.campaign_id,
                adsetid: uniqueObject?.adset_id,
                comment: comment,
                usercommit: userdetails?.email,
                level: "adset",
                activity: payloadForActivity
            };
            // console.log(payload);

            // Call the backend API to delete the comment
            const response = await apiClient.post('/reports/historyactions/comments/delete', payload);

            if (response.status === 200) {
                // Remove the comment from the local state
                // const updatedComments = campaignComments.filter(
                //     (comment) => comment.campaignname !== firstColumnValue
                // );
                // refreshComments(account);

                // // Update the state with the updated comments
                // setCampaignComments(updatedComments);

                // // Refresh the table or any other UI component
                // // changeRRefrst();

                // Update local state immediately
                // const updatedComments = campaignComments.filter(
                //     (comment) => !(comment.campaignname === decodedString && comment.Account === accountNumber)
                // );
                // setCampaignComments(updatedComments);
                const objectToUpdate = campaignComments[0];
                if (campaignComments.length > 0) {
                    setCampaignComments([{ ...objectToUpdate, comment: "", editedTime: "" }]);
                }
                else {
                    setCampaignComments([]);
                }
                setComment(""); // clear comment in UI

                message.success('Comment deleted successfully!');
                setIsModalVisibles(false); // Close the popup
            } else {
                message.error('Failed to delete the comment. Please try again.-1');
            }
        } catch (error) {
            console.error('Error deleting the comment:', error);
            message.error('Failed to delete the comment. Please try again.');
        }
    };

    const getEditedUserAndTime = (campaignName, newaccount) => {
        const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
        return relatedStatus ? relatedStatus : null;
    };

    const handleCancels = () => {
        setIsModalVisibles(false);
    };
    const editUserANdTime = getEditedUserAndTime(decodedString, accountNumber);


    const onClickBarChart = () => {
        setIsGraphVisible(prev => {
            const newValue = !prev;
            localStorage.setItem('isGraphVisible', JSON.stringify(newValue));
            return newValue
        });
    }



    const handleReload = () => {
        setLoading(true);
        const functionCall = async () => {
            await functionCallForCommnets(accountNumber);
            await debouncedFunctionCallForUserColumnStructure();
            await debouncedFunctionCall();
            await functionCallForBudgetAndStatus(
                AdsetId,
                "adset",
                accountNumber
            );
        }
        functionCall();
    };
    const handlePauseOk = async () => {
        const desired = nextChecked;
        // console.log(nextChecked, "nextChecked");
        setIsCampaignModalVisibles(true);
        setConfirmLoading(true);

        try {
            const token = localStorage.getItem("token");
            const payloadForActivity = {
                editType: "Status",
                campaignid: budgetAndStatusData?.campaign?.campaign_id,
                adsetid: AdsetId,
                Account: accountNumber,
                // campaignname: campaignName,
                adsetname: adsetName,
                updatedBy: userdetails?.userName,
                updatedUserEmail: userdetails?.email,
                updateType: "Adset status updated",
                updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                updateDetail: `From ${desired ? "Inactive" : "Active"} to ${desired ? "Active" : "Inactive"}`,
            }
            const payload = {
                status: desired ? "ACTIVE" : "PAUSED",
                // campaignname: campaignName,
                name: adsetName,
                accountNumber: accountNumber,
                campaign_id: budgetAndStatusData?.campaign?.campaign_id,
                adset_id: AdsetId,
                email: userdetails?.email,
                activity: payloadForActivity
            };
            const response = await apiClient.post(`/reports/historyactions/adsetstatus`, payload,
                { headers: { Authorization: token } }
            );

            const newStatus = desired ? "ACTIVE" : "PAUSED";
            if (response.status === 200 || response.status === 201) {
                setBudgetAndStatusData((prev) => ({
                    ...prev,
                    selected_adset: {
                        ...prev?.selected_adset,
                        adset_status:
                            nextChecked
                                ? "ACTIVE"
                                : "PAUSED"
                    }

                }));
                setConfirmLoading(false);
                setIsCampaignModalVisibles(false);
            }
            message.success(`Adset ${newStatus.toLowerCase()}`);
        } catch (e) {
            setConfirmLoading(false);
            setIsCampaignModalVisibles(false);
            message.error("Failed to update Adset status");
        }
    };
    const handlePauseCancel = () => {
        // setNextChecked(switchChecked);
        setIsCampaignModalVisibles(false);
    };
    const handleOk = async () => {

        // const campaignname = CampaignName;
        const adsetname = adsetName;

        const selectedAdset =
            budgetAndStatusData?.selected_adset;

        const currentBudget =
            selectedAdset?.budget_amount || 0;

        const currentBidAmount =
            selectedAdset?.bid_amount || 0;

        const budgetType =
            budgetAndStatusData?.budget_type || "unknown";

        const bidAmountValue =
            Math.round(parseFloat(bidAmount || 0) * 100);

        const changeBudgetValue =
            Math.round(parseFloat(changeBudget || 0) * 100);

        const payload = {
            adsetId: selectedAdset?.adset_id,
            campaignId:
                budgetAndStatusData?.campaign?.campaign_id,

            accountNumber,
            adsetname,
            updatedby: userdetails?.email,
            budgetType,
        };

        // ✅ Budget Change
        if (
            changeBudget !== undefined &&
            changeBudget !== '' &&
            !isNaN(changeBudget) &&
            parseFloat(changeBudget) > 0 &&
            changeBudgetValue !== Number(currentBudget)
        ) {

            payload.budget = changeBudgetValue;

            payload.activity = {
                editType: "Budget",
                campaignid:
                    budgetAndStatusData?.campaign?.campaign_id,
                adsetid: selectedAdset?.adset_id,
                Account: String(accountNumber),
                adsetname,
                updatedBy: userdetails?.userName,
                updatedUserEmail:
                    userdetails?.email,
                updateType:
                    "Adset budget updated",
                updateAt: moment()
                    .tz("Asia/Kolkata")
                    .format("DD-MM-YYYY hh:mm A"),
                updateDetail:
                    `From $${Number(currentBudget) / 100
                    } to $${Number(changeBudget)}`,
                budgetType
            };
        }

        // ✅ Bid Change
        if (
            bidAmount !== undefined &&
            bidAmount !== '' &&
            !isNaN(bidAmount) &&
            parseFloat(bidAmount) >= 0 &&
            bidAmountValue !== Number(currentBidAmount)
        ) {
            payload.bidAmount = bidAmountValue;
            payload.bidactivity = {
                editType: "Bid",
                campaignid:
                    budgetAndStatusData?.campaign?.campaign_id,
                adsetid: selectedAdset?.adset_id,
                Account: String(accountNumber),
                // campaignname,
                adsetname,
                updatedBy: userdetails?.userName,
                updatedUserEmail:
                    userdetails?.email,
                updateType:
                    "Adset bid strategy updated",
                updateAt: moment()
                    .tz("Asia/Kolkata")
                    .format("DD-MM-YYYY hh:mm A"),
                updateDetail:
                    `From $${Number(currentBidAmount) / 100
                    } to $${Number(bidAmount)}`,
            };
        }

        const hasBudget =
            Object.prototype.hasOwnProperty.call(
                payload,
                'budget'
            );

        const hasBidAmount =
            Object.prototype.hasOwnProperty.call(
                payload,
                'bidAmount'
            );

        if (!hasBudget && !hasBidAmount) {

            message.warning(
                "Please change Budget and/or Bid Amount before submitting."
            );

            return;
        }

        try {

            setConfirmLoading(true);

            const newResponse =
                await apiClient.post(
                    '/reports/historyactions/adsetbudget',
                    payload
                );

            if (
                newResponse.status === 200 ||
                newResponse.status === 201
            ) {

                // ✅ UPDATE LOCAL STATE ONLY
                setBudgetAndStatusData((prev) => ({

                    ...prev,

                    selected_adset: {

                        ...prev?.selected_adset,

                        ...(payload.budget !== undefined && {
                            budget_amount:
                                String(payload.budget)
                        }),

                        ...(payload.bidAmount !== undefined && {
                            bid_amount:
                                payload.bidAmount
                        })

                    }

                }));

                message.success(
                    "Adset Budget and/or Bid Updated"
                );

                setIsBudgetModalVisible(false);
            }

        } catch (err) {

            console.error(err);

            message.error(
                "Failed to update adset"
            );

        } finally {

            setConfirmLoading(false);

        }
    };

    return (
        <Row style={{ display: 'flex', flexDirection: 'column' }}>
            <Col style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
            }}>

                <div style={{
                    width: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    height: '32px'
                }}>
                    <p>Timezone: <span>{timeZone}</span></p>
                </div>
                <Switch
                    checked={showTables}
                    onChange={(checked) => setShowTables(checked)}
                    checkedChildren="Tables"
                    unCheckedChildren="Hide"
                    style={{
                        backgroundColor: showTables ? "#5B8CFF" : undefined,
                    }}
                />

                <Button
                    type="default"
                    icon={<BarChartOutlined />}
                    onClick={onClickBarChart}
                    checked={isGraphVisible}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={{
                        border: '2px solid #5B8CFF',
                        // color: isGraphVisible || hovered ? '#fff' : '#555',
                        color: theme === 'dark' ? '#fff' : (isGraphVisible || hovered ? '#fff' : '#555'),
                        backgroundColor: isGraphVisible || hovered ? '#5B8CFF' : 'transparent',
                        borderRadius: '18px',
                        fontWeight: 500,
                        padding: '0 13px',
                        height: '25px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        transition: 'all 0.2s ease-in-out',
                    }}
                >
                    Chart
                </Button>
            </Col>
            {isGraphVisible && (
                <div
                    style={{
                        width: '100%',
                        borderRadius: 12,
                        backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
                        padding: 15,
                        height: 'auto',
                        boxShadow:
                            theme === 'dark'
                                ? '0 1px 3px rgba(0,0,0,0.6)'
                                : '0 1px 6px rgba(0,0,0,0.08)',
                    }}
                >
                    <Col style={{ height: '400px', marginBottom: '10px' }}> {/* Container with fixed height */}
                        {chartData.dates.length === 0 ? (<div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {/* <Spin size="large" /> */}
                            <div style={{ padding: '24px' }}>
                                <Skeleton active paragraph={{ rows: 20 }} />
                            </div>
                        </div>) :
                            (
                                <div>
                                    {/* ✅ Custom Checkbox-Style Legend */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px', justifyContent: 'center' }}>
                                        {Object.keys(datasetColorMap).map(label => {
                                            const isVisible = !hiddenKeys.includes(label);
                                            return (
                                                <div
                                                    key={label}
                                                    onClick={() => toggleLegend(label)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        cursor: 'pointer',
                                                        gap: '6px',
                                                        fontSize: '13px',
                                                        color: theme === 'dark' ? '#fff' : '#000',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: '16px',
                                                            height: '16px',
                                                            borderRadius: '4px',
                                                            backgroundColor: datasetColorMap[label],
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#fff',
                                                            // fontWeight: 'bold',
                                                            fontSize: '11px',
                                                        }}
                                                    >
                                                        {isVisible ? '✔' : ''}
                                                    </div>
                                                    {label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Row style={{ height: '400px', marginTop: '20px' }}>
                                        <Line
                                            data={{
                                                labels: chartData.dates || [],
                                                datasets,
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { display: false },
                                                    tooltip: {
                                                        mode: 'index',
                                                        intersect: true,
                                                        displayColors: true,
                                                        boxWidth: 15,
                                                        boxHeight: 15,
                                                        callbacks: {
                                                            label: function (tooltipItem) {
                                                                const index = tooltipItem.dataIndex;
                                                                const dataset = tooltipItem.dataset;
                                                                const value = dataset.data[index];
                                                                const datasetLabel = dataset.label || '';
                                                                return `${datasetLabel}: ${value}`;
                                                            },
                                                        },
                                                    },
                                                },
                                                scales: {
                                                    x: {
                                                        ticks: {
                                                            padding: 30,
                                                            color: (context) => {
                                                                const index = context.index;
                                                                const label = chartData?.dates?.[index];
                                                                return getColorForValue(label);
                                                            },
                                                        },
                                                        grid: {
                                                            color: theme === 'dark' ? '#444' : '#e0e0e0',
                                                        },
                                                    },
                                                    y: {
                                                        beginAtZero: true,
                                                        ticks: {
                                                            callback: value => value.toFixed(2),
                                                            color: theme === 'dark' ? '#fff' : '#000',
                                                        },
                                                        grid: {
                                                            color: theme === 'dark' ? '#444' : '#e0e0e0',
                                                        },
                                                    },
                                                },
                                            }}
                                            height={350}
                                        />
                                    </Row>


                                </div>

                            )}
                    </Col>
                </div>
            )}
            {
                showTables && (
                    <Col style={{ display: 'flex', width: '100%', marginLeft: '0%' }}>
                        {/* Top 5 Dates with RPC */}
                        <div style={{ width: '20%', marginLeft: '1%' }}>
                            <p>Top 5 dates with Rpc</p>
                            <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #888' }}>
                                <thead>
                                    <tr>
                                        <th style={{ fontWeight: 'normal', border: '1px solid #888', padding: '3px' }}>Date</th>
                                        <th style={{ fontWeight: 'normal', border: '1px solid #888', padding: '2px' }}>RPC</th>
                                        <th style={{ fontWeight: 'normal', border: '1px solid #888', padding: '3px' }}>WeekDay</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chartData.dates
                                        .map((date, index) => ({
                                            date: date.split(" ")[0], // Get the date part only
                                            rpc: chartData.rpc[index],
                                        }))
                                        .sort((a, b) => b.rpc - a.rpc) // Sort by RPC descending
                                        .slice(0, 5) // Take top 5 dates
                                        .map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ fontWeight: 'normal', border: '1px solid #888', padding: '8px' }}>{item.date}</td>
                                                <td style={{ fontWeight: 'normal', border: '1px solid #888', padding: '8px' }}>{item.rpc}</td>
                                                <td style={{ fontWeight: 'normal', border: '1px solid #888', padding: '8px' }}>{moment(item.date).format('dddd')}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Top 5 Dates with Margin */}
                        <div style={{ marginLeft: "1%", width: '20%' }}>
                            <p>Top 5 dates with margin</p>
                            <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #888' }}>
                                <thead>
                                    <tr>
                                        <th style={{ fontWeight: 'normal', border: '1px solid #888', padding: '3px' }}>Date</th>
                                        <th style={{ fontWeight: 'normal', border: '1px solid #888', padding: '3px' }}>Margin</th>
                                        <th style={{ fontWeight: 'normal', border: '1px solid #888', padding: '3px' }}>WeekDay</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chartData.dates
                                        .map((date, index) => ({
                                            date: date.split(" ")[0], // Get the date part only
                                            margin: chartData.margin[index],
                                        }))
                                        .sort((a, b) => b.margin - a.margin) // Sort by Margin descending
                                        .slice(0, 5) // Take top 5 dates
                                        .map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ fontWeight: 'normal', border: '1px solid #888', padding: '8px' }}>{item.date}</td>
                                                <td style={{ fontWeight: 'normal', border: '1px solid #888', padding: '8px' }}>{item.margin}</td>
                                                <td style={{ fontWeight: 'normal', border: '1px solid #888', padding: '8px' }}>{moment(item.date).format('dddd')}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </Col>
                )}
            {/* <h1>{params.campaignAndAccount}hi</h1> */}
            <Col style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                {/* <Col>
                    <Input
                        type="text"
                        placeholder="Search table..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                        style={{border: '1px solid #5B8CFF', width: "170px", padding: "3px",backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555' }}
                    />
                    <Button 
                        type="default" 
                        icon={<ReloadOutlined  className='black-icon'/>} 
                        style={{ height: "30px", marginLeft: "10px", backgroundColor: '#5B8CFF', border: 'solid 0px' }} 
                        onClick={handleReload}  // Call refresh function when clicked
                    />
                </Col> */}
                <Col style={{ display: 'flex', justifyContent: "space-between", alignItems: 'center', marginBottom: '5px' }}>
                    <Select
                        placeholder="Select a range"
                        value={selectedValue}
                        onChange={handleChange}
                        style={{ width: "170px", border: '1px solid #4CAF50', borderRadius: '8px', color: theme === 'dark' ? '#fff' : '#000', }}
                        dropdownClassName={theme === 'dark' && "custom-dropdown"}
                        allowClear
                    >
                        {dateOptions.map((option, index) => (
                            <Option key={index} value={option}>
                                {option}
                            </Option>
                        ))}
                    </Select>
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'}
                        // style={{marginLeft: "5px", border: '1px solid #5B8CFF', width: "170px", padding: "3px",backgroundColor: theme === 'dark' ? '#555' : "white", color: theme === 'dark' ? 'white' : '#555' }}
                        style={{
                            borderRadius: 8,
                            border: '1px solid #4CAF50',
                            marginLeft: "5px",
                            color: theme === 'dark' ? '#fff' : '#000',
                            backgroundColor: theme === 'dark' ? '#000' : '#fff',
                            fontWeight: 500,
                            width: 170,
                        }}
                    />
                    <Button
                        type="default"
                        icon={<ReloadOutlined className='black-icon' />}
                        style={{ width: '35px', height: "33px", marginLeft: "5px", backgroundColor: '#5B8CFF', border: 'solid 0px' }}
                        onClick={handleReload}  // Call refresh function when clicked
                    />
                    <EditOutlined
                        onClick={() => setIsModalVisibles(true)}
                        style={{
                            marginLeft: '3px',
                            marginRight: '3px',
                            color: comment ? '#5B8CFF' : 'gray',
                            cursor: 'pointer',
                            fontSize: '27px',
                        }}
                        title={comment ? 'Edit Comment' : 'Add Comment'}
                    />
                </Col>
            </Col>
            <Col>
                {isLoading === true ? (
                    <div className="loader-container ag-container">
                        <div className="ag-grid-Loader">
                            <Audio
                                height="80"
                                width="80"
                                radius="9"
                                color="#5B8CFF"
                                ariaLabel="loading"
                                wrapperStyle
                                wrapperClass
                            />
                        </div>
                    </div>
                ) : (

                    <div
                        style={{
                            width: '100%',
                            borderRadius: 12,
                            backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
                            padding: 10,
                            height: 'auto',
                            boxShadow:
                                theme === 'dark'
                                    ? '0 1px 3px rgba(0,0,0,0.6)'
                                    : '0 1px 6px rgba(0,0,0,0.08)',
                        }}
                    >
                        <Col style={{ display: "flex", justifyContent: "center" }}>
                            <div style={{ width: '100%', display: 'flex', }}>
                                <Tooltip
                                    title={copied ? 'Copied!' : 'Click to copy'}
                                // color={copied ? 'green' : undefined}
                                >
                                    <p
                                        style={{ cursor: 'pointer', marginRight: '5px' }}
                                        onClick={handleCopy}
                                    >
                                        {decodedString}
                                    </p>
                                </Tooltip>
                                {((campaignComments.length > 0) && (campaignComments[0]?.comment)) && (
                                    <Tooltip title={campaignComments[0]?.comment}>
                                        <p
                                            style={{
                                                // marginLeft: '0px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '300px',
                                                cursor: 'pointer',
                                                marginBottom: '15px',
                                            }}
                                        >
                                            ({campaignComments[0]?.comment})
                                        </p>
                                    </Tooltip>
                                )}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px"
                                }}
                            >
                                <div>
                                    <Switch
                                        checked={

                                            budgetAndStatusData?.selected_adset?.adset_status === "ACTIVE"
                                        }
                                        style={{
                                            backgroundColor:
                                                (
                                                    budgetAndStatusData?.level === "campaign"
                                                        ? budgetAndStatusData?.campaign?.campaign_status === "ACTIVE"
                                                        : budgetAndStatusData?.selected_adset?.adset_status === "ACTIVE"
                                                )
                                                    ? "#5B8CFF"
                                                    : undefined
                                        }}
                                        onChange={(checked) => {
                                            setNextChecked(checked);
                                            setIsCampaignModalVisibles(true);
                                        }}
                                    />
                                    <Modal
                                        title="Confirm Action"
                                        open={isCampaignModalVisibles}
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
                                        <div>
                                            <p>
                                                Are you sure you want to turn {nextChecked ? "ON" : "OFF"} this campaign?
                                            </p>
                                            <p>Adset ID: {AdsetId}</p>
                                            <p>Adset Name: {adsetName}</p>
                                        </div>
                                    </Modal>
                                </div>

                                <div>
                                    <DollarOutlined style={{ fontSize: "18px" }} onClick={() => setIsBudgetModalVisible(true)} />
                                    {isBudgetModalVisible && (
                                        <Modal
                                            title={adsetName}
                                            open={isBudgetModalVisible}
                                            onOk={handleOk}
                                            onCancel={() => setIsBudgetModalVisible(false)}
                                            width={600}
                                            okButtonProps={{
                                                style: {
                                                    backgroundColor: '#5B8CFF',
                                                    borderColor: '#5B8CFF'
                                                }
                                            }}
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

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '15px'
                                                }}
                                            >

                                                {/* Budget Type */}
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <span>
                                                        Budget Type:&nbsp;
                                                    </span>

                                                    <span style={{ fontWeight: 'normal' }}>
                                                        {budgetAndStatusData?.budget_type || "-"}
                                                    </span>
                                                </div>

                                                {/* Budget Amount */}
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '2px'
                                                    }}
                                                >

                                                    {/* <p style={{ marginBottom: '0px' }}>
                                                                                    Budget Amount:
                                                                                </p> */}

                                                    <Input
                                                        type="number"
                                                        disabled={
                                                            budgetAndStatusData?.selected_adset?.budget_amount == null
                                                        }
                                                        value={changeBudget}
                                                        onChange={(e) =>
                                                            onChangeBudget(e.target.value)
                                                        }
                                                        placeholder="0"
                                                        className={
                                                            theme === 'dark'
                                                                ? 'custom-input-dark'
                                                                : 'custom-input-light'
                                                        }
                                                    />
                                                </div>

                                                {/* Bid Amount */}
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '2px'
                                                    }}
                                                >

                                                    <p style={{ marginBottom: '0px' }}>
                                                        Bid Amount:
                                                    </p>

                                                    <Input
                                                        type="number"
                                                        value={bidAmount}
                                                        disabled={
                                                            budgetAndStatusData?.selected_adset?.bid_amount == null
                                                        }
                                                        onChange={(e) =>
                                                            setBidAmount(e.target.value)
                                                        }
                                                        placeholder="0"
                                                        className={
                                                            theme === 'dark'
                                                                ? 'custom-input-dark'
                                                                : 'custom-input-light'
                                                        }
                                                    />
                                                </div>

                                                {/* Adset ID */}
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <p>
                                                        Adset ID:&nbsp;
                                                    </p>

                                                    <span style={{ fontWeight: 'normal' }}>
                                                        {
                                                            budgetAndStatusData
                                                                ?.selected_adset
                                                                ?.adset_id || "-"
                                                        }
                                                    </span>
                                                </div>

                                            </div>
                                        </Modal>
                                    )}
                                </div>
                            </div>
                        </Col>
                        <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>
                            <AgGridReact
                                rowData={filteredData}
                                rowHeight={30}
                                className='custom-grid'
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                quickFilterText={searchText}
                                pinnedBottomRowData={domainFixedFooter}
                                onCellClicked={onCellClicked}
                                getMainMenuItems={(params) => {
                                    return params.defaultItems.filter(item => item !== 'resetColumns');
                                }}
                                gridOptions={{
                                    ensureDomOrder: false,
                                    suppressRowClickSelection: true,
                                    suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                    enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                    groupSelectsChildren: true, // ✅ Ensures child rows are selected properly
                                }}
                                onGridReady={(params) => onGridReady(params, 'grid1', gridRef)}
                                pagination={true}
                                getRowStyle={(params) => {
                                    if (params.node.rowPinned) {
                                        return {
                                            //   fontWeight: 'bold',
                                            backgroundColor: theme === "dark" ? '#000' : '#fff',
                                            color: theme === "dark" ? '#fff' : '#000',
                                            height: '30px'
                                        };
                                    }
                                    return null;
                                }}
                                onCellKeyDown={onCellKeyDown}
                                getCellStyle={(params) => {
                                    const isSelected = selectedCells.some(
                                        (cell) => cell.rowIndex === params.node.rowIndex && cell.colId === params.column.getId()
                                    );

                                    // ✅ Ensure first selected cell is highlighted
                                    const isFirstSelected = firstSelectedCell &&
                                        firstSelectedCell.rowIndex === params.node.rowIndex &&
                                        firstSelectedCell.colId === params.column.getId();

                                    return isSelected || isFirstSelected ? { backgroundColor: "#007bff", color: "#fff" } : {};
                                }}
                                groupDisplayType="multipleColumns"
                                suppressAggFuncInHeader={true}
                                groupSuppressBlankHeader={true}
                                onFilterChanged={(params) => {
                                    const api = params.api;
                                    const filteredData = [];
                                    api.forEachNodeAfterFilterAndSort((node) => {
                                        if (!node.rowPinned) {
                                            filteredData.push(node.data);
                                        }
                                    });

                                    const fieldValueFilter = (field, value) =>
                                        filteredData.filter((item) => item[field] && item[field] === value);

                                    const updatedFooter = [
                                        {
                                            adsetName: 'Total',
                                            spend: filteredData.reduce((acc, curr) => acc + parseFloat(curr.spend || 0), 0).toFixed(2),
                                            revenue: filteredData.reduce((acc, curr) => acc + parseFloat(curr.revenue || 0), 0).toFixed(2),
                                            profit: filteredData.reduce((acc, curr) => acc + parseFloat(curr.profit || 0), 0).toFixed(2),
                                            margin: `${(
                                                (filteredData.reduce((acc, curr) => acc + parseFloat(curr.profit || 0), 0) /
                                                    filteredData.reduce((acc, curr) => acc + parseFloat(curr.revenue || 0), 0)) *
                                                100
                                            ).toFixed(2)}%`,
                                            filteration: `${(((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0) - filteredData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0)) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0)) * 100).toFixed(2)}`,
                                            rpc: (
                                                filteredData.reduce((acc, curr) => acc + parseFloat(curr.rpc || 0), 0) / filteredData.length || 0
                                            ).toFixed(2),
                                            cpl: (
                                                filteredData.reduce((acc, curr) => acc + parseFloat(curr.cpl || 0), 0) / filteredData.length || 0
                                            ).toFixed(2),
                                            ncpl: (
                                                filteredData.reduce((acc, curr) => acc + parseFloat(curr.ncpl || 0), 0) / filteredData.length || 0
                                            ).toFixed(2),
                                            fbleads: filteredData.reduce((acc, curr) => acc + parseFloat(curr.fbleads || 0), 0),
                                            conversions: filteredData.reduce((acc, curr) => acc + parseFloat(curr.conversions || 0), 0),
                                            fmargin: `${(
                                                (filteredData.reduce((acc, curr) => acc + parseFloat(curr.profit || 0), 0) /
                                                    filteredData.reduce((acc, curr) => acc + parseFloat(curr.spend || 0), 0)) *
                                                100
                                            ).toFixed(2)}%`,
                                            roi: `${(
                                                ((filteredData.reduce((acc, curr) => acc + parseFloat(curr.revenue || 0), 0) -
                                                    filteredData.reduce((acc, curr) => acc + parseFloat(curr.spend || 0), 0)) /
                                                    filteredData.reduce((acc, curr) => acc + parseFloat(curr.spend || 0), 0)) *
                                                100
                                            ).toFixed(2)}%`,
                                            cpc: (
                                                filteredData.reduce((acc, curr) => acc + parseFloat(curr.cpc || 0), 0) / filteredData.length || 0
                                            ).toFixed(2),
                                            fbclicks: filteredData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks || 0), 0),
                                            cpclinkclicks: (
                                                filteredData.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks || 0), 0) / filteredData.length || 0
                                            ).toFixed(2),
                                            fblinkclicks: filteredData.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks || 0), 0),
                                            impressions: filteredData.reduce((acc, curr) => acc + parseFloat(curr.impressions || 0), 0),
                                            ctr: `${(
                                                (filteredData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks || 0), 0) /
                                                    filteredData.reduce((acc, curr) => acc + parseFloat(curr.impressions || 0), 0)) *
                                                100
                                            ).toFixed(2)}%`,
                                            //   tq: parseFloat(
                                            //     filteredData.reduce((acc, curr) => {
                                            //       const tqValue = Number(curr?.tq);
                                            //       return acc + (isNaN(tqValue) ? 0 : tqValue);
                                            //     }, 0).toFixed(2)
                                            // ),
                                        },
                                    ];

                                    // setFilteredData(filteredData);
                                    setDomainFixedFooter(updatedFooter);

                                    // Example field-based filtering logic
                                    const specificFieldData = fieldValueFilter('status', 'Active'); // Replace 'status' and 'Active' with your field and value
                                    // console.log('Filtered by status (Active):', specificFieldData);
                                }}
                            />
                        </div>
                    </div>
                )}
            </Col>
            <Modal
                title={
                    decodedString
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
                                {campaignComments?.length > 0 ? campaignComments[0]?.editedTime : ""}
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
                    style={{ color: theme === "dark" ? "white" : "black" }}
                    backgroundColor={theme === "dark" ? "#1e1e1e" : "white"}   // background color
                    borderColor={theme === "dark" ? "#555" : "#d9d9d9"}
                />
            </Modal>
        </Row>
    )
}