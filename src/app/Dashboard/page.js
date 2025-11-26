// pages/dashboard.js
"use client"
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { redirect } from "next/navigation";
// pages/index.js
import React from 'react';
import axios from 'axios';
import { Select, Tag, theme, Button, Carousel, Tabs, Tooltip, message, Switch } from 'antd';
import StickyBox from 'react-sticky-box';
import moment from 'moment-timezone';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
// const options = [];
// for (let i = 10; i < 36; i++) {
//   options.push({
//     value: i.toString(36) + i,
//     label: i.toString(36) + i,
//   });
// }
const revenuePartnerNames = {
    "MEDIA_DOT_NET": "FB_Mnet",
    "Bodies": "FB_Bodies",
    "TONIC": "FB_Tonic",
    "TONIC1": "FB_Tonic1",
    "Domain Active": "FB_DomainActive",
    "ENKI": "FB_Enki",
    "System1": "FB_System1",
    "Domain_Active": "Newsbreak_DA",
    "Sedo": "FB_Sedo",
    "Tonic_Rsoc": "FB_TonicRsoc",
    "Inuvo_Prism": "FB_InuvoPrism",
    "Code_Fuel": "FB_CodeFuel"
};


const newtworkCollections = {
    "FB_Mnet": "Facebook_Mnet_Daily",
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
    "FB_TonicRsoc": "Facebook_TonicRsoc",
    "FB_InuvoPrism": "Facebook_InuvoPrismDaily",
    "FB_CodeFuel": "Facebook_CodeFuel_Daily"
}

import { DatePicker, Space, ConfigProvider, Flex, Spin, Skeleton } from 'antd';
import { generate } from '@ant-design/colors'; // For dynamic color generation
import { CheckCircleFilled, CloseCircleFilled, CloseCircleOutlined, ReloadOutlined, CopyOutlined } from "@ant-design/icons";
const { RangePicker } = DatePicker;
import locale from 'antd/es/date-picker/locale/en_US';
const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
const defaultDates = [dayjs(yesterday), dayjs(yesterday)];
const disabledDate = (current) => {
    // Disable dates after today
    return current && current > dayjs().endOf('day');
};

import {
    Card,
    Row,
    Col,
    Statistic,
    Progress,
    List,
    Avatar,
    Divider,
    Typography,
    Checkbox
} from 'antd';

import { LoadingOutlined, BarChartOutlined } from '@ant-design/icons';
import { PiWarningCircleFill } from "react-icons/pi";
// import {
//     TrophyOutlined,
//     ArrowUpOutlined,
//     ArrowDownOutlined,
//     DollarOutlined,
//     UserOutlined,
//     ShoppingOutlined,
//     SmileOutlined,
// } from '@ant-design/icons';

import { useTokenContext } from '../components/parent';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import 'ag-grid-enterprise';



const { Title } = Typography;

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

// async function  functionForFetchingUsersData(){
//     const { userdetails } = useTokenContext();
//     const response = await axios.post('http://localhost:8000/getAccountNameandStatus/', {updatedNetwork: userdetails?.adAccounts});
//     return response.data;

// }


// const { userdetails } = useTokenContext();

// if (!userdetails?.adAccounts) {
//     return <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//         <Flex align="center" gap="middle">
//             {/* <Spin size="small" />
//             <Spin /> */}
//             <Spin size="large" />
//         </Flex>
//     </div>;
// }

const RevenuePartnerDashboard = () => {
    const { userdetails } = useTokenContext();
    const { theme } = useTokenContext();
    const { apiClient } = useTokenContext();
    const carouselRef = useRef();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
    const [loading, setLoading] = useState(true);
    const [loading1, setLoading1] = useState(false);
    const [timeZone, setTimeZone] = useState('UTC');
    const networks = Object.keys(userdetails?.adAccounts);
    const [revenuePratner, setRevenuePartner] = useState(networks);



    const last7Days = dayjs().subtract(7, 'days').format('YYYY-MM-DD');

    const today = dayjs().subtract(0, 'days').format('YYYY-MM-DD');

    const thisYear = dayjs().format('YYYY');

    const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');

    const defaultDates = [dayjs(yesterday), dayjs(yesterday)];

    const [startDate, setStartDate] = useState(yesterday);

    const [endDate, setEndDate] = useState(yesterday);

    const [revenuePartnerData, setRevenuePartnerData] = useState([]);

    const [revenuePartnerDomainData, setRevenuePartnerDomainData] = useState([]);

    const [fetchData, setFetchData] = useState(true);

    const [fixedFooter, setFixedFooter] = useState([]);

    const [domainFixedFooter, setDomainFixedFooter] = useState([]);

    const timeZoneForColumnDefs = useRef('UTC');

    const [activeTab, setActiveTab] = useState("1");

    const [columnDefs, setColumnDefs] = useState([]);

    const [domainColumnDefs, setDomainColumnDefs] = useState([]);

    const [isDomain, setIsDomain] = useState("");




    const onChangeTime = (value) => {
        setTimeZone(value);
        timeZoneForColumnDefs.current = value;
    };

    const onChangeRevenuePartner = (value) => {
        setRevenuePartner(value);
    };

    const handleChange = (dates) => {
        if (dates && dates.length === 2) {
            const [start, end] = dates;
            setStartDate(start.format('YYYY-MM-DD'));
            setEndDate(end.format('YYYY-MM-DD'));
        }
    };

    const onClickSubmit = () => {
        setFetchData(true);
        setLoading(true);

        // Update to "Domain" only if the previous value is "Domain"
        setIsDomain((prevState) => {
            if (prevState === "Domain") {
                setIsDomain(""); // Reset state to empty string
                setTimeout(() => {
                    setIsDomain("Domain"); // Update to "Domain" after 1 second
                }, 1000);
            }
            return prevState; // Return the previous state unchanged
        });
    };

    const average = (params) => {
        const total = params.values.reduce((acc, value) => acc + parseFloat(value || 0), 0);
        const count = params.values.filter(value => value !== null && value !== undefined).length;  // Count non-null/undefined values
        return count > 0 ? Math.round((total / count) * 100) / 100 : 0;  // Avoid division by zero
    };

    const spender = (params) => {
        const total = params.values.reduce((acc, value) => acc + parseFloat(value || 0), 0);
        return Math.round(total * 100) / 100; // Round to 2 decimal places
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

    const [defaultColDef] = useState({
        flex: 4,
        sortable: true,
        filter: true,
        resizable: true,
        enableRowGroup: true,
    });

    console.log(revenuePratner);

    const items = [
        { key: '1', label: 'Data', content: 'Content for Data' },
        ...(revenuePratner && revenuePratner.length === 1 && revenuePratner[0] === "Mnet"
            ? [{ key: '2', label: 'Domain', content: 'Content for Domain data' }]
            : [])
    ];

    const handleCarouselChange = (index) => {
        setActiveTab(index);
        carouselRef.current.goTo(parseInt(index) - 1)
        console.log(index);
        if (index == 2) {
            setIsDomain("Domain");
        }
    };

    const handleSlideChange = (from, to) => {
        setActiveTab((parseInt(to) + 1).toString());
        // console.log((parseInt(to)+1).toString());
    };

    const marginFormatter = (params) => {
        return `${parseFloat(params.value || 0).toFixed(2)}%`; // Ensure 2 decimal places in currency format
    };

    const currencyFormatter = (params) => {
        return `$${parseFloat(params.value || 0).toFixed(2)}`; // Ensure 2 decimal places in currency format
    };

    const renderCarouselNav = () => (
        <StickyBox offsetTop={64} offsetBottom={20} style={{ zIndex: 1, padding: '0px', margin: '0px' }}>
            <Tabs
                activeKey={activeTab}
                onChange={(key) => handleCarouselChange(key)}
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

    const functionForFetchingRevenuePartnerData = async () => {
        const token = localStorage.getItem("token")
        console.log(token);
        const fetchRevenueData = await apiClient.get(`/revenuePartnerData?timezone=${timeZone}&startDate=${startDate}&endDate=${endDate}&network=${revenuePratner}`);
        const response = fetchRevenueData.data;
        setRevenuePartnerData(response);
        setFetchData(false);
        setLoading(false);
        setColumnDefs([
            {
                field: "network",
                resizable: true,
                sortable: true,
                hide: true, // Hide column as it's grouped
                rowGroup: true,
                enableRowGroup: true,
                minWidth: 150,
                flex: 6,

            },
            {
                field: `${timeZoneForColumnDefs.current}Date`,
                headerName: 'Date',
                flex: 5,
                minWidth: 100,
                valueFormatter: (params) => {
                    // Format the date with the short weekday
                    if (params.value !== 'Total') {
                        const date = dayjs(params.value); // Assuming you are using dayjs
                        const weekday = date.format('ddd'); // Short weekday (e.g., Mon, Tue)
                        return `${params.value} (${weekday})`; // e.g., "2023-11-25 (Sat)"
                    }
                    return params.value; // For 'Totals' row
                },
                cellRenderer: (params) => {
                    if (params.value !== 'Total') {
                        const date = dayjs(params.value); // Assuming you are using dayjs
                        const weekday = date.format('ddd'); // Short weekday (e.g., Mon, Tue)

                        return (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {/* Display Date and Weekday */}
                                {/* <span>{`${weekday}, ${params.value}`}</span> */}
                                <span>{params.value}</span>
                                {/* Display "Not Finalised" if finalised is false */}
                                {params.data?.finalised === false && (
                                    <span style={{ color: 'red', marginLeft: '5px' }}>(Not Finalized)</span>
                                    //   <span style={{ color: 'red', marginLeft: '5px' }}>
                                    //     <Tooltip title={"The Data is not finalized yet for this date"}>
                                    //         <PiWarningCircleFill />
                                    //     </Tooltip>
                                    //   </span>
                                )}
                            </div>
                        );
                    }
                    return params.value; // Return for 'Totals' row
                },
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: "spend",
                resizable: true,
                sortable: true,
                minWidth: 150,
                aggFunc: spender,
                valueFormatter: currencyFormatter,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: "revenue",
                resizable: true,
                sortable: true,
                minWidth: 150,
                aggFunc: spender,
                valueFormatter: currencyFormatter,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: 'profit',
                resizable: true,
                sortable: true,
                minWidth: 150,
                aggFunc: spender,
                cellClassRules: {
                    'font-red': p => p.value < 0,
                    'font-green': params => params.value > 0,
                },
                valueFormatter: currencyFormatter,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: "margin",
                headerName: "Margin(%)",
                aggFunc: average,
                cellClassRules: {
                    'font-red': p => p.value < 0
                },
                minWidth: 150,
                valueFormatter: marginFormatter,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: 'rpc',
                headerName: 'RPC',
                aggFunc: avgRpcCpl,
                valueFormatter: rpcCplFormatter,
                minWidth: 100,
                flex: 3,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: 'cpl',
                headerName: 'CPL',
                aggFunc: avgRpcCpl,
                valueFormatter: rpcCplFormatter,
                minWidth: 100,
                flex: 3,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            }
        ]);
        setFixedFooter([
            {
                [`${timeZoneForColumnDefs.current}Date`]: 'Total',
                spend: parseFloat(response?.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0).toFixed(2)),
                revenue: parseFloat(response?.reduce((acc, curr) => acc + parseFloat(curr?.revenue), 0).toFixed(2)),
                profit: parseFloat(response?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0).toFixed(2)),
                margin: parseFloat((response?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / response?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
                rpc: parseFloat((response?.reduce((acc, curr) => acc + parseFloat(curr?.rpc), 0) / response?.length).toFixed(2)),
                cpl: parseFloat((response?.reduce((acc, curr) => acc + parseFloat(curr?.cpl), 0) / response?.length).toFixed(2)),
                conversions: parseFloat(response?.reduce((acc, curr) => acc + parseFloat(curr?.conversions), 0).toFixed(2)),
                clicks: parseFloat(response?.reduce((acc, curr) => acc + parseFloat(curr?.clicks), 0).toFixed(2)),
                impressions: parseFloat(response?.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0).toFixed(2)),
            }
        ]);
    };

    const functionForFetchingRevenuePartnerDomainData = async () => {
        setLoading1(true);
        const token = localStorage.getItem("token")
        console.log(token);
        const fetchRevenueData = await apiClient.get(`/revenuePartner/DomainData?timezone=${timeZone}&startDate=${startDate}&endDate=${endDate}&network=${revenuePratner}`);
        const response = fetchRevenueData.data;
        setRevenuePartnerDomainData(response);
        setFetchData(false);
        setLoading1(false);
        setDomainColumnDefs([
            {
                field: 'domain',
                headerName: 'Domain',
                minWidth: 400,
                // resizable: true,
                sortable: true,
                hide: true, // Hide column as it's grouped
                rowGroup: true,
                enableRowGroup: true,
                flex: 8,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',

            },
            {
                field: `${timeZoneForColumnDefs.current}Date`,
                headerName: 'Date',
                flex: 3,
                minWidth: 120,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: "spend",
                resizable: true,
                sortable: true,
                minWidth: 150,
                aggFunc: spender,
                valueFormatter: currencyFormatter,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: "revenue",
                resizable: true,
                sortable: true,
                minWidth: 150,
                aggFunc: spender,
                valueFormatter: currencyFormatter,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: 'profit',
                resizable: true,
                sortable: true,
                minWidth: 150,
                cellClassRules: {
                    'font-red': p => p.value < 0,
                    'font-green': params => params.value > 0,
                },
                aggFunc: spender,
                valueFormatter: currencyFormatter,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: "margin",
                headerName: 'Margin(%)',
                aggFunc: average,
                cellClassRules: {
                    'font-red': p => p.value < 0
                },
                minWidth: 150,
                valueFormatter: marginFormatter,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: 'rpc',
                headerName: 'RPC',
                aggFunc: avgRpcCpl,
                valueFormatter: rpcCplFormatter,
                minWidth: 100,
                flex: 3,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: 'cpl',
                headerName: 'CPL',
                aggFunc: avgRpcCpl,
                valueFormatter: rpcCplFormatter,
                minWidth: 100,
                flex: 3,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            }
        ]);
        setDomainFixedFooter([
            {
                // domain:'Totals',
                [`${timeZoneForColumnDefs.current}Date`]: 'Total',
                spend: parseFloat(response?.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0).toFixed(2)),
                revenue: parseFloat(response?.reduce((acc, curr) => acc + parseFloat(curr?.revenue), 0).toFixed(2)),
                profit: parseFloat(response?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0).toFixed(2)),
                margin: parseFloat((response?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / response?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
                rpc: parseFloat((response?.reduce((acc, curr) => acc + parseFloat(curr?.rpc), 0) / response?.length).toFixed(2)),
                cpl: parseFloat((response?.reduce((acc, curr) => acc + parseFloat(curr?.cpl), 0) / response?.length).toFixed(2)),
                conversions: parseFloat(response?.reduce((acc, curr) => acc + parseFloat(curr?.conversions), 0).toFixed(2)),
                clicks: parseFloat(response?.reduce((acc, curr) => acc + parseFloat(curr?.clicks), 0).toFixed(2)),
                impressions: parseFloat(response?.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0).toFixed(2)),
            }
        ]);
    };

    useEffect(() => {
        if (fetchData) {
            functionForFetchingRevenuePartnerData();
        }
    }, [fetchData]);

    useEffect(() => {
        if (isDomain === "Domain") {
            functionForFetchingRevenuePartnerDomainData();
        }
    }, [isDomain]);

    const [dropdownVisible, setDropdownVisible] = useState(false);

    const handleDropdownVisibleChange = (open) => {
        setDropdownVisible(open);
    };

    // const onChangeRevenuePartner = (selectedValues) => {
    //     console.log('Selected Values:', selectedValues);
    // };

    const options = networks.map((network) => ({
        label: network,
        value: network,
    }));

    const sharedProps = {
        mode: 'multiple',
        style: {
            width: '100%',
        },
        options,
        placeholder: 'Select projects',
        maxTagCount: 'responsive',
    };

    // Initialize with all options selected
    // const [revenuePratner, setRevenuePartner] = useState(networks);

    const selectProps = {
        value: revenuePratner,
        onChange: setRevenuePartner,
    };

    const autoGroupColumnDefRevPartner = {
        headerName: 'Projects', // Display name for the grouped column
        minWidth: 250, // Set width for grouped rows
        resizable: true, // Enable resizing
        sortable: true, // Enable sorting
        cellRendererParams: {
            suppressCount: true, // Suppress row count in the grouped column
        },
    };

    const autoGroupColumnDefRevenuePartnerDomainData = {
        headerName: 'Domains', // Display name for the grouped column
        minWidth: 300, // Set width for grouped rows
        resizable: true, // Enable resizing
        sortable: true, // Enable sorting
        cellRendererParams: {
            suppressCount: true, // Suppress row count in the grouped column
        },
    };


    return (
        <div style={{ width: '100%', margin: '0px', padding: '0px' }}>
            <Space direction="vertical" style={{ width: '100%', paddingBottom: "1%" }}>
                {/* Filters */}
                <Row gutter={[16, 16]}>
                    <Col xs={8} sm={8} md={5} lg={4}>
                        <Space
                            direction="vertical"
                            style={{
                                width: '100%',
                                backgroundColor: theme === 'dark' ? '#333' : ''
                            }}
                        >
                            <Select {...sharedProps} {...selectProps}
                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                dropdownClassName={theme === 'dark' && 'custom-dropdown'}
                            />
                        </Space>
                    </Col>
                    <Col xs={16} sm={16} md={10} lg={8} className='Dashboard-Details-1'>
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
                    <Col xs={16} sm={16} md={10} lg={8} className='Dashboard-Details-2'>
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
                    <Col xs={12} sm={12} md={4} lg={3}>
                        <Select
                            placeholder="Select timezone"
                            onChange={onChangeTime}
                            value={timeZone}
                            style={{ width: '100%' }}
                            options={timezones.map((item) => ({ value: item, label: item }))}
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            dropdownClassName={theme === 'dark' && 'custom-dropdown'}
                        />
                    </Col>
                    <Col xs={12} sm={12} md={2}>
                        <Button onClick={onClickSubmit} style={{ backgroundColor: '#91C25F', color: "black", fontWeight: '600', border: ' 1px solid #4caf50' }}>
                            Submit
                        </Button>
                    </Col>
                </Row>
            </Space>
            {/* Table */}
            <div
            // style={{padding:'0px', margin:'0px'}}
            >
                {renderCarouselNav()}
            </div>
            <Carousel className='zoom-90' dots={false} ref={carouselRef} beforeChange={handleSlideChange}>
                <div>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '75vh' }}>
                            <Spin indicator={<LoadingOutlined spin />} size="large" />
                        </div>
                    ) : (
                        revenuePartnerData.length > 0 && (
                            <div
                                className={`ag-theme-alpine ${gridThemeClass} zoom-size`}
                                style={{ width: '100%', height: '100%' }}
                            >
                                <AgGridReact
                                    rowData={revenuePartnerData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    gridOptions={{
                                        ensureDomOrder: false,
                                        suppressRowClickSelection: true,
                                        suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                        enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                    }}
                                    suppressAggFuncInHeader={true}
                                    pinnedBottomRowData={fixedFooter}
                                    autoGroupColumnDef={autoGroupColumnDefRevPartner}
                                    getRowStyle={(params) => {
                                        if (params.node.rowPinned) {
                                            return {
                                                fontWeight: 'bold',
                                                // backgroundColor: theme === "dark" ? '#000' : '#fff',
                                                // color: theme === "dark" ? '#fff' : '#000',
                                            };
                                        }
                                        return null;
                                    }}
                                    onFilterChanged={(params) => {
                                        const api = params.api;
                                        const filteredData = [];
                                        api.forEachNodeAfterFilterAndSort((node) => {
                                            if (!node.rowPinned) {
                                                filteredData.push(node.data);
                                            }
                                        });

                                        const updatedFooter = [
                                            {
                                                [`${timeZoneForColumnDefs.current}Date`]: 'Total',
                                                spend: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.spend || 0), 0).toFixed(2)),
                                                revenue: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.revenue || 0), 0).toFixed(2)),
                                                profit: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.profit || 0), 0).toFixed(2)),
                                                margin: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.revenue), 0) * 100).toFixed(2)),
                                                rpc: parseFloat(
                                                    (filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.rpc || 0), 0) / filteredData?.length || 0).toFixed(2)
                                                ),
                                                cpl: parseFloat(
                                                    (filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.cpl || 0), 0) / filteredData?.length || 0).toFixed(2)
                                                ),
                                                impressions: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.impressions || 0), 0).toFixed(2)),
                                            },
                                        ];

                                        setFixedFooter(updatedFooter);
                                    }}
                                />
                            </div>
                        )
                    )}
                </div>
                {revenuePratner && revenuePratner.length === 1 && revenuePratner[0] === "Mnet" &&

                    <div>
                        {loading1 ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                                <Spin indicator={<LoadingOutlined spin />} size="large" />
                            </div>
                        ) : (
                            revenuePartnerDomainData.length > 0 ? (
                                <div
                                    className={`ag-theme-alpine ${gridThemeClass}`}
                                    style={{ width: '100%', height: '60vh' }}
                                >
                                    <AgGridReact
                                        rowData={revenuePartnerDomainData}
                                        columnDefs={domainColumnDefs}
                                        defaultColDef={defaultColDef}
                                        suppressAggFuncInHeader={true}
                                        gridOptions={{
                                            ensureDomOrder: false,
                                            suppressRowClickSelection: true,
                                            suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                            enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                        }}
                                        autoGroupColumnDef={autoGroupColumnDefRevenuePartnerDomainData}
                                        pinnedBottomRowData={domainFixedFooter}
                                        getRowStyle={(params) => {
                                            if (params.node.rowPinned) {
                                                return {
                                                    fontWeight: 'bold',
                                                    // backgroundColor: theme === "dark" ? '#000' : '#fff',
                                                    // color: theme === "dark" ? '#fff' : '#000',
                                                };
                                            }
                                            return null;
                                        }}
                                        onFilterChanged={(params) => {
                                            const api = params.api;
                                            const filteredData = [];
                                            api.forEachNodeAfterFilterAndSort((node) => {
                                                if (!node.rowPinned) {
                                                    filteredData.push(node.data);
                                                }
                                            });

                                            const updatedFooter = [
                                                {
                                                    [`${timeZoneForColumnDefs.current}Date`]: 'Total',
                                                    spend: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.spend || 0), 0).toFixed(2)),
                                                    revenue: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.revenue || 0), 0).toFixed(2)),
                                                    profit: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.profit || 0), 0).toFixed(2)),
                                                    margin: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.revenue), 0) * 100).toFixed(2)),
                                                    rpc: parseFloat(
                                                        (filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.rpc || 0), 0) / filteredData.length || 0).toFixed(2)
                                                    ),
                                                    cpl: parseFloat(
                                                        (filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.cpl || 0), 0) / filteredData.length || 0).toFixed(2)
                                                    ),
                                                    impressions: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.impressions || 0), 0).toFixed(2)),
                                                },
                                            ];

                                            setDomainFixedFooter(updatedFooter);
                                        }}
                                    />
                                </div>
                            ) : null
                        )}

                    </div>}
            </Carousel>

        </div>
    );
};


const Dashboard = () => {
    const { userdetails } = useTokenContext();
    const { theme } = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
    // console.log(userdetails);
    // console.log(userdetails?.adAccounts, "f1");
    // const { adAccounts } = userdetails;
    // const handleAsyncLogic = async () => {
    //     // Wait for async function to finish
    //     const data = await functionForFetchingUsersData();

    //     // After async function resolves, do something with the data
    //     const anotherVariable = `User count: ${data.length}`;

    //     console.log('Fetched Data:', data);
    //     console.log('Another Variable:', anotherVariable);
    //     return data
    // };

    if (!userdetails?.adAccounts) {
        return <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Flex align="center" gap="middle">
                {/* <Spin size="small" />
                <Spin /> */}
                <Spin size="large" />
            </Flex>
        </div>;
    }

    if (userdetails?.role === "Revenue_Partner") {
        return (
            <RevenuePartnerDashboard />
        )
    };

    if (userdetails?.email == "careers@adsgoat.in" || userdetails?.role === 'Network_Partner') {
        redirect("/Campaigns")
    }

    const transformData = (data) => {
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => {
                // Check if the value is an array and if it contains objects
                if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                    // Convert array of objects to array of accountNumbers
                    return [key, value.map(obj => ({ accountNumber: obj.accountNumber, accountName: obj.accountName, status: obj.status, }))];
                }
                // If it's not an array of objects, keep it as is
                return [key, value];
            })
        );
    };

    const [skeletonLoading, setSkeletonLoading] = useState(true);
    const [rendering, setRendering] = useState(false);
    const [usersDataFromFetch, setUsersDataFromFetch] = useState(null);

    // (async () => {
    //     if (usersDataFromFetch === null) {  // Prevents multiple calls
    //       const data = await functionForFetchingUsersData();
    //       setUsersDataFromFetch(data);  // Set the fetched data
    //       setRendering(false);  // Stop the loading state
    //     }
    //   })();

    const transformedData = transformData(userdetails?.adAccounts);
    // console.log(userdetails?.adAccounts, "1");


    const defaultCategory = Object.keys(transformedData)[0];

    const [startDate, setStartDate] = useState(yesterday);

    const [endDate, setEndDate] = useState(yesterday);

    const [newstartDate, setNewStartDate] = useState(yesterday);

    const [newendDate, setNewEndDate] = useState(yesterday);

    const [darkMode, setDarkMode] = useState(false);
    const [data, setData] = useState([]);
    const [activeTab, setActiveTab] = useState("1");

    const [activeTab1, setActiveTab1] = useState("1");

    const [activeTab2, setActiveTab2] = useState("1");

    const [activeTab3, setActiveTab3] = useState("1");

    const [showGraphs, setShowGraphs] = useState(localStorage.getItem("showGraph") === "true" ? true : false);
    // const toggleTheme = () => {
    //     setDarkMode(!darkMode);
    // };
    const [time, setTime] = useState('UTC');

    const [newagencyNameReport, setAgencyNameReport] = useState([]);

    const agencyNameReport = useMemo(() => newagencyNameReport, [newagencyNameReport]);

    const [byAccountNumber, setByAccountNumber] = useState([]);
    const [hovered, setHovered] = useState(false);

    const onChangeTime = (value) => {
        setSkeletonLoading(true);
        setTime(value);
    }
    const carouselRef = useRef();

    const carouselRef1 = useRef();

    const carouselRef2 = useRef();

    const carouselRef3 = useRef();

    const revenue1 = useRef(0);
    const spend1 = useRef(0);
    const profit1 = useRef(0);
    const leads1 = useRef(0);
    const conversions1 = useRef(0);
    const cpc1 = useRef(0);
    const ncpl1 = useRef(0);
    const cpl1 = useRef(0);
    const ctr1 = useRef(0);
    const rpc1 = useRef(0);

    // State for the first Select element (categories)
    const [firstSelectValues, setFirstSelectValues] = useState([defaultCategory]);

    // State for the second Select element (selected items within categories)
    const [selectedItems, setSelectedItems] = useState({
        [defaultCategory]: transformedData[defaultCategory], // Default all items in the first category
    });

    const [chartData, setChartData] = useState({
        dates: [], newDates: [], spend: [], revenue: [], profit: [], margin: [], ncpl: [], ctr: [], cpc: [], conversions: [], leads: [],
    });

    const [chartDataByDate, setChartDataByDate] = useState({
        datesByDate: [], spendByDate: [], revenueByDate: [], profitByDate: [], marginByDate: [], ncplByDate: [], ctrByDate: [], cpcByDate: [], conversionsByDate: [], leadsByDate: [],
    });

    const [newrowData, setRowData] = useState([]);
    const rowData = useMemo(() => newrowData, [newrowData]);
    const [newtop5Campaigns, setTop5Campaigns] = useState([]);
    const top5Campaigns = useMemo(() => newtop5Campaigns, [newtop5Campaigns]);
    const [newtop5RevenueCampaigns, setTop5RevenueCampaigns] = useState([]);
    const top5RevenueCampaigns = useMemo(() => newtop5RevenueCampaigns, [newtop5RevenueCampaigns]);
    const [newtop5ProfitCampaigns, setTop5ProfitCampaigns] = useState([]);
    const top5ProfitCampaigns = useMemo(() => newtop5ProfitCampaigns, [newtop5ProfitCampaigns]);
    const [newoverAllProfitCampaigns, setOverAllProfitCampaigns] = useState([]);
    const overAllProfitCampaigns = useMemo(() => newoverAllProfitCampaigns, [newoverAllProfitCampaigns]);
    const [newoverAllLossCampaigns, setOverAllLossCampaigns] = useState([]);
    const overAllLossCampaigns = useMemo(() => newoverAllLossCampaigns, [newoverAllLossCampaigns]);
    const [selectedDates, setSelectedDates] = useState(defaultDates);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [newdomainWiseData, setDomainWiseData] = useState([]);
    const domainWiseData = useMemo(() => newdomainWiseData, [newdomainWiseData]);

    const { apiClient } = useTokenContext();
    const [networksWithStatus, setNetworksWithStatus] = useState([]);


    // const [collectionName, setCollectionName] = useState([]);

    // const functionalCall = (data) => {
    //     setData(data);
    // }

    const [searchValue, setSearchValue] = useState('');


    const chartRef = useRef();
    const [hidden, setHidden] = useState([
        'Spend', 'Revenue', 'RPC', 'CPL', 'Margin',
        'NCPL', 'CTR', 'CPC', 'Conversions', 'Leads', // <-- Add new
    ]);

    const chartByDateRef = useRef(); // ✅ separate ref for second chart
    const [hiddenByDate, setHiddenByDate] = useState([
        'Spend', 'Revenue', 'RPC', 'CPL', 'Margin',
        'NCPL', 'CTR', 'CPC', 'Conversions', 'Leads', // <-- Add new
    ]); // ✅ only Profit shown initially

    // const colorMaps = {
    //     Spend: 'rgba(44, 144, 192, 1)',
    //     Revenue: 'rgba(99, 200, 99, 1)',
    //     RPC: 'rgba(255, 99, 132, 1)',
    //     CPL: 'rgba(255, 159, 64, 1)',
    //     Profit: 'rgba(255, 206, 86, 1)',
    //     Margin: 'rgba(153, 102, 255, 1)',
    //     NCPL: 'rgba(255, 105, 180, 1)',     // New
    //     CTR: 'rgba(255, 165, 0, 1)',        // New
    //     CPC: 'rgba(30, 144, 255, 1)',       // New
    //     Conversions: 'rgba(75, 0, 130, 1)', // New
    //     Leads: 'rgba(128, 0, 0, 1)',        // New

    // };

    const colorMaps = {
        Revenue: '#00C853',       // Green
        Profit: '#26A69A',        // Teal
        Spend: '#3F51B5',         // Indigo (Amount Spent)
        Leads: '#FFC107',         // Amber
        Conversions: '#673AB7',   // Deep Purple
        NCPL: '#AED581',          // Light Green
        CPL: '#FF9800',           // Orange
        CTR: '#2196F3',           // Blue
        CPC: '#F44336',           // Red
        RPC: '#00ACC1',           // Cyan
    };

    const toggle = (label) => {
        const chart = chartRef.current;
        const index = chart.data.datasets.findIndex((d) => d.label === label);
        if (index === -1) return;

        const meta = chart.getDatasetMeta(index);
        const isCurrentlyHidden = hidden.includes(label);

        if (isCurrentlyHidden) {
            meta.hidden = false;
            setHidden(hidden.filter((l) => l !== label));
        } else {
            meta.hidden = true;
            setHidden([...hidden, label]);
        }

        chart.update();
    };

    const datasets = Object.keys(colorMaps).map((key) => ({
        label: key,
        data: chartData?.[key.toLowerCase()] || [],
        borderColor: colorMaps[key],
        pointBackgroundColor: colorMaps[key],
        pointHoverBackgroundColor: colorMaps[key],
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
        hidden: hidden.includes(key),
    }));

    const toggle0 = (label) => {
        const chart = chartByDateRef.current;
        const index = chart.data.datasets.findIndex((d) => d.label === label);
        if (index === -1) return;

        const meta = chart.getDatasetMeta(index);
        const isCurrentlyHidden = hiddenByDate.includes(label);

        if (isCurrentlyHidden) {
            meta.hidden = false;
            setHiddenByDate(hiddenByDate.filter((l) => l !== label));
        } else {
            meta.hidden = true;
            setHiddenByDate([...hiddenByDate, label]);
        }

        chart.update();
    };

    const datasets0 = chartDataByDate
        ? Object.keys(colorMaps)
            .filter(key => Array.isArray(chartDataByDate?.[`${key.toLowerCase()}ByDate`]))
            .map((key) => ({
                label: key,
                data: chartDataByDate[`${key.toLowerCase()}ByDate`],
                borderColor: colorMaps[key],
                pointBackgroundColor: colorMaps[key],
                pointHoverBackgroundColor: colorMaps[key],
                // fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 8,
                hidden: hiddenByDate.includes(key),
            }))
        : [];

    const handleSearchChange = (value) => {
        setSearchValue(value.toLowerCase());  // Store lowercase search term
    };

    // const handleSelectAllChange = (checked, category) => {
    //     if (checked) {
    //         setSearchValue(""); // Reset search value when network is selected
    //     }
    //     // Your existing logic for handling "Select All"
    // };
    useEffect(() => {
        var token = localStorage.getItem("token")
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
    const handleChangeDates = (dates) => {
        setSelectedDates(dates || []); // Save selected dates in state
        setIsPickerOpen(true); // Ensure the RangePicker stays open after date selection
    };

    const onClickCloseButton = () => {
        setIsPickerOpen(false)
        setSelectedDates([dayjs(startDate), dayjs(endDate)])

    }

    // Handle the "Submit" button click
    const handleSubmit = () => {
        if (selectedDates.length === 1) {
            const [start] = selectedDates;
            const formattedStart = start ? start.format('YYYY-MM-DD') : '';
            setStartDate(formattedStart);
            setEndDate(''); // Keep endDate empty if only startDate is selected
        } else if (selectedDates.length === 2) {
            const [start, end] = selectedDates;
            const formattedStart = start ? start.format('YYYY-MM-DD') : '';
            const formattedEnd = end ? end.format('YYYY-MM-DD') : '';
            if (startDate !== formattedStart || endDate !== formattedEnd) {
                setSkeletonLoading(true); // Start loading when dates change
            }
            setStartDate(formattedStart);
            setEndDate(formattedEnd);
        }

        // Close the date picker only after clicking submit
        setIsPickerOpen(false);
    };

    // Handle closing when clicking outside the picker
    const handleOpenChange = (open) => {
        if (!open && !isPickerOpen) {
            // This condition ensures we only close when the user clicks outside
            setIsPickerOpen(false);
        } else if (open) {
            setIsPickerOpen(true); // Ensure it remains open if interacting with it
        }
    };

    function getTotalEstimatedRevenue(fullData) {
        const total = fullData?.reduce((sum, item) => {
            // Check if 'estimated_revenue' exists in the object and is a number
            if (item.estimated_revenue && typeof item.estimated_revenue === 'number') {
                return sum + item.estimated_revenue;
            }
            return sum;
        }, 0); // Start the sum at 0

        // Round the final total to 2 decimal places
        return Math.round(total * 100) / 100;
    }


    // function getTotalEstimatedSpend(fullData) {
    //     return fullData.reduce((total, item) => {
    //         // Check if 'estimated_revenue' exists in the object and is a number
    //         if (item.spend) {
    //             return total + parseFloat(item.spend);
    //         }
    //         // console.log(typeof total);
    //         return Math.round(total * 100) / 100;
    //     }, 0); // Start the total at 0
    // }getTotalEstimatedProfit

    function getTotalEstimatedSpend(fullData) {
        const total = fullData?.reduce((sum, item) => {
            // Check if 'estimated_revenue' exists in the object and is a number
            if (item.spend) {
                return sum + parseFloat(item.spend);
            }
            return sum;
        }, 0); // Start the sum at 0

        // Round the final total to 2 decimal places
        return Math.round(total * 100) / 100;
    }

    function getTotalEstimatedProfit(fullData) {
        return Math.round((getTotalEstimatedRevenue(fullData) - getTotalEstimatedSpend(fullData)) * 100) / 100;
    }

    function getTotalLeads(fullData) {
        const total = fullData?.reduce((sum, item) => {
            // Check if 'estimated_revenue' exists in the object and is a number
            if (item.fbLeads) {
                return sum + parseInt(item.fbLeads);
            }
            return sum;
        }, 0); // Start the sum at 0

        // Round the final total to 2 decimal places
        return total;
    }

    function getTotalConversions(fullData, collectionName) {
        if (collectionName?.length === 1 && collectionName[0] === "Facebook_Mnet" && time === "UTC") {
            const total = fullData?.reduce((sum, item) => {
                // Check if 'estimated_revenue' exists in the object and is a number
                if (item.ad_clicks) {
                    return sum + parseInt(item.ad_clicks);
                }
                return sum;
            }, 0); // Start the sum at 0

            // Round the final total to 2 decimal places
            return total;

        }
        else {
            const total = fullData?.reduce((sum, item) => {
                // Check if 'estimated_revenue' exists in the object and is a number
                if (item.conversions) {
                    return sum + parseInt(item.conversions);
                }
                return sum;
            }, 0); // Start the sum at 0

            // Round the final total to 2 decimal places
            return total;
        }
    }



    function getTotalFbClicks(fullData) {
        const total = fullData?.reduce((sum, item) => {
            // Check if 'estimated_revenue' exists in the object and is a number
            if (item.fbClicks) {
                return sum + parseInt(item.fbClicks);
            }
            return sum;
        }, 0); // Start the sum at 0

        // Round the final total to 2 decimal places
        return total;
    }

    function getAverageEstimatedCpc(fullData) {
        // // Filter items that have a valid 'cpc' value
        // const validCpcItems = fullData?.filter(item => item.cpc);

        // // Calculate the total sum of 'cpc'
        // const total = validCpcItems?.reduce((sum, item) => {
        //     return sum + parseFloat(item.cpc);
        // }, 0);

        // // Calculate the average, and round to 2 decimal places
        // const average = validCpcItems?.length > 0 ? (total / validCpcItems?.length) : 0;

        // return Math.round(average * 100) / 100;
        return Math.round((getTotalEstimatedSpend(fullData) / getTotalFbClicks(fullData)) * 100) / 100;
    }

    function getTotalImpressions(fullData) {
        const total = fullData?.reduce((sum, item) => {
            // Check if 'estimated_revenue' exists in the object and is a number
            if (item.impressions) {
                return sum + parseInt(item.impressions);
            }
            return sum;
        }, 0); // Start the sum at 0

        // Round the final total to 2 decimal places
        return total;
    }

    function getTotalNcpl(fullData, collectionName) {
        return Math.round((getTotalEstimatedSpend(fullData) / getTotalConversions(fullData, collectionName)) * 100) / 100;
    }

    function getTotalRpc(fullData, collectionName) {
        return Math.round((getTotalEstimatedRevenue(fullData) / getTotalConversions(fullData, collectionName)) * 100) / 100;
    }

    function getTotalCpl(fullData) {
        return Math.round((getTotalEstimatedSpend(fullData) / getTotalLeads(fullData)) * 100) / 100;
    }

    function getTotalCtr(fullData) {
        return Math.round(((getTotalFbClicks(fullData) / getTotalImpressions(fullData)) * 100) * 100) / 100;
    }

    const functionCallForResponse = debounce(async (data) => {
        // console.log(moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A'), "start");
        const transformObjectKeys = (obj) => {
            const transformedObject = {};

            Object.keys(obj).forEach((key) => {
                // Split the key by underscore
                const splitKey = key.split('_');

                // Join the array back into a string for the new key
                let newKey;
                if (key === "Newsbreak_DA") {
                    newKey = "Newsbreak_DomainActive"
                } else if (key === "FB_DomainActive") {
                    newKey = "Facebook_DActive_Names"
                } else if (key === "FB_Mnet") {
                    newKey = "Facebook_Mnet_Daily"
                } else if (key === "FB_InuvoPrism") {
                    newKey = "Facebook_InuvoPrismDaily"
                }
                else if (key === "FB_CodeFuel") {
                    newKey = "Facebook_CodeFuel_Daily"
                }
                else { newKey = "Facebook_" + splitKey[1]; }

                // Initialize the array if the key doesn't exist
                if (!transformedObject[newKey]) {
                    transformedObject[newKey] = [];
                }

                // Check if the value is an array
                if (Array.isArray(obj[key])) {
                    // Loop through the array and extract each accountNumber
                    obj[key].forEach(item => {
                        if (item.accountNumber) {
                            transformedObject[newKey].push(item.accountNumber);
                        }
                    });
                } else if (obj[key]?.accountNumber) {
                    // If it's an object, directly push the accountNumber
                    transformedObject[newKey].push(obj[key].accountNumber);
                }
            });

            return transformedObject;
        };

        // Example usage
        // const originalObject = {
        //     ad_campaign_2023: "active",
        //     ad_set_2023: "paused",
        // };

        const transformedObject = transformObjectKeys(data);
        console.log(transformedObject);
        const collectionName = (Object.keys(transformedObject));
        // console.log(moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A'), "end");
        // console.log(transformedObject);
        let response;
        try {
            response = await apiClient.post(`/Dashboard?timezone=${time}&start_date=${startDate}&end_date=${endDate}`, { formattedData: [transformedObject] });

        } catch (error) {
            message.error('API failed to fetch the data please click the reload button', 8);
        }
        const responseData = response?.data;
        console.log(responseData, "response");
        // console.log(moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A'), "deadend");
        const functionForDetailsUpdate = async () => {
            revenue1.current = getTotalEstimatedRevenue(responseData);
            spend1.current = getTotalEstimatedSpend(responseData);
            profit1.current = getTotalEstimatedProfit(responseData);
            leads1.current = getTotalLeads(responseData);
            conversions1.current = getTotalConversions(responseData, collectionName);
            cpc1.current = getAverageEstimatedCpc(responseData);
            ncpl1.current = getTotalNcpl(responseData, collectionName);
            cpl1.current = getTotalCpl(responseData);
            rpc1.current = getTotalRpc(responseData, collectionName);
            ctr1.current = getTotalCtr(responseData);

            setData(responseData);
        }
        functionForDetailsUpdate();
        console.log(collectionName.length === 1 && collectionName[0] === "Facebook_Mnet" && time === "UTC")
        function groupByCampaignAndDate(data) {
            return data?.reduce((acc, obj) => {
                const campaignKey = obj?.campaign_id;
                const dateKey = obj[`${time}Date`]; // directly access the specifiedDate field from the object
                const accountNumber = obj?.accountNumber;
                // Create a combined key for grouping by both campaign_name and specifiedDate
                const key = `${campaignKey}_${dateKey}_${accountNumber}`;

                // Find if the combined key already exists in the accumulator array
                let entry = acc.find(item => item.key === key);

                if (!entry) {
                    // If not found, create a new entry for this campaign_name and specifiedDate
                    acc.push({
                        key, // Unique key for grouping
                        campaign_name: obj?.campaign_name,
                        campaign_id: obj?.campaign_id,
                        Date: dateKey,
                        spend: obj.spend ? parseFloat(obj.spend) : 0,
                        estimated_revenue: obj?.estimated_revenue ? parseFloat(obj?.estimated_revenue) : 0,
                        fbLeads: obj.fbLeads ? parseInt(obj?.fbLeads) : 0,
                        fbClicks: obj.fbClicks ? parseInt(obj?.fbClicks) : 0,
                        impressions: obj.impressions ? parseInt(obj?.impressions) : 0,
                        conversions: collectionName.length === 1 && collectionName[0] === "Facebook_Mnet" && time === "UTC"
                            ? obj.ad_clicks
                                ? parseInt(obj?.ad_clicks)
                                : 0
                            : obj.conversions
                                ? parseInt(obj?.conversions)
                                : 0,
                        revenuePartner: obj?.revenuePartner,
                        mediaBuyerName: obj?.MediaBuyerName,
                        holder: obj?.Holder,
                        accountNumber: obj?.accountNumber
                        // Add any other fields you want to keep after grouping
                    });
                } else {
                    // If found, sum the respective fields
                    entry.spend += obj?.spend !== null && obj?.spend !== undefined ? parseFloat(obj?.spend) : 0;
                    entry.estimated_revenue += obj?.estimated_revenue !== null && obj?.estimated_revenue !== undefined ? parseFloat(obj?.estimated_revenue) : 0;
                    entry.fbLeads += obj?.fbLeads !== null && obj?.fbLeads !== undefined ? parseInt(obj?.fbLeads) : 0;
                    entry.fbClicks += obj?.fbClicks !== null && obj?.fbClicks !== undefined ? parseInt(obj?.fbClicks) : 0;
                    entry.impressions += obj?.impressions !== null && obj?.impressions !== undefined ? parseInt(obj?.impressions) : 0;
                    entry.conversions += collectionName.length === 1 && collectionName[0] === "Facebook_Mnet" && time === "UTC"
                        ? obj?.ad_clicks !== null && obj?.ad_clicks !== undefined
                            ? parseInt(obj?.ad_clicks)
                            : 0
                        : obj?.conversions !== null && obj?.conversions !== undefined
                            ? parseInt(obj?.conversions)
                            : 0;
                }

                return acc;
            }, []).map(campaign => {
                // Calculate profit after grouping
                campaign.profit = campaign.estimated_revenue - campaign.spend;
                return campaign;
            });
        }

        const group = groupByCampaignAndDate(responseData);
        console.log(group);

        function getTopFiveSpendCampaignsByDate(data) {
            // Step 1: Group objects by specifiedDate using a Map
            const groupedByDate = data?.reduce((acc, curr) => {
                const date = curr.Date; // Use specifiedDate directly from the object

                if (!acc.has(date)) {
                    acc.set(date, []);
                }
                acc.get(date).push(curr); // Add campaigns to the date group

                return acc;
            }, new Map());

            // Step 2: Prepare an array to hold the top 5 campaigns across all dates
            const topFiveCampaigns = [];

            // Step 3: Iterate through each date group and get the top 5 campaigns by spend
            groupedByDate?.forEach(campaigns => {
                // Sort the campaigns by spend in descending order and take the top 5
                const topFive = campaigns
                    .sort((a, b) => b.spend - a.spend) // Sort by spend descending
                    .slice(0, 5); // Take top 5 campaigns for each date

                // Add the top 5 campaigns to the final result array
                topFiveCampaigns.push(...topFive);
            });

            return topFiveCampaigns; // Return a combined array of top 5 campaigns across all dates
        }

        function getTopFiveRevenueCampaignsByDate(data) {
            // Step 1: Group objects by specifiedDate using a Map
            const groupedByDate = data?.reduce((acc, curr) => {
                const date = curr.Date; // Use specifiedDate directly from the object

                if (!acc.has(date)) {
                    acc.set(date, []);
                }
                acc.get(date).push(curr); // Add campaigns to the date group

                return acc;
            }, new Map());

            // Step 2: Prepare an array to hold the top 5 campaigns across all dates
            const topFiveCampaigns = [];

            // Step 3: Iterate through each date group and get the top 5 campaigns by spend
            groupedByDate?.forEach(campaigns => {
                // Sort the campaigns by spend in descending order and take the top 5
                const topFive = campaigns
                    .sort((a, b) => b.estimated_revenue - a.estimated_revenue) // Sort by spend descending
                    .slice(0, 5); // Take top 5 campaigns for each date

                // Add the top 5 campaigns to the final result array
                topFiveCampaigns.push(...topFive);
            });

            return topFiveCampaigns; // Return a combined array of top 5 campaigns across all dates
        }

        function getTopFiveProfitCampaignsByDate(data) {
            // Step 1: Group objects by specifiedDate using a Map
            const groupedByDate = data?.reduce((acc, curr) => {
                const date = curr.Date; // Use specifiedDate directly from the object

                if (!acc.has(date)) {
                    acc.set(date, []);
                }
                acc.get(date).push(curr); // Add campaigns to the date group

                return acc;
            }, new Map());

            // Step 2: Prepare an array to hold the top 5 campaigns across all dates
            const topFiveCampaigns = [];

            // Step 3: Iterate through each date group and get the top 5 campaigns by spend
            groupedByDate?.forEach(campaigns => {
                // Sort the campaigns by spend in descending order and take the top 5
                const topFive = campaigns
                    .sort((a, b) => b.profit - a.profit) // Sort by spend descending
                    .slice(0, 5); // Take top 5 campaigns for each date

                // Add the top 5 campaigns to the final result array
                topFiveCampaigns.push(...topFive);
            });

            return topFiveCampaigns; // Return a combined array of top 5 campaigns across all dates
        }

        function getAllProfitableCampaignsByDate(data) {
            // Step 1: Group objects by specifiedDate using a Map
            const groupedByDate = data?.reduce((acc, curr) => {
                const date = curr.Date; // Use specifiedDate directly from the object

                if (!acc.has(date)) {
                    acc.set(date, []);
                }
                acc.get(date).push(curr); // Add campaigns to the date group

                return acc;
            }, new Map());

            // Step 2: Prepare an array to hold all profitable campaigns across all dates
            const profitableCampaigns = [];

            // Step 3: Iterate through each date group, filter campaigns with profit > 0, and sort them by profit
            groupedByDate?.forEach(campaigns => {
                const filteredAndSortedCampaigns = campaigns
                    .filter(campaign => campaign.profit > 0) // Keep only campaigns with profit > 0
                    .sort((a, b) => b.profit - a.profit); // Sort by profit in descending order

                // Add all filtered and sorted campaigns to the final result array
                profitableCampaigns.push(...filteredAndSortedCampaigns);
            });

            return profitableCampaigns; // Return a combined array of all profitable campaigns
        }

        function getAllUnprofitableCampaignsByDate(data) {
            // Step 1: Group objects by specifiedDate using a Map
            const groupedByDate = data?.reduce((acc, curr) => {
                const date = curr.Date; // Use specifiedDate directly from the object

                if (!acc.has(date)) {
                    acc.set(date, []);
                }
                acc.get(date).push(curr); // Add campaigns to the date group

                return acc;
            }, new Map());

            // Step 2: Prepare an array to hold all unprofitable campaigns across all dates
            const unprofitableCampaigns = [];

            // Step 3: Iterate through each date group, filter campaigns with profit < 0, and sort them by profit
            groupedByDate?.forEach(campaigns => {
                const filteredAndSortedCampaigns = campaigns
                    .filter(campaign => campaign.profit < 0) // Keep only campaigns with profit < 0
                    .sort((a, b) => b.profit - a.profit); // Sort by profit in descending order (optional)

                // Add all filtered and sorted campaigns to the final result array
                unprofitableCampaigns.push(...filteredAndSortedCampaigns);
            });

            return unprofitableCampaigns; // Return a combined array of all unprofitable campaigns
        }


        const top5SpendCampaignsByDate = getTopFiveSpendCampaignsByDate(groupByCampaignAndDate(responseData));
        const top5RevenueCampaignsByDate = getTopFiveRevenueCampaignsByDate(groupByCampaignAndDate(responseData));
        const top5ProfitCampaignsByDate = getTopFiveProfitCampaignsByDate(groupByCampaignAndDate(responseData));
        const overallProfitCampaignsByDate = getAllProfitableCampaignsByDate(groupByCampaignAndDate(responseData));
        const overallLossCampaignsByDate = getAllUnprofitableCampaignsByDate(groupByCampaignAndDate(responseData));
        // console.log(top5ProfitCampaignsByDate);


        setTop5Campaigns(top5SpendCampaignsByDate);
        setTop5RevenueCampaigns(top5RevenueCampaignsByDate);
        setTop5ProfitCampaigns(top5ProfitCampaignsByDate);
        setOverAllProfitCampaigns(overallProfitCampaignsByDate);
        setOverAllLossCampaigns(overallLossCampaignsByDate);
        console.log(top5SpendCampaignsByDate);

        // function groupAndSortByCampaignSpend(data) {
        //     const groupedData = data.reduce((acc, obj) => {
        //         const key = obj.campaign_name;

        //         // Find if the campaign_name already exists in the accumulator array
        //         let campaign = acc.find(item => item.campaign_name === key);

        //         if (!campaign) {
        //             // If not found, create a new entry for this campaign_name
        //             acc.push({
        //                 accountNumber: obj.accountNumber,
        //                 campaign_name: obj.campaign_name,
        //                 spend: obj.spend ? parseFloat(obj.spend) : 0, // Initialize with current object values
        //                 estimated_revenue: obj.estimated_revenue ? parseFloat(obj.estimated_revenue) : 0,
        //                 fbLeads: obj.fbLeads ? parseInt(obj.fbLeads) : 0,
        //                 conversions: obj.conversions ? parseInt(obj.conversions) : 0,
        //                 revenuePartner: obj.revenuePartner,
        //                 mediaBuyerName: obj.MediaBuyerName,
        //                 holder: obj.Holder,
        //             });
        //         } else {
        //             // If found, sum the respective fields
        //             campaign.spend += obj.spend !== null && obj.spend !== undefined ? parseFloat(obj.spend) : 0;
        //             campaign.estimated_revenue += obj.estimated_revenue !== null && obj.estimated_revenue !== undefined ? parseFloat(obj.estimated_revenue) : 0;
        //             campaign.fbLeads += obj.fbLeads !== null && obj.fbLeads !== undefined ? parseInt(obj.fbLeads) : 0;
        //             campaign.conversions += obj.conversions !== null && obj.conversions !== undefined ? parseInt(obj.conversions) : 0;
        //         }

        //         return acc;
        //     }, []).map(campaign => {
        //         // Calculate profit after grouping
        //         campaign.profit = campaign.estimated_revenue - campaign.spend;
        //         return campaign;
        //     });

        //     // Sort the grouped data by spend in descending order and return the top 5 campaigns
        //     return groupedData.sort((a, b) => b.spend - a.spend).slice(0, 5);
        // }

        // // Example usage
        // const groupedData1 = groupAndSortByCampaignSpend(responseData);
        // setTop5Campaigns(groupedData1);


        // console.log(groupedData1, "campaign");


        function groupByAccountNumberAndDate(data, specifiedDateKey) {
            return data?.reduce((acc, obj) => {
                const accountKey = obj.accountNumber;
                const dateKey = obj[`${specifiedDateKey}Date`]; // dynamically access the specified date field

                // Create a combined key for grouping by both accountNumber and dynamically passed date field
                const key = `${accountKey}_${dateKey}`;

                // Find if the combined key already exists in the accumulator array
                let entry = acc.find(item => item.key === key);

                if (!entry) {
                    // If not found, create a new entry for this accountNumber and specifiedDate
                    acc.push({
                        key, // Unique key for grouping
                        accountNumber: obj.accountNumber,
                        specifiedDate: dateKey,
                        spend: obj.spend ? parseFloat(obj.spend) : 0,
                        estimated_revenue: obj.estimated_revenue ? parseFloat(obj.estimated_revenue) : 0,
                        fbClicks: obj.fbClicks ? parseInt(obj.fbClicks) : 0,
                        impressions: obj.impressions ? parseInt(obj.impressions) : 0,
                        fbLeads: obj.fbLeads ? parseInt(obj.fbLeads) : 0,
                        conversions: collectionName.length === 1 && collectionName[0] === "Facebook_Mnet" && time === "UTC"
                            ? obj.ad_clicks
                                ? parseInt(obj?.ad_clicks)
                                : 0
                            : obj.conversions
                                ? parseInt(obj?.conversions)
                                : 0,
                        revenuePartner: obj.revenuePartner,
                        mediaBuyerName: obj.MediaBuyerName,
                        holder: obj.Holder,
                        // rpc: parseFloat(((obj.estimated_revenue/obj.conversions)*100)/100).toFixed(2),
                        // cpl: parseFloat(((obj.spend/obj.fbLeads)*100)/100).toFixed(2) || 0
                    });
                } else {
                    // If found, sum the respective fields
                    entry.spend += obj.spend !== null && obj.spend !== undefined ? parseFloat(obj.spend) : 0;
                    entry.estimated_revenue += obj.estimated_revenue !== null && obj.estimated_revenue !== undefined ? parseFloat(obj.estimated_revenue) : 0;
                    entry.fbLeads += obj.fbLeads !== null && obj.fbLeads !== undefined ? parseInt(obj.fbLeads) : 0;
                    entry.fbClicks += obj.fbClicks !== null && obj.fbClicks !== undefined ? parseInt(obj.fbClicks) : 0;
                    entry.impressions += obj.impressions !== null && obj.impressions !== undefined ? parseInt(obj.impressions) : 0;
                    entry.conversions += collectionName.length === 1 && collectionName[0] === "Facebook_Mnet" && time === "UTC"
                        ? obj?.ad_clicks !== null && obj?.ad_clicks !== undefined
                            ? parseInt(obj?.ad_clicks)
                            : 0
                        : obj?.conversions !== null && obj?.conversions !== undefined
                            ? parseInt(obj?.conversions)
                            : 0;
                }

                return acc;
            }, []).map(account => {
                // Calculate profit after grouping
                account.profit = account.estimated_revenue - account.spend,
                    account.rpc = parseFloat(((account.estimated_revenue / account.conversions) * 100) / 100).toFixed(2),
                    account.cpl = parseFloat(((account.spend / account.fbLeads) * 100) / 100).toFixed(2) || 0,
                    account.cpc = parseFloat(((account.spend / account.fbClicks) * 100) / 100).toFixed(2) || 0,
                    account.ctr = parseFloat((((account.fbClicks / account.impressions) * 100) * 100) / 100).toFixed(2) || 0

                return account;
            });
        }

        console.log(responseData[0], "hi");
        const groupedData = groupByAccountNumberAndDate(responseData, time);

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

        const groupByAccountNumberData = groupByAccountNumber(groupedData, time);

        setByAccountNumber(groupByAccountNumberData);

        setRowData(groupedData);

        function groupByDate(data, specifiedDateKey) {
            return data?.reduce((acc, obj) => {
                const dateKey = obj[`${specifiedDateKey}Date`]; // dynamically access the specified date field

                // Find if the date key already exists in the accumulator array
                let entry = acc.find(item => item.date === dateKey);

                if (!entry) {
                    // If not found, create a new entry for this date
                    acc.push({
                        date: dateKey,
                        spend: obj.spend ? parseFloat(obj.spend) : 0,
                        estimated_revenue: obj.estimated_revenue ? parseFloat(obj.estimated_revenue) : 0,
                        fbLeads: obj.fbLeads ? parseInt(obj.fbLeads) : 0,
                        conversions: obj.conversions ? parseInt(obj.conversions) : 0,
                        fbClicks: obj.fbClicks ? parseInt(obj.fbClicks) : 0, //new
                        impressions: obj.impressions ? parseInt(obj.impressions) : 0, // new
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
                    entry.fbClicks += obj.fbClicks ? parseInt(obj.fbClicks) : 0; // new
                    entry.impressions += obj.impressions ? parseInt(obj.impressions) : 0; // new
                }

                return acc;
            }, []).map(dateEntry => {
                // Calculate profit after grouping
                dateEntry.profit = dateEntry.estimated_revenue - dateEntry.spend;
                return dateEntry;
            });
        }

        const groupedByDateData = groupByDate(responseData, time);

        const sortedDataByDate = groupedByDateData.sort((a, b) => {
            if (a.date < b.date) {
                return -1; // a.date comes before b.date
            }
            if (a.date > b.date) {
                return 1; // a.date comes after b.date
            }
            return 0; // If dates are the same, maintain original order
        });

        const datesByDate = sortedDataByDate.map(d => d.date);
        const spendByDate = sortedDataByDate.map(d => Math.round((d.spend) * 100) / 100);
        const revenueByDate = sortedDataByDate.map(d => Math.round(parseFloat(d.estimated_revenue) * 100) / 100);
        const profitByDate = sortedDataByDate.map(d => Math.round((d.estimated_revenue - d.spend) * 100) / 100);
        const rpcByDate = sortedDataByDate.map(d => !isNaN((d.estimated_revenue / d.conversions)) && (d.estimated_revenue / d.conversions) !== undefined ? Math.round((d.estimated_revenue / d.conversions) * 100) / 100 : 0);
        const cplByDate = sortedDataByDate.map(d => !isNaN(((d.spend / d.fbLeads) * 100)) && ((d.spend / d.fbLeads) * 100) !== undefined ? Math.round((((d.spend / d.fbLeads) * 100) / 100) * 100) / 100 : 0);
        const marginByDate = sortedDataByDate.map(d => d.estimated_revenue !== 0 ? Math.round((((d.estimated_revenue - d.spend) / d.estimated_revenue) * 100) * 100) / 100 : 0);

        const ncplByDate = sortedDataByDate.map(d =>
            !isNaN(d.spend / d.conversions) ? Math.round((d.spend / d.conversions) * 100) / 100 : 0
        );
        const ctrByDate = sortedDataByDate.map(d =>
            d.impressions > 0 ? Math.round((d.fbClicks / d.impressions) * 10000) / 100 : 0
        );
        const cpcByDate = sortedDataByDate.map(d =>
            !isNaN(d.cpc) ? Math.round(d.cpc * 100) / 100 : 0
        );
        const conversionsByDate = sortedDataByDate.map(d => d.conversions || 0);
        const leadsByDate = sortedDataByDate.map(d => d.fbLeads || 0);

        setChartDataByDate({
            datesByDate, spendByDate, revenueByDate, profitByDate, marginByDate, rpcByDate, cplByDate, ncplByDate, ctrByDate, cpcByDate, conversionsByDate, leadsByDate,
        });

        console.log(groupedData);

        function groupDataByDomainAndAccount(data, dateField) {
            console.log(dateField);
            const DomainGroupedData = data?.reduce((acc, obj) => {
                const { domain, accountNumber, spend, estimated_revenue, ...rest } = obj;
                const specifiedDate = obj[dateField]; // Dynamically get the date based on the field

                // Create a unique key for grouping by domain, specifiedDate, and accountNumber
                const key = `${specifiedDate}-${domain}-${accountNumber}`;

                if (!acc[key]) {
                    acc[key] = {
                        specifiedDate,
                        domain,
                        accountNumber,
                        spend: obj.spend ? parseFloat(obj.spend) : 0,
                        estimated_revenue: obj.estimated_revenue ? parseFloat(obj.estimated_revenue) : 0,
                        fbLeads: obj.fbLeads ? parseInt(obj.fbLeads) : 0,
                        conversions: obj.conversions ? parseInt(obj.conversions) : 0,
                        fbClicks: obj.fbClicks ? parseInt(obj.fbClicks) : 0, //new
                        impressions: obj.impressions ? parseInt(obj.impressions) : 0, // new
                        revenuePartner: obj.revenuePartner,
                        mediaBuyerName: obj.MediaBuyerName,
                        holder: obj.Holder,
                    };
                }

                // Sum the fields (spend, estimated_revenue) based on the new grouping
                acc[key].spend += spend;
                acc[key].estimated_revenue += estimated_revenue;
                acc[key].fbLeads += obj.fbLeads !== null && obj.fbLeads !== undefined ? parseInt(obj.fbLeads) : 0;
                acc[key].conversions += obj.conversions !== null && obj.conversions !== undefined ? parseInt(obj.conversions) : 0;
                acc[key].fbClicks += obj.fbClicks ? parseInt(obj.fbClicks) : 0; // new
                acc[key].impressions += obj.impressions ? parseInt(obj.impressions) : 0; // new

                return acc;
            }, {});

            // Convert the grouped data object back to an array and add the profit field
            const domainResult = Object.values(DomainGroupedData).map(item => {
                item.profit = item.estimated_revenue - item.spend; // Calculate profit
                return item;
            });

            return domainResult;
        }

        function groupDataByBMNameAndAgencyName(data, dateField) {
            console.log(dateField);
            const DomainGroupedData = data?.reduce((acc, obj) => {
                const { spend, estimated_revenue, BMName, AgencyName, accountNumber, revenuePartner } = obj;
                const specifiedDate = obj[dateField]; // Dynamically get the date based on the field

                // Create a unique key for grouping by domain, specifiedDate, and accountNumber
                const key = `${specifiedDate}-${BMName}-${AgencyName}-${accountNumber}`;

                if (!acc[key]) {
                    acc[key] = {
                        specifiedDate,
                        BMName,
                        AgencyName,
                        spend: obj.spend ? parseFloat(obj.spend) : 0,
                        estimated_revenue: obj.estimated_revenue ? parseFloat(obj.estimated_revenue) : 0,
                        fbLeads: obj.fbLeads ? parseInt(obj.fbLeads) : 0,
                        conversions: obj.conversions ? parseInt(obj.conversions) : 0,
                        fbClicks: obj.fbClicks ? parseInt(obj.fbClicks) : 0, //new
                        impressions: obj.impressions ? parseInt(obj.impressions) : 0, // new
                        accountNumber,
                        accountName: userdetails?.adAccounts[revenuePartnerNames[revenuePartner]]?.find(each => each.accountNumber === accountNumber)?.accountName
                    };
                }

                // Sum the fields (spend, estimated_revenue) based on the new grouping
                acc[key].spend += spend;
                acc[key].estimated_revenue += estimated_revenue;
                acc[key].fbLeads += obj.fbLeads !== null && obj.fbLeads !== undefined ? parseInt(obj.fbLeads) : 0;
                acc[key].conversions += obj.conversions !== null && obj.conversions !== undefined ? parseInt(obj.conversions) : 0;
                acc[key].fbClicks += obj.fbClicks ? parseInt(obj.fbClicks) : 0; // new
                acc[key].impressions += obj.impressions ? parseInt(obj.impressions) : 0; // new

                return acc;
            }, {});

            // Convert the grouped data object back to an array and add the profit field
            const domainResult = Object.values(DomainGroupedData).map(item => {
                item.profit = item.estimated_revenue - item.spend; // Calculate profit
                return item;
            });

            return domainResult;
        }


        const domainResult = groupDataByDomainAndAccount(responseData, `${time}Date`);

        const agencyLevelReport = groupDataByBMNameAndAgencyName(responseData, `${time}Date`);

        setDomainWiseData(domainResult);
        setAgencyNameReport(agencyLevelReport);

        console.log(domainResult, "domain Result");

        const sortedData = groupedData.sort((a, b) => {
            // Compare accountNumber first
            if (a.accountNumber < b.accountNumber) return -1;
            if (a.accountNumber > b.accountNumber) return 1;

            // If accountNumber is the same, compare specifiedDate
            if (a.specifiedDate < b.specifiedDate) return -1;
            if (a.specifiedDate > b.specifiedDate) return 1;

            return 0; // Maintain original order if both values are the same
        });
        console.log(sortedData);

        const dates = sortedData.map(d => d.accountNumber.slice(-4));
        const newDates = sortedData.map(d => d.specifiedDate);
        const spend = sortedData.map(d => Math.round((d.spend) * 100) / 100);
        const revenue = sortedData.map(d => Math.round(parseFloat(d.estimated_revenue) * 100) / 100);
        const profit = sortedData.map(d => Math.round((d.estimated_revenue - d.spend) * 100) / 100);
        const rpc = sortedData.map(d => !isNaN((d.estimated_revenue / d.conversions)) && (d.estimated_revenue / d.conversions) !== undefined ? Math.round((d.estimated_revenue / d.conversions) * 100) / 100 : 0);
        const cpl = sortedData.map(d => !isNaN(((d.spend / d.fbLeads) * 100)) && ((d.spend / d.fbLeads) * 100) !== undefined ? Math.round((((d.spend / d.fbLeads) * 100) / 100) * 100) / 100 : 0);
        const margin = sortedData.map(d => d.estimated_revenue !== 0 ? Math.round((((d.estimated_revenue - d.spend) / d.estimated_revenue) * 100) * 100) / 100 : 0);

        const ncpl = sortedData.map(d => !isNaN(d.ncpl) ? Math.round(d.ncpl * 100) / 100 : 0);
        const ctr = sortedData.map(d => !isNaN(d.ctr) ? Math.round(d.ctr * 100) / 100 : 0);
        const cpc = sortedData.map(d => !isNaN(d.cpc) ? Math.round(d.cpc * 100) / 100 : 0);
        const conversions = sortedData.map(d => d.conversions || 0);
        const leads = sortedData.map(d => d.fbLeads || 0);
        // console.log(revenue);

        setChartData({ dates, newDates, spend, revenue, profit, margin, rpc, cpl, ncpl, ctr, cpc, conversions, leads });
        console.log(responseData.length);
        setSkeletonLoading(false);
    }, 1500);;
    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const networksFetch = await axios.post('http://localhost:8000/getAccountNameandStatus/', {
    //                 updatedNetwork: userdetails?.adAccounts // Pass in the body of the POST request
    //             });

    //             if (networksFetch.status === 200) {
    //                 setRendering(false);
    //                 setUsersDataFromFetch(networksFetch.data); // Access data from the Axios response
    //             }
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };

    //     fetchData(); // Call the async function inside useEffect

    // }, [userdetails]);

    useEffect(() => {
        // if(selectedItems.length > 0){
        if (startDate !== '' && endDate !== '') {
            functionCallForResponse(selectedItems);
        }
        // }
    }, [selectedItems, time, startDate, endDate])


    useEffect(() => {
        let selectedCategoryValues = null;

        if (Object.keys(selectedItems).length === 0) {
            console.log('First Select - Default Selected Categories:', [defaultCategory]);
            console.log('Second Select - Default Selected Items:', { [defaultCategory]: transformedData[defaultCategory] });
        }

        // Only process selectedItems if it's populated
        if (Object.keys(selectedItems).length > 0) {
            selectedCategoryValues = Object.entries(selectedItems).reduce((result, [category, values]) => {
                if (values.length > 0) {
                    result[category] = values;
                }
                return result;
            }, {});

            console.log('Second Select - Current Selected Items:', selectedCategoryValues);


            // Ensure functionalCall is not triggering state updates
            //   if (selectedCategoryValues) {
            //     // Make sure functionalCall doesn't trigger updates that cause rerenders
            //     functionalCall([selectedCategoryValues]);
            //   }
        }

    }, [selectedItems, defaultCategory, transformedData]);
    //   useEffect(() => {
    //     console.log(`Second Select - Current Selected Items for ${defaultCategory}:`, selectedItems[defaultCategory]);
    //   }, [selectedItems[defaultCategory]]); 

    // Handle change in the first select (category select)
    const handleFirstSelectChange = (newCategories) => {
        // Automatically select all items for newly added categories
        setSkeletonLoading(true);
        setFirstSelectValues(newCategories);

        setSelectedItems((prevSelected) => {
            const updatedSelectedItems = { ...prevSelected };

            // Remove categories that are deselected
            Object.keys(prevSelected).forEach((category) => {
                if (!newCategories.includes(category)) {
                    delete updatedSelectedItems[category]; // Remove deselected categories
                }
            });

            // For any new category, select all items by default
            newCategories.forEach((category) => {
                if (!prevSelected[category] && transformedData[category]) {
                    updatedSelectedItems[category] = transformedData[category]; // Select all items by default
                }
            });

            return updatedSelectedItems;
        });

        // Check if only 'FB_Tonic' is selected and update the timezone
        if (newCategories.length === 1 && newCategories[0] === 'FB_Tonic') {
            setTime('PDT'); // Change to PDT when FB_Tonic is selected
        } else {
            setTime('UTC'); // Default to UTC otherwise
        }
    };


    // Handle change in the second select (category items select)
    // This runs whenever `selectedItems` changes

    // Example state updating functions from previous example for reference:

    // const debouncedUpdateSelectedItems = useCallback(
    //     debounce((category, checkedValues) => {
    //         setSelectedItems((prevSelected) => ({
    //             ...prevSelected,  // Spread the previous selected items to retain selections for other categories
    //             [category]: checkedValues.map(value => ({
    //                 accountNumber: value  // Store the accountNumber in the selected items array for the category
    //             }))
    //         }));
    //         //   setSkeletonLoading(false); // Optionally stop loading
    //     }, 1000), // Adjust debounce time (1000ms in this example)
    //     []
    // );
    const debouncedUpdateSelectedItems = useCallback(
        debounce((category, checkedValues) => {

            setSelectedItems(prev => {
                const fullList = transformedData[category] || [];

                // 1Find previously selected items that were NOT visible in filtered results
                const previouslySelected = prev[category] || [];

                const hiddenItems = previouslySelected.filter(item =>
                    !filteredDataForCategory[category].some(f =>
                        f.accountNumber.toString() === item.accountNumber.toString()
                    )
                );

                // 2 Build updated selection from checkedValues + hiddenItems
                const updatedSelected = [
                    ...hiddenItems,
                    ...fullList.filter(item =>
                        checkedValues.includes(item.accountNumber.toString())
                    )
                ];

                return {
                    ...prev,
                    [category]: updatedSelected
                };
            });

        }, 200),
        [transformedData]
    );

    const handleGroupChange = (checkedValues, category) => {
        setSkeletonLoading(true);
        // Call the debounced function to update the state
        debouncedUpdateSelectedItems(category, checkedValues);
        setSearchValue('');
    };

    const handleSelectAllChange = (isChecked, category) => {
        if (isChecked) {
            setSearchValue(""); // Reset search value when network is selected
        }
        setSkeletonLoading(true);
        const newSelectedValues = isChecked ? transformedData[category] : [];
        setSelectedItems((prevSelected) => ({
            ...prevSelected,
            [category]: newSelectedValues,
        }));
        // setSkeletonLoading(false); // Optionally stop loading
    };

    const filteredDataForCategory = {};
    firstSelectValues.forEach(category => {
        filteredDataForCategory[category] =
            transformedData[category]?.filter(item =>
            // item.accountNumber?.toString().toLowerCase().includes(searchValue)
            (item.accountNumber?.toString().toLowerCase().includes(searchValue) ||
                item.accountName?.toLowerCase().includes(searchValue))
            ) || [];
    });

    // Render checkboxes for categories dynamically based on the first Select values
    const renderInnerSelects = (theme) => {
        return firstSelectValues.map((category) => {
            const allSelected =
                transformedData[category]?.length === selectedItems[category]?.length;

            // Filter transformedData based on search query
            const filteredData = transformedData[category]?.filter(item =>
            // item.accountNumber?.toString().toLowerCase().includes(searchValue)
            (item.accountNumber?.toString().toLowerCase().includes(searchValue) ||
                item.accountName?.toLowerCase().includes(searchValue))
            ) || [];
            console.log(`Transformed data for category ${category}:`, transformedData[category]);

            return (
                <div key={category}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: theme === 'dark' ? 'white' : 'black',

                        }}
                    >
                        <Divider style={{ color: theme === 'dark' ? 'white' : 'black' }}>
                            <Checkbox
                                checked={allSelected}
                                onChange={(e) => handleSelectAllChange(e.target.checked, category)}
                                style={{ marginRight: '5px' }}
                                className={theme === 'dark' ? 'checkbox-dark' : 'checkbox-light'}
                            />
                            {category}

                        </Divider>
                    </div>

                    <Checkbox.Group
                        options={filteredData
                            .sort((a, b) => {
                                if (a.status === 'Active' && b.status !== 'Active') return -1;
                                if (a.status !== 'Active' && b.status === 'Active') return 1;
                                return 0;
                            })
                            .map((item) => {
                                const accountNumber = item?.accountNumber ? item.accountNumber.toString() : 'Unknown';
                                return {
                                    label: (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '5px 10px',
                                            borderBottom: '1px solid #ddd',
                                        }}>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '5px' }}>
                                                    <span style={{ fontWeight: '600' }}>{accountNumber}</span>
                                                    <span>{item.accountName || ''}</span>

                                                </div>
                                                <div>
                                                    {item.status === 'Active' ? (
                                                        <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} />
                                                    ) : (
                                                        <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                    value: accountNumber,
                                };
                            })}
                        value={selectedItems[category]?.map(item => item.accountNumber?.toString()) || []}
                        onChange={(checkedValues) => handleGroupChange(checkedValues, category)}
                        className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
                    />
                </div>
            );
        });
    };






    // const newNetworks = userdetails?.adAccounts.map((each)=>)

    const networks = Object.keys(userdetails?.adAccounts);
    console.log(networks, "network");

    const options = networks.map(each => ({
        value: each,
        label: each,
    }));

    const disabledDate = (current) => {
        // Disable dates after today
        return current && current > Date.now();
    };

    const spender = (params) => {
        const total = params.values.reduce((acc, value) => acc + parseFloat(value || 0), 0);
        return Math.round(total * 100) / 100; // Round to 2 decimal places
    };

    // const rpc = (params) => {
    //     const total = params.values.reduce((acc, value) => )
    // }

    const currencyFormatter = (params) => {
        return `$${parseFloat(params.value || 0).toFixed(2)}`; // Ensure 2 decimal places in currency format
    };


    const rpcCplFormatter = (params) => {
        const value = params.value;
        // Check for NaN or Infinity and return 0 if encountered, otherwise format to two decimal places
        return isNaN(value) || !isFinite(value) ? '0' : parseFloat(value).toFixed(2);
    };


    const avgRpcCpl = (params) => {
        // For non-grouped rows (individual row data)
        if (params.data !== undefined) {
            console.log(params.data);
            const { conversions, estimated_revenue } = params.data;
            if (estimated_revenue !== 0) {
                const RPC = estimated_revenue / conversions;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return Number(RPC.toFixed(2));
            }
        }

        // For grouped rows (aggregation)
        if (params.node?.aggData !== undefined) {
            console.log(params.node?.aggData);
            const { conversions, estimated_revenue } = params.node.aggData;
            if (estimated_revenue !== 0) {
                const RPC = estimated_revenue / conversions;
                return Number(RPC.toFixed(2));
            }
        }

        return 0;
    };

    const avgNCPL = (params) => {
        // For non-grouped rows (individual row data)
        if (params.data !== undefined) {
            console.log(params.data);
            const { conversions, spend } = params.data;
            if (conversions !== 0) {
                const RPC = spend / conversions;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return Number(RPC.toFixed(2));
            }
        }

        // For grouped rows (aggregation)
        if (params.node?.aggData !== undefined) {
            console.log(params.node?.aggData);
            const { conversions, spend } = params.node.aggData;
            if (conversions !== 0) {
                const RPC = spend / conversions;
                return Number(RPC.toFixed(2));
            }
        }

        return 0;
    };

    const avgCTR = (params) => {
        // For non-grouped rows (individual row data)
        if (params.data !== undefined) {
            console.log(params.data);
            const { fbClicks, impressions } = params.data;
            if (impressions !== 0) {
                const RPC = (fbClicks / impressions) * 100;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return Number(RPC.toFixed(2));
            }
        }

        // For grouped rows (aggregation)
        if (params.node?.aggData !== undefined) {
            console.log(params.node?.aggData);
            const { fbClicks, impressions } = params.node.aggData;
            if (impressions !== 0) {
                const RPC = (fbClicks / impressions) * 100;
                return Number(RPC.toFixed(2));
            }
        }

        return 0;
    };

    const avgCPC = (params) => {
        // For non-grouped rows (individual row data)
        if (params.data !== undefined) {
            console.log(params.data);
            const { fbClicks, spend } = params.data;
            if (fbClicks !== 0) {
                const RPC = spend / fbClicks;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return Number(RPC.toFixed(2));
            }
        }

        // For grouped rows (aggregation)
        if (params.node?.aggData !== undefined) {
            console.log(params.node?.aggData);
            const { fbClicks, spend } = params.node.aggData;
            if (fbClicks !== 0) {
                const RPC = spend / fbClicks;
                return Number(RPC.toFixed(2));
            }
        }

        return 0;
    };

    const avgCpc = (params) => {
        // For non-grouped rows (individual row data)
        if (params.data !== undefined) {
            // console.log(params.data);
            const { spend, fbLeads } = params.data;
            if (spend !== 0) {
                const RPC = spend / fbLeads;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return Number(RPC.toFixed(2));
            }
        }

        // For grouped rows (aggregation)
        if (params.node?.aggData !== undefined) {
            // console.log(params.node?.aggData);
            const { spend, fbLeads } = params.node.aggData;
            if (spend !== 0) {
                const RPC = spend / fbLeads;
                return Number(RPC.toFixed(2));
            }
        }

        return 0;
    };

    const avgCtr = (params) => {
        console.log(params);
        // For non-grouped rows (individual row data)
        if (params.data !== undefined) {
            // console.log(params.data);
            const { fbClicks, impressions } = params.data;
            if (impressions !== 0) {
                const RPC = fbClicks / impressions;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return Number(RPC.toFixed(2));
            }
        }

        // For grouped rows (aggregation)
        if (params.node?.aggData !== undefined) {
            // console.log(params.node?.aggData);
            const { fbClicks, impressions } = params.node.aggData;
            if (impressions !== 0) {
                const RPC = fbClicks / impressions;
                return Number(RPC.toFixed(2));
            }
        }

        return 0;
    };

    const avgCpl = (params) => {
        // For non-grouped rows (individual row data)
        if (params.data !== undefined) {
            // console.log(params.data);
            const { spend, fbLeads } = params.data;
            if (spend !== 0) {
                const RPC = spend / fbLeads;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return Number(RPC.toFixed(2));
            }
        }

        // For grouped rows (aggregation)
        if (params.node?.aggData !== undefined) {
            // console.log(params.node?.aggData);
            const { spend, fbLeads } = params.node.aggData;
            if (spend !== 0) {
                const RPC = spend / fbLeads;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return Number(RPC.toFixed(2));
            }
        }

        return 0;
    };

    const autoGroupColumnDefProfit = {
        headerName: 'Account number',
        minWidth: 300,
        sortable: true,
        filter: "agTextColumnFilter",
        filterValueGetter: (params) => {
            if (params.node.group) {
                // Use the group key (campaign name)
                return params.node.key;
            }
            // For leaf rows, use the campaign_name or any field
            return params.data?.accountNumber || '';
        },
        cellRendererParams: {
            suppressCount: false,
            innerRenderer: (params) => {
                if (params.node.footer) {
                    return 'Total';
                }

                const firstColumnValue = params.node.key; // campaign name
                const campaignName = params.node.key;
                const groupedData = params.node.allLeafChildren
                    ? params.node.allLeafChildren.map(childNode => childNode.data)
                    : [];

                // Ensure groupedData has at least one element
                if (groupedData.length === 0) {
                    return '';
                }

                // Safeguard against undefined or missing properties
                const firstGroupedItem = groupedData[0] || {};
                const revenuePartnerNameToPassToReports = firstGroupedItem.revenuePartner
                    ? revenuePartnerNames[firstGroupedItem.revenuePartner]
                    : 'Unknown Partner';

                const accountNumberToPassToReports = firstGroupedItem.accountNumber || 'Unknown Account';

                const valueWithCount = `${firstColumnValue}`;
                return (
                    <div style={{ width: '100%', marginRight: '10px' }}>
                        <span
                            onClick={() => {
                                const data = {
                                    network: revenuePartnerNameToPassToReports,
                                    accountNumber: accountNumberToPassToReports,
                                    time: time,
                                    startDate: startDate,
                                    endDate: endDate,
                                    accountName: userdetails?.adAccounts[revenuePartnerNameToPassToReports]?.find(each => each.accountNumber === accountNumberToPassToReports)?.accountName
                                };
                                console.log(userdetails?.adAccounts[revenuePartnerNameToPassToReports]?.find(each => each.accountNumber === accountNumberToPassToReports)?.accountName);
                                // Convert data to query string
                                const queryString = new URLSearchParams(data).toString();
                                const url = `/Reports?${queryString}`;

                                // Open the URL in a new tab
                                window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                        >
                            {valueWithCount}
                        </span>
                    </div>
                );
            }
        },
        cellRendererFramework: (params) => {
            if (params.node.group) {
                // Keep the original logic for grouped rows
                return params.valueFormatted || params.value || params.node.key;
            }

            // For ungrouped rows, handle navigation directly
            const accountNumber = params.data?.accountNumber || 'Unknown Account';
            const revenuePartner = params.data?.revenuePartner || 'Unknown Partner';

            const data = {
                network: revenuePartner,
                accountNumber,
                time,
                startDate,
                endDate,
            };

            const queryString = new URLSearchParams(data).toString();
            const url = `/Reports?${queryString}`;

            return (
                <span
                    style={{ cursor: 'pointer', color: '#1890ff' }}
                    onClick={() => {
                        window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                >
                    {accountNumber}
                </span>
            );
        }
    };

    const autoGroupColumnDefLoss = {
        headerName: 'Account number',
        minWidth: 200,
        sortable: true,
        filter: "agTextColumnFilter",
        filterValueGetter: (params) => {
            if (params.node.group) {
                // Use the group key (campaign name)
                return params.node.key;
            }
            // For leaf rows, use the campaign_name or any field
            return params.data?.accountNumber || '';
        },
        //  cellStyle: { whiteSpace: "normal", lineHeight: "1.5" }, // Enables text wrapping
        // autoHeight: true,
        cellRendererParams: {
            suppressCount: false,
            innerRenderer: (params) => {
                if (params.node.footer) {
                    return 'Total';
                }

                const firstColumnValue = params.node.key;  // campaign name
                const campaignName = params.node.key;
                const groupedData = params.node.allLeafChildren
                    ? params.node.allLeafChildren.map(childNode => childNode.data)
                    : [];

                // Ensure groupedData has at least one element
                if (groupedData.length === 0) {
                    return '';
                }

                // Safeguard against undefined or missing properties
                const firstGroupedItem = groupedData[0] || {};
                const revenuePartnerNameToPassToReports = firstGroupedItem.revenuePartner
                    ? revenuePartnerNames[firstGroupedItem.revenuePartner]
                    : 'Unknown Partner';

                const accountNumberToPassToReports = firstGroupedItem.accountNumber || 'Unknown Account';

                const valueWithCount = `${firstColumnValue}`;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

                        <span
                            onClick={() => {
                                const data = {
                                    network: revenuePartnerNameToPassToReports,
                                    accountNumber: accountNumberToPassToReports,
                                    time: time,
                                    startDate: startDate,
                                    endDate: endDate,
                                };

                                // Convert data to query string
                                const queryString = new URLSearchParams(data).toString();
                                const url = `/Reports?${queryString}`;

                                // Open the URL in a new tab
                                window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                        >
                            {valueWithCount}
                        </span>

                    </div>
                );
            }
        }
    };

    const autoGroupColumnDefCampaigns = {
        headerName: 'Campaign name',
        minWidth: 335,
        sortable: true,
        cellStyle: { whiteSpace: "normal", lineHeight: "1.5" }, // Enables text wrapping
        autoHeight: true,
        filter: "agTextColumnFilter",
        filterValueGetter: (params) => {
            if (params.node.group) {
                // Use the group key (campaign name)
                return params.node.key;
            }
            // For leaf rows, use the campaign_name or any field
            return params.data?.campaign_name || '';
        },
        cellRendererParams: {
            suppressCount: false,
            innerRenderer: (params) => {
                if (params.node.footer) {
                    return 'Total';
                }


                const campaignName = params.node.key;
                const groupedData = params.node.allLeafChildren
                    ? params.node.allLeafChildren.map(childNode => childNode.data)
                    : [];

                // Ensure groupedData has at least one element
                if (groupedData.length === 0) {
                    return '';
                }

                // Safeguard against undefined or missing properties
                const firstGroupedItem = groupedData[0] || {};
                const firstColumnValue = groupedData[0]?.campaign_name || params.node.key; // campaign name
                const revenuePartnerNameToPassToReports = firstGroupedItem.revenuePartner
                    ? revenuePartnerNames[firstGroupedItem.revenuePartner]
                    : 'Unknown Partner';
                const collectionName = newtworkCollections[revenuePartnerNameToPassToReports];

                const accountNumberToPassToReports = firstGroupedItem.accountNumber || 'Unknown Account';
                const campaignNameToPass = firstGroupedItem.campaign_name || 'Unknown Account';

                const valueWithCount = `${firstColumnValue}`;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span
                            onClick={() => {
                                // const data = {
                                //     network: revenuePartnerNameToPassToReports,
                                //     accountNumber: accountNumberToPassToReports,
                                //     time: time,
                                //     startDate: startDate,
                                //     endDate: endDate,
                                // };

                                // // Convert data to query string
                                // const queryString = new URLSearchParams(data).toString();
                                const url = `/DailyAndCampaignHistory/CampaignHistory/${campaignName}-${accountNumberToPassToReports}-${time}-${collectionName}`;
                                console.log(url);

                                // Open the URL in a new tab
                                window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                        >
                            <Tooltip
                                overlayInnerStyle={{
                                    backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    border: '1px solid #ccc',
                                    borderRadius: 6,
                                }}
                                title={(() => {
                                    const [text, setText] = React.useState("Click to Copy");
                                    const handleCopy = (e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(valueWithCount);
                                        setText("Copied");
                                        setTimeout(() => setText("Copy"), 1000);
                                    };
                                    return (
                                        <span style={{ cursor: "pointer" }} onClick={handleCopy}>
                                            {text}
                                        </span>
                                    );
                                })()}
                            >
                                {valueWithCount}
                            </Tooltip>

                        </span>
                    </div>
                );
            }
        },
        cellRendererFramework: (params) => {
            if (params.node.group) {
                // Keep the original logic for grouped rows
                return params.valueFormatted || params.value || params.node.key;
            }

            // For ungrouped rows, handle navigation directly
            const accountNumber = params.data?.accountNumber || 'Unknown Account';
            const revenuePartner = params.data?.revenuePartner || 'Unknown Partner';

            const data = {
                network: revenuePartner,
                accountNumber,
                time,
                startDate,
                endDate,
            };

            const queryString = new URLSearchParams(data).toString();
            const url = `/Reports?${queryString}`;

            return (
                <span
                    style={{ cursor: 'pointer', color: '#1890ff' }}
                    onClick={() => {
                        window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                >
                    {accountNumber}
                </span>
            );
        }
    };

    const onFilterChanged = (params) => {
        // recalculates aggregates from the current filtered rows
        params.api.refreshClientSideRowModel('aggregate');
        // optionally refresh cells so footers/rendering update
        params.api.refreshCells({ force: true });
    };

    // const [columnDefs] = useState([
    //     {
    //         headerName: 'Project name',
    //         field: "revenuePartner",
    //         resizable: true,
    //         sortable: true,
    //         width: 100,
    //         hide: true,
    //         rowGroup: true,
    //         enableRowGroup: true,
    //         minWidth: 108,
    //     }, // Group by Network
    //     {
    //         field: "holder",
    //         resizable: true,
    //         sortable: true,
    //         width: 100,
    //         hide: true, // Hide column as it's grouped
    //         rowGroup: true,
    //         enableRowGroup: true,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agTextColumnFilter",
    //     }, // Group by Holder
    //     {
    //         field: 'accountNumber',
    //         colId: 'accountNumber',
    //         headerName: 'Account number',
    //         resizable: true,
    //         width: 150,
    //         sortable: true,
    //         hide: true, // Hide column as it's grouped
    //         rowGroup: true,
    //         enableRowGroup: true,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agTextColumnFilter",
    //     },
    //     {
    //         field: 'specifiedDate', headerName: 'Date',
    //         minWidth: 115,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: 'agDateColumnFilter',
    //         valueGetter: params => {
    //             const dateStr = params.data?.specifiedDate;
    //             if (!dateStr) return null;
    //             const [y, m, d] = dateStr.split('-').map(Number);
    //             return new Date(y, m - 1, d);
    //         },
    //         valueFormatter: params => {
    //             const d = params.value;
    //             return d ? d.toLocaleDateString() : '';
    //         }
    //     },
    //     {
    //         headerName: 'User',
    //         field: "mediaBuyerName",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         minWidth: 108,
    //         filter: "agTextColumnFilter",
    //     }, // Display Media Buyer name
    //     {
    //         field: "spend",
    //         aggFunc: spender,
    //         // valueFormatter: currencyFormatter,
    //         valueFormatter: params => {
    //             console.log('display value type:', typeof params.value, params.value);
    //             return `$${parseFloat(params.value || 0).toFixed(2)}`;
    //         },
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         minWidth: 108,
    //         filter: "agNumberColumnFilter",
    //     }, // Summing Spend column
    //     {
    //         headerName: 'Revenue',
    //         field: "estimated_revenue",
    //         aggFunc: spender,
    //         valueFormatter: currencyFormatter,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         minWidth: 108,
    //         filter: "agNumberColumnFilter",
    //     }, // Summing Revenue column
    //     {
    //         field: "profit",
    //         aggFunc: spender,
    //         cellClassRules: {
    //             'font-red': p => p.value < 0,
    //             'font-green': params => params.value > 0,
    //         },
    //         valueFormatter: currencyFormatter,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         minWidth: 108,
    //         filter: "agNumberColumnFilter",
    //     }, // Custom aggregation for Profit
    //     {
    //         field: 'rpc',
    //         headerName: 'RPC',
    //         valueGetter: avgRpcCpl,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         minWidth: 95,
    //         filter: "agNumberColumnFilter",
    //         // valueFormatter: rpcCplFormatter,
    //     },
    //     {
    //         field: 'cpl',
    //         headerName: 'CPL',
    //         valueGetter: avgCpl,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         minWidth: 95,
    //         filter: "agNumberColumnFilter",
    //         // valueFormatter: rpcCplFormatter,
    //     },
    //     {
    //         field: 'conversions',
    //         headerName: 'Conv',
    //         aggFunc: spender,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         minWidth: 108,
    //         filter: "agNumberColumnFilter",
    //         // valueFormatter: rpcCplFormatter,
    //     },
    //     {
    //         field: 'fbLeads',
    //         headerName: 'Fb leads',
    //         aggFunc: spender,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         minWidth: 108,
    //         filter: "agNumberColumnFilter",
    //         // valueFormatter: rpcCplFormatter,
    //     },

    // ]);
    const columnDefs = [
        {
            headerName: 'Project name',
            field: "revenuePartner",
            resizable: true,
            sortable: true,
            width: 100,
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
            minWidth: 108,
        }, // Group by Network
        {
            field: "holder",
            resizable: true,
            sortable: true,
            width: 100,
            hide: true, // Hide column as it's grouped
            rowGroup: true,
            enableRowGroup: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agTextColumnFilter",
        }, // Group by Holder
        {
            field: 'accountNumber',
            colId: 'accountNumber',
            headerName: 'Account number',
            resizable: true,
            width: 150,
            sortable: true,
            hide: true, // Hide column as it's grouped
            rowGroup: true,
            enableRowGroup: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agTextColumnFilter",
        },
        {
            field: 'specifiedDate', headerName: 'Date',
            minWidth: 115,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: 'agDateColumnFilter',
            valueGetter: params => {
                const dateStr = params.data?.specifiedDate;
                if (!dateStr) return null;
                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },
            valueFormatter: params => {
                const d = params.value;
                return d ? d.toLocaleDateString() : '';
            }
        },
        {
            headerName: 'User',
            field: "mediaBuyerName",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agTextColumnFilter",
        }, // Display Media Buyer name
        {
            field: "spend",
            aggFunc: spender,
            // valueFormatter: currencyFormatter,
            valueFormatter: params => {
                console.log('display value type:', typeof params.value, params.value);
                return `$${parseFloat(params.value || 0).toFixed(2)}`;
            },
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
        }, // Summing Spend column
        {
            headerName: 'Revenue',
            field: "estimated_revenue",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
        }, // Summing Revenue column
        {
            field: "profit",
            aggFunc: spender,
            cellClassRules: {
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0,
            },
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
        }, // Custom aggregation for Profit
        {
            field: 'rpc',
            headerName: 'RPC',
            valueGetter: avgRpcCpl,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'cpl',
            headerName: 'CPL',
            valueGetter: avgCpl,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'ncpl',
            headerName: 'NCPL',
            valueGetter: avgNCPL,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'cpc',
            headerName: 'CPC',
            valueGetter: avgCPC,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'ctr',
            headerName: 'CTR',
            valueGetter: avgCTR,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },

        // {
        //     field: 'ctr',
        //     headerName: 'CTR',
        //     valueGetter: avgCtr,
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        //     minWidth: 95,
        //     filter: "agNumberColumnFilter",
        //     // valueFormatter: rpcCplFormatter,
        // },
        {
            field: 'conversions',
            headerName: 'Conv',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'fbLeads',
            headerName: 'Fb leads',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'fbClicks',
            headerName: 'Fb clicks',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 105,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'impressions',
            headerName: 'Imp',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },

    ]
    const items = [
        { key: '1', label: 'Profit', content: 'Content for Profit Accounts' },
        { key: '2', label: 'Loss', content: 'Content for Loss Accounts' },
        { key: '3', label: 'Top 5 spend', content: 'Content for Top 5 Spend Accounts' },
        { key: '4', label: 'Top 5 revenue', content: 'Content for Top 5 Revenue Accounts' },
        { key: '5', label: 'Top 5 profit', content: 'Content for Top 5 Profit Accounts' },
    ];

    const items1 = [
        { key: '1', label: 'Spend', content: 'Content for Top 5 Spend Campaigns' },
        { key: '2', label: 'Revenue', content: 'Content for Top 5 Revenue Campaigns' },
        { key: '3', label: 'Profit', content: 'Content for Top 5 Profit Campaigns' },
        { key: '4', label: 'All profit', content: 'Content for Top 5 Revenue Campaigns' },
        { key: '5', label: 'All loss', content: 'Content for Top 5 Profit Campaigns' },
    ];
    const items2 = [
        { key: '1', label: 'Date', content: 'Content for Top 5 Spend Campaigns' },
        { key: '2', label: 'Accounts', content: 'Content for Top 5 Revenue Campaigns' },
    ];

    const items3 = [
        { key: '1', label: 'Domain', content: 'Content for Top 5 Spend Campaigns' },
        { key: '2', label: 'Agency', content: 'Content for Top 5 Revenue Campaigns' },
    ];

    const handleSlideChange = (from, to) => {
        // console.log(to, "to");
        setActiveTab((parseInt(to) + 1).toString());
        // console.log((parseInt(to)+1).toString());
    };

    const handleCarouselChange = (index) => {
        setActiveTab(index);
        // console.log(index);
        // console.log(parseInt(index)-1);
        // carouselRef.current.goTo(parseInt(index)-1)

    };

    const handleSlideChange1 = (from, to) => {
        // console.log(to, "to");
        setActiveTab1((parseInt(to) + 1).toString());
        // console.log((parseInt(to)+1).toString());
    };
    const handleSlideChange2 = (from, to) => {
        // console.log(to, "to");
        setActiveTab2((parseInt(to) + 1).toString());
        // console.log((parseInt(to)+1).toString());
    };

    const handleSlideChange3 = (from, to) => {
        // console.log(to, "to");
        setActiveTab3((parseInt(to) + 1).toString());
        // console.log((parseInt(to)+1).toString());
    };

    const handleCarouselChange1 = (index) => {
        setActiveTab1(index);
        // console.log(index);
        // console.log(parseInt(index)-1);
        // carouselRef1.current.goTo(parseInt(index)-1)

    };

    const handleCarouselChange2 = (index) => {
        setActiveTab2(index);
        // console.log(index);
        // console.log(parseInt(index)-1);
        // carouselRef2.current.goTo(parseInt(index)-1)

    };

    const handleCarouselChange3 = (index) => {
        setActiveTab3(index);
        // console.log(index);
        // console.log(parseInt(index)-1);
        // carouselRef3.current.goTo(parseInt(index)-1)

    };

    const handleTabChange = (key) => {
        setActiveTab3(key)
    }

    const handleTabChange1 = (key) => {
        setActiveTab3(key)
    }

    const handleTabChange2 = (key) => {
        setActiveTab2(key)
    }

    const handleTabChange3 = (key) => {
        setActiveTab3(key)
    }

    const renderCarouselNav1 = () => (
        <StickyBox offsetTop={64} offsetBottom={20} style={{ zIndex: 1, padding: '0px', margin: '0px', paddingLeft: '0px' }}>
            <Tabs
                activeKey={activeTab1}
                onChange={(key) => handleCarouselChange1(key)}
                items={items1.map((item) => ({
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

    const renderCarouselNav = () => (
        <StickyBox offsetTop={64} offsetBottom={20} style={{ zIndex: 1, padding: '0px', margin: '0px', paddingLeft: '0px' }}>
            <Tabs
                activeKey={activeTab}
                onChange={(key) => handleCarouselChange(key)}
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

    const RenderCarouselNav2 = React.memo(() => (
        <StickyBox offsetTop={64} offsetBottom={20} style={{
            zIndex: 1, padding: '0px', margin: '0px', width: '100%',
            borderRadius: 12,
            backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
            padding: 10,
            height: 'auto', // ✅ Key: no fixed height
            boxShadow:
                theme === 'dark'
                    ? '0 1px 3px rgba(0,0,0,0.6)'
                    : '0 1px 6px rgba(0,0,0,0.08)',
        }}>
            <Tabs
                activeKey={activeTab2}
                onChange={handleCarouselChange2}
                items={items2.map((item) => ({
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
    ));

    const RenderCarouselNav3 = React.memo(() => (
        <StickyBox offsetTop={64} offsetBottom={20} style={{ zIndex: 1, padding: '0px', margin: '0px' }}>
            <Tabs
                activeKey={activeTab3}
                onChange={handleCarouselChange3}
                items={items3.map((item) => ({
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
    ));

    // const [columnDefs1] = useState([
    //     {
    //         headerName: "Account number",
    //         field: "accountNumber",
    //         resizable: true,
    //         sortable: true,
    //         hide: true, // Hide column as it's grouped
    //         rowGroup: true,
    //         enableRowGroup: true,


    //     }, // Group by Network
    //     {
    //         field: 'specifiedDate', headerName: 'Date',
    //         suppressMenu: true,
    //         minWidth: 108,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: 'agDateColumnFilter',
    //         valueGetter: params => {
    //             const dateStr = params.data?.specifiedDate;
    //             if (!dateStr) return null;
    //             const [y, m, d] = dateStr.split('-').map(Number);
    //             return new Date(y, m - 1, d);
    //         },
    //         valueFormatter: params => {
    //             const d = params.value;
    //             return d ? d.toLocaleDateString() : '';
    //         }
    //     },
    //     {
    //         field: "spend",
    //         aggFunc: spender,
    //         valueFormatter: currencyFormatter,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         minWidth: 108,
    //         filter: "agNumberColumnFilter",
    //     }, // Summing Spend column
    //     {
    //         headerName: 'Revenue',
    //         field: "estimated_revenue",
    //         aggFunc: spender,
    //         valueFormatter: currencyFormatter,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         minWidth: 108,
    //         filter: "agNumberColumnFilter",
    //     }, // Summing Revenue column
    //     {
    //         field: "profit",
    //         aggFunc: spender,
    //         sort: 'desc',
    //         cellClassRules: {
    //             'font-red': p => p.value < 0,
    //             'font-green': params => params.value > 0,
    //         },
    //         valueFormatter: currencyFormatter,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         minWidth: 108,
    //         filter: "agNumberColumnFilter",
    //     },
    //     {
    //         headerName: 'Project name',
    //         field: "revenuePartner",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         minWidth: 108,
    //         filter: "agTextColumnFilter",
    //     }, // Group by Holder
    //     {
    //         field: "holder",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         minWidth: 108,
    //         filter: "agTextColumnFilter",
    //     },
    //     {
    //         field: "mediaBuyerName", headerName: 'User',
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         minWidth: 108,
    //         filter: "agTextColumnFilter",
    //     },
    // ]);
    const columnDefs1 = [
        {
            headerName: "Account number",
            field: "accountNumber",
            resizable: true,
            sortable: true,
            hide: true, // Hide column as it's grouped
            rowGroup: true,
            enableRowGroup: true,


        }, // Group by Network
        {
            field: 'specifiedDate', headerName: 'Date',
            suppressMenu: true,
            minWidth: 108,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: 'agDateColumnFilter',
            valueGetter: params => {
                const dateStr = params.data?.specifiedDate;
                if (!dateStr) return null;
                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },
            valueFormatter: params => {
                const d = params.value;
                return d ? d.toLocaleDateString() : '';
            }
        },
        {
            field: "spend",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
        }, // Summing Spend column
        {
            headerName: 'Revenue',
            field: "estimated_revenue",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
        }, // Summing Revenue column
        {
            field: "profit",
            aggFunc: spender,
            sort: 'desc',
            cellClassRules: {
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0,
            },
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
        },
        {
            field: 'rpc',
            headerName: 'RPC',
            valueGetter: avgRpcCpl,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'cpl',
            headerName: 'CPL',
            valueGetter: avgCpl,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'ncpl',
            headerName: 'NCPL',
            valueGetter: avgNCPL,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'cpc',
            headerName: 'CPC',
            valueGetter: avgCPC,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'ctr',
            headerName: 'CTR',
            valueGetter: avgCTR,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },

        // {
        //     field: 'ctr',
        //     headerName: 'CTR',
        //     valueGetter: avgCtr,
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        //     minWidth: 95,
        //     filter: "agNumberColumnFilter",
        //     // valueFormatter: rpcCplFormatter,
        // },
        {
            field: 'conversions',
            headerName: 'Conv',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'fbLeads',
            headerName: 'Fb leads',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'fbClicks',
            headerName: 'Fb clicks',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'impressions',
            headerName: 'Imp',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            headerName: 'Project name',
            field: "revenuePartner",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agTextColumnFilter",
        }, // Group by Holder
        {
            field: "holder",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agTextColumnFilter",
        },
        {
            field: "mediaBuyerName", headerName: 'User',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agTextColumnFilter",
        },
    ]

    // const [columnDefs2] = useState([
    //     {
    //         field: 'campaign_name', headerName: 'Campaign name', minWidth: 430, suppressAutoSize: true,
    //         resizable: true,
    //         sortable: true,
    //         hide: true, // Hide column as it's grouped
    //         rowGroup: true,
    //         enableRowGroup: true,
    //         filter: "agTextColumnFilter",
    //     },
    //     {
    //         field: "accountNumber", minWidth: 170, headerName: "Account number",
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agTextColumnFilter",

    //     }, // Group by Network
    //     {
    //         field: 'Date',
    //         minWidth: 112,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: 'agDateColumnFilter',
    //         valueGetter: params => {
    //             const dateStr = params.data?.Date;
    //             if (!dateStr) return null;
    //             const [y, m, d] = dateStr.split('-').map(Number);
    //             return new Date(y, m - 1, d);
    //         },
    //         valueFormatter: params => {
    //             const d = params.value;
    //             return d ? d.toLocaleDateString() : '';
    //         }
    //     },
    //     {
    //         field: "spend",
    //         aggFunc: spender,
    //         valueFormatter: currencyFormatter,
    //         minWidth: 108,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agNumberColumnFilter",
    //     }, // Summing Spend column
    //     {
    //         headerName: 'Revenue',
    //         field: "estimated_revenue",
    //         aggFunc: spender,
    //         valueFormatter: currencyFormatter,
    //         minWidth: 108,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agNumberColumnFilter",
    //     }, // Summing Revenue column
    //     {
    //         field: "profit",
    //         aggFunc: spender,
    //         cellClassRules: {
    //             'font-red': p => p.value < 0,
    //             'font-green': params => params.value > 0,
    //         },
    //         valueFormatter: currencyFormatter,
    //         minWidth: 108,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agNumberColumnFilter",
    //     },
    //     {
    //         headerName: 'Project name',
    //         field: "revenuePartner",
    //         minWidth: 150,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agTextColumnFilter",
    //     }, // Group by Holder
    //     {
    //         field: "holder",
    //         minWidth: 125,// Group by MediaBuyerName,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agTextColumnFilter",
    //     },
    //     {
    //         field: "mediaBuyerName", headerName: 'User',
    //         minWidth: 125,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agTextColumnFilter",
    //     },
    // ]);
    const columnDefs2 = [
        // {
        //     field: 'campaign_name', headerName: 'Campaign name', minWidth: 430, suppressAutoSize: true,
        //     resizable: true,
        //     sortable: true,
        //     // hide: true, // Hide column as it's grouped
        //     // rowGroup: true,
        //     // enableRowGroup: true,
        //     filter: "agTextColumnFilter",
        // },
        {
            // headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter", suppressMenu: true, menuTabs: [], headerClass: 'hide-menu' 
            headerName: 'Campaign name',
            field: 'campaign_id',
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
        {
            field: "accountNumber", minWidth: 170, headerName: "Account number",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agTextColumnFilter",

        }, // Group by Network
        {
            field: 'Date',
            minWidth: 112,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: 'agDateColumnFilter',
            valueGetter: params => {
                const dateStr = params.data?.Date;
                if (!dateStr) return null;
                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },
            valueFormatter: params => {
                const d = params.value;
                return d ? d.toLocaleDateString() : '';
            }
        },
        {
            field: "spend",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            minWidth: 108,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agNumberColumnFilter",
        }, // Summing Spend column
        {
            headerName: 'Revenue',
            field: "estimated_revenue",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            minWidth: 108,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agNumberColumnFilter",
        }, // Summing Revenue column
        {
            field: "profit",
            aggFunc: spender,
            cellClassRules: {
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0,
            },
            valueFormatter: currencyFormatter,
            minWidth: 108,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agNumberColumnFilter",
        },
        {
            field: 'rpc',
            headerName: 'RPC',
            valueGetter: avgRpcCpl,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'cpl',
            headerName: 'CPL',
            valueGetter: avgCpl,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'ncpl',
            headerName: 'NCPL',
            valueGetter: avgNCPL,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'cpc',
            headerName: 'CPC',
            valueGetter: avgCPC,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'ctr',
            headerName: 'CTR',
            valueGetter: avgCTR,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },

        // {
        //     field: 'ctr',
        //     headerName: 'CTR',
        //     valueGetter: avgCtr,
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        //     minWidth: 95,
        //     filter: "agNumberColumnFilter",
        //     // valueFormatter: rpcCplFormatter,
        // },
        {
            field: 'conversions',
            headerName: 'Conv',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'fbLeads',
            headerName: 'Fb leads',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'fbClicks',
            headerName: 'Fb clicks',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'impressions',
            headerName: 'Imp',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            headerName: 'Project name',
            field: "revenuePartner",
            minWidth: 150,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agTextColumnFilter",
        }, // Group by Holder
        {
            field: "holder",
            minWidth: 125,// Group by MediaBuyerName,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agTextColumnFilter",
        },
        {
            field: "mediaBuyerName", headerName: 'User',
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agTextColumnFilter",
        },
    ]
    // const [columnDefs3] = useState([
    //     {
    //         field: 'domain', minWidth: 200, suppressAutoSize: true,
    //         resizable: true,
    //         sortable: true,
    //         hide: true, // Hide column as it's grouped
    //         rowGroup: true,
    //         enableRowGroup: true,
    //         filter: "agTextColumnFilter",
    //     },
    //     {
    //         field: "accountNumber", minWidth: 180, headerName: 'Account number',
    //         resizable: true,
    //         sortable: true,
    //         hide: true, // Hide column as it's grouped
    //         rowGroup: true,
    //         enableRowGroup: true,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agTextColumnFilter",

    //     }, // Group by Network
    //     {
    //         field: 'specifiedDate', headerName: "Date",
    //         minWidth: 125,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: 'agDateColumnFilter',
    //         valueGetter: params => {
    //             const dateStr = params.data?.specifiedDate;
    //             if (!dateStr) return null;
    //             const [y, m, d] = dateStr.split('-').map(Number);
    //             return new Date(y, m - 1, d);
    //         },
    //         valueFormatter: params => {
    //             const d = params.value;
    //             return d ? d.toLocaleDateString() : '';
    //         }
    //     },
    //     {
    //         field: "spend",
    //         aggFunc: spender,
    //         valueFormatter: currencyFormatter,
    //         minWidth: 125,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agNumberColumnFilter",
    //     }, // Summing Spend column
    //     {
    //         headerName: 'Revenue',
    //         field: "estimated_revenue",
    //         aggFunc: spender,
    //         valueFormatter: currencyFormatter,
    //         minWidth: 125,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agNumberColumnFilter",
    //     }, // Summing Revenue column
    //     {
    //         field: "profit",
    //         aggFunc: spender,
    //         cellClassRules: {
    //             'font-red': p => p.value < 0,
    //             'font-green': params => params.value > 0,
    //         },
    //         valueFormatter: currencyFormatter,
    //         minWidth: 125,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agNumberColumnFilter",
    //     },
    //     {
    //         headerName: 'Project name',
    //         field: "revenuePartner",
    //         minWidth: 180,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agTextColumnFilter",
    //     }, // Group by Holder
    //     {
    //         field: "Holder",
    //         minWidth: 125,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agTextColumnFilter",
    //     },
    //     {
    //         field: "MediaBuyerName", headerName: 'User',
    //         minWidth: 125,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agTextColumnFilter",
    //     },
    // ]);
    const columnDefs3 = [
        {
            field: 'domain', minWidth: 200, suppressAutoSize: true,
            resizable: true,
            sortable: true,
            hide: true, // Hide column as it's grouped
            rowGroup: true,
            enableRowGroup: true,
            filter: "agTextColumnFilter",
        },
        {
            field: "accountNumber", minWidth: 180, headerName: 'Account number',
            resizable: true,
            sortable: true,
            hide: true, // Hide column as it's grouped
            rowGroup: true,
            enableRowGroup: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agTextColumnFilter",

        }, // Group by Network
        {
            field: 'specifiedDate', headerName: "Date",
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: 'agDateColumnFilter',
            valueGetter: params => {
                const dateStr = params.data?.specifiedDate;
                if (!dateStr) return null;
                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },
            valueFormatter: params => {
                const d = params.value;
                return d ? d.toLocaleDateString() : '';
            }
        },
        {
            field: "spend",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agNumberColumnFilter",
        }, // Summing Spend column
        {
            headerName: 'Revenue',
            field: "estimated_revenue",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agNumberColumnFilter",
        }, // Summing Revenue column
        {
            field: "profit",
            aggFunc: spender,
            cellClassRules: {
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0,
            },
            valueFormatter: currencyFormatter,
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agNumberColumnFilter",
        },
        {
            field: 'rpc',
            headerName: 'RPC',
            valueGetter: avgRpcCpl,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'cpl',
            headerName: 'CPL',
            valueGetter: avgCpl,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'ncpl',
            headerName: 'NCPL',
            valueGetter: avgNCPL,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'cpc',
            headerName: 'CPC',
            valueGetter: avgCPC,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'ctr',
            headerName: 'CTR',
            valueGetter: avgCTR,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },

        // {
        //     field: 'ctr',
        //     headerName: 'CTR',
        //     valueGetter: avgCtr,
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        //     minWidth: 95,
        //     filter: "agNumberColumnFilter",
        //     // valueFormatter: rpcCplFormatter,
        // },
        {
            field: 'conversions',
            headerName: 'Conv',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'fbLeads',
            headerName: 'Fb leads',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'fbClicks',
            headerName: 'Fb clicks',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'impressions',
            headerName: 'Imp',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            headerName: 'Project name',
            field: "revenuePartner",
            minWidth: 180,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agTextColumnFilter",
        }, // Group by Holder
        {
            field: "Holder",
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agTextColumnFilter",
        },
        {
            field: "MediaBuyerName", headerName: 'User',
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agTextColumnFilter",
        },
    ]
    const columnDefs4 = [
        {
            field: 'BMName', minWidth: 200, suppressAutoSize: true, headerName: 'BM name',
            resizable: true,
            sortable: true,
            hide: true, // Hide column as it's grouped
            rowGroup: true,
            enableRowGroup: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agTextColumnFilter",
        },
        {
            field: "AgencyName", minWidth: 180, headerName: 'Agency name',
            resizable: true,
            sortable: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agTextColumnFilter",
            // hide: true, // Hide column as it's grouped
            // rowGroup: true,
            // enableRowGroup: true,

        }, // Group by Network
        {
            field: "accountNumber", minWidth: 180, headerName: 'Account number',
            resizable: true,
            sortable: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agTextColumnFilter",
            // hide: true, // Hide column as it's grouped
            // rowGroup: true,
            // enableRowGroup: true,

        },
        {
            field: "accountName", minWidth: 180, headerName: 'Account name',
            resizable: true,
            sortable: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agTextColumnFilter",
            // hide: true, // Hide column as it's grouped
            // rowGroup: true,
            // enableRowGroup: true,

        },
        {
            field: 'specifiedDate', headerName: "Date",
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: 'agDateColumnFilter',
            valueGetter: params => {
                const dateStr = params.data?.specifiedDate;
                if (!dateStr) return null;
                const [y, m, d] = dateStr.split('-').map(Number);
                return new Date(y, m - 1, d);
            },
            valueFormatter: params => {
                const d = params.value;
                return d ? d.toLocaleDateString() : '';
            }
        },
        {
            field: "spend",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agNumberColumnFilter",
        }, // Summing Spend column
        {
            headerName: 'Revenue',
            field: "estimated_revenue",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agNumberColumnFilter",
        }, // Summing Revenue column
        {
            field: "profit",
            aggFunc: spender,
            cellClassRules: {
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0,
            },
            valueFormatter: currencyFormatter,
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            filter: "agNumberColumnFilter",
        },
        {
            field: 'rpc',
            headerName: 'RPC',
            valueGetter: avgRpcCpl,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'cpl',
            headerName: 'CPL',
            valueGetter: avgCpl,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'ncpl',
            headerName: 'NCPL',
            valueGetter: avgNCPL,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'cpc',
            headerName: 'CPC',
            valueGetter: avgCPC,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'ctr',
            headerName: 'CTR',
            valueGetter: avgCTR,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },

        // {
        //     field: 'ctr',
        //     headerName: 'CTR',
        //     valueGetter: avgCtr,
        //     suppressMenu: true,
        //     menuTabs: [],
        //     headerClass: 'hide-menu',
        //     minWidth: 95,
        //     filter: "agNumberColumnFilter",
        //     // valueFormatter: rpcCplFormatter,
        // },
        {
            field: 'conversions',
            headerName: 'Conv',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'fbLeads',
            headerName: 'Fb leads',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'fbClicks',
            headerName: 'Fb clicks',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 108,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'impressions',
            headerName: 'Imp',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            minWidth: 95,
            filter: "agNumberColumnFilter",
            // valueFormatter: rpcCplFormatter,
        },
    ]
    // const [columnDefs4] = useState([
    //     {
    //         field: 'BMName', minWidth: 200, suppressAutoSize: true, headerName: 'BM name',
    //         resizable: true,
    //         sortable: true,
    //         hide: true, // Hide column as it's grouped
    //         rowGroup: true,
    //         enableRowGroup: true,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agTextColumnFilter",
    //     },
    //     {
    //         field: "AgencyName", minWidth: 180, headerName: 'Agency name',
    //         resizable: true,
    //         sortable: true,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agTextColumnFilter",
    //         // hide: true, // Hide column as it's grouped
    //         // rowGroup: true,
    //         // enableRowGroup: true,

    //     }, // Group by Network
    //     {
    //         field: 'specifiedDate', headerName: "Date",
    //         minWidth: 125,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: 'agDateColumnFilter',
    //         valueGetter: params => {
    //             const dateStr = params.data?.specifiedDate;
    //             if (!dateStr) return null;
    //             const [y, m, d] = dateStr.split('-').map(Number);
    //             return new Date(y, m - 1, d);
    //         },
    //         valueFormatter: params => {
    //             const d = params.value;
    //             return d ? d.toLocaleDateString() : '';
    //         }
    //     },
    //     {
    //         field: "spend",
    //         aggFunc: spender,
    //         valueFormatter: currencyFormatter,
    //         minWidth: 125,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agNumberColumnFilter",
    //     }, // Summing Spend column
    //     {
    //         headerName: 'Revenue',
    //         field: "estimated_revenue",
    //         aggFunc: spender,
    //         valueFormatter: currencyFormatter,
    //         minWidth: 125,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agNumberColumnFilter",
    //     }, // Summing Revenue column
    //     {
    //         field: "profit",
    //         aggFunc: spender,
    //         cellClassRules: {
    //             'font-red': p => p.value < 0,
    //             'font-green': params => params.value > 0,
    //         },
    //         valueFormatter: currencyFormatter,
    //         minWidth: 125,
    //         suppressMenu: true,
    //         menuTabs: [],
    //         headerClass: 'hide-menu',
    //         filter: "agNumberColumnFilter",
    //     }
    // ]);

    const autoGroupColumnDefOverAllReport = {
        headerName: 'Group', // Display name for the grouped column
        minWidth: 250, // Set width for grouped rows
        resizable: true, // Enable resizing
        sortable: true, // Enable sorting
        cellRendererParams: {
            suppressCount: true, // Suppress row count in the grouped column
        },
    };

    const autoGroupColumnDef = {
        headerName: 'Campaign name', // Display name for the grouped column
        minWidth: 430, // Set width for grouped rows
        resizable: true, // Enable resizing
        sortable: true, // Enable sorting
        cellRendererParams: {
            suppressCount: true, // Suppress row count in the grouped column
        },
    };

    const autoGroupColumnDefDomain = {
        headerName: 'Domain', // Display name for the grouped column
        minWidth: 250, // Set width for grouped rows
        resizable: true, // Enable resizing
        sortable: true, // Enable sorting
        cellRendererParams: {
            suppressCount: true, // Suppress row count in the grouped column
        },
        filter: "agTextColumnFilter",
        filterValueGetter: (params) => {
            if (params.node.group) {
                // Use the group key (campaign name)
                return params.node.key;
            }
            // For leaf rows, use the campaign_name or any field
            return params.data?.domain || '';
        },
    };
    const autoGroupColumnDefAgency = {
        headerName: 'BM name', // Display name for the grouped column
        minWidth: 250, // Set width for grouped rows
        resizable: true, // Enable resizing
        sortable: true, // Enable sorting
        cellRendererParams: {
            suppressCount: true, // Suppress row count in the grouped column
        },
        filter: "agTextColumnFilter",
        filterValueGetter: (params) => {
            if (params.node.group) {
                // Use the group key (campaign name)
                return params.node.key;
            }
            // For leaf rows, use the campaign_name or any field
            return params.data?.BMName || '';
        },
    };

    //   const [columnDefs2] = useState([
    //     { field: "revenuePartner", 
    //         resizable: true,
    //         sortable: true,
    //         // width: 500,
    //         hide: true,
    //         rowGroup: true,
    //         enableRowGroup: true,
    //     }, // Group by Network
    //     { field: "holder",
    //     resizable: true,
    //     sortable: true,
    //     hide: true, // Hide column as it's grouped
    //     rowGroup: true, 
    //     enableRowGroup: true,  }, // Group by Holder
    //     {
    //       field: "mediaBuyerName",// Group by MediaBuyerName
    //     }, // Display Media Buyer name
    //     {
    //       field: "spend",
    //       aggFunc: spender,
    //     //   valueFormatter: currencyFormatter,
    //     }, // Summing Spend column
    //     {
    //       field: "estimated_revenue",
    //       aggFunc: spender,
    //     //   valueFormatter: currencyFormatter,
    //     }, // Summing Revenue column
    //     {
    //       field: "profit",
    //       aggFunc: spender,
    //     //   valueFormatter: currencyFormatter,
    //     }, // Custom aggregation for Profit
    //   ]);

    const [defaultColDef] = useState({
        flex: 1, // Flex for responsiveness
        sortable: true, // Enable sorting
        filter: true, // Enable filtering
        resizable: true,
        enableRowGroup: true, // Enable row grouping
    });


    const refreshUsers = () => {
        try {
            setSkeletonLoading(true);
            functionCallForResponse(selectedItems);

        } catch (error) {
            console.error("Error refreshing account data:", error);

        }
    };

    //   function currencyFormatter(params) {
    //     const value = params.value || 0; // Ensure value is defined and default to 0
    //     return `$${value}`; // Format the value as currency
    //   }

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

    const onClickBarChart = (value) => {
        // console.log(value);
        localStorage.setItem('showGraph', value);
        setShowGraphs(value);

    }


    console.log(showGraphs, "showGraphs");


    // chartOptions.js
    const getChartOptions = (theme) => ({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    padding: 30,
                    color: theme === 'dark' ? '#fff' : '#000',
                },
                grid: {
                    color: theme === 'dark' ? '#444' : '#e0e0e0',
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => value.toFixed(2),
                    color: theme === 'dark' ? '#fff' : '#000',
                },
                grid: {
                    color: theme === 'dark' ? '#444' : '#e0e0e0',
                },
            },
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    color: '#fff',
                    font: { size: 13, weight: 'normal' },
                    generateLabels: (chart) => {
                        const colors = {
                            Spend: 'rgba(44, 144, 192, 1)',
                            Revenue: 'rgba(99, 200, 99, 1)',
                            RPC: 'rgba(255, 99, 132, 1)',
                            CPL: 'rgba(255, 159, 64, 1)',
                            Profit: 'rgba(255, 206, 86, 1)',
                            Margin: 'rgba(153, 102, 255, 1)',
                        };
                        return chart.data.datasets.map((dataset, i) => ({
                            text: dataset.label,
                            fillStyle: colors[dataset.label],
                            strokeStyle: colors[dataset.label],
                            pointStyle: 'rectRounded',
                            hidden: !chart.isDatasetVisible(i),
                            index: i,
                            fontColor: '#fff',
                        }));
                    },
                },
                onClick: (e, legendItem, legend) => {
                    const chart = legend.chart;
                    const index = legendItem.index;
                    const meta = chart.getDatasetMeta(index);
                    meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
                    chart.update();
                },
            },
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
                        return `${dataset.label}: ${value}`;
                    },
                },
            },
        },
    });

    const cardHeight = "70px"; // fixed height
    const cardBg = theme === "dark" ? "#333" : "";
    const valueStyle = { color: theme === "dark" ? "#ffffff" : "#3f8600" };

    const metrics = [
        { key: "revenue", label: "Revenue", color: "#00C853", prefix: "$", value: data.length > 0 ? revenue1.current : 0 },
        { key: "profit", label: "Profit", color: "#26A69A", prefix: "$", value: data.length > 0 ? profit1.current : 0 },
        { key: "spend", label: "Amount Spent", color: "#3F51B5", prefix: "$", value: data.length > 0 ? spend1.current : 0 },
        { key: "leads", label: "Leads", color: "#FFC107", value: data.length > 0 ? leads1.current : 0 },
        { key: "conversions", label: "Conversions", color: "#673AB7", value: data.length > 0 ? conversions1.current : 0 },
        { key: "ncpl", label: "NCPL", color: "#AED581", value: data.length > 0 ? ncpl1.current : 0 },
        { key: "cpl", label: "CPL", color: "#FF9800", value: data.length > 0 ? (cpl1.current !== Infinity ? cpl1.current : 0) : 0 },
        { key: "ctr", label: "CTR", color: "#2196F3", value: data.length > 0 ? ctr1.current : 0 },
        { key: "cpc", label: "CPC", color: "#F44336", value: data.length > 0 ? cpc1.current : 0 },
        { key: "rpc", label: "RPC", color: "#00ACC1", value: data.length > 0 ? rpc1.current : 0 },
    ];

    const onCellClicked = (params) => {

        const field = params.colDef.field || params.node.field;

        if (field === 'accountNumber') {
            const accountNumberToPassToReports = params.value;
            console.log(params.node);
            const groupedData = params.node.allLeafChildren
                ? params.node.allLeafChildren.map(childNode => childNode.data)
                : [params.node.data];

            // Ensure groupedData has at least one element
            // if (groupedData.length === 0) {
            //     return '';
            // }

            // Safeguard against undefined or missing properties
            const firstGroupedItem = groupedData[0] || {};
            const revenuePartnerNameToPassToReports = firstGroupedItem.revenuePartner
                ? revenuePartnerNames[firstGroupedItem.revenuePartner]
                : 'Unknown Partner';

            const data = {
                network: revenuePartnerNameToPassToReports,
                accountNumber: accountNumberToPassToReports,
                time: time,
                startDate: startDate,
                endDate: endDate,
                accountName: userdetails?.adAccounts[revenuePartnerNameToPassToReports]?.find(each => each.accountNumber === accountNumberToPassToReports)?.accountName
            };
            const queryString = new URLSearchParams(data).toString();
            const url = `/Reports?${queryString}`;

            // Open the URL in a new tab
            window.open(url, '_blank', 'noopener,noreferrer');
            console.log('Clicked accountNumber:', params.value, params.node);
        }
        // if(field === "campaign_name"){
        //     const accountNumberToPassToReports = params.value;
        //     console.log(params.node);
        //     const groupedData = params.node.allLeafChildren
        //         ? params.node.allLeafChildren.map(childNode => childNode.data)
        //         : [params.node.data];

        //     // Ensure groupedData has at least one element
        //     // if (groupedData.length === 0) {
        //     //     return '';
        //     // }

        //     // Safeguard against undefined or missing properties
        //     const firstGroupedItem = groupedData[0] || {};
        //     const revenuePartnerNameToPassToReports = firstGroupedItem.revenuePartner
        //         ? revenuePartnerNames[firstGroupedItem.revenuePartner]
        //         : 'Unknown Partner';

        //     const data = {
        //         network: revenuePartnerNameToPassToReports,
        //         accountNumber: accountNumberToPassToReports,
        //         time: time,
        //         startDate: startDate,
        //         endDate: endDate,
        //         accountName: userdetails?.adAccounts[revenuePartnerNameToPassToReports]?.find(each => each.accountNumber === accountNumberToPassToReports)?.accountName
        //     };
        //     const queryString = new URLSearchParams(data).toString();
        //     const url = `/Reports?${queryString}`;

        //     // Open the URL in a new tab
        //     window.open(url, '_blank', 'noopener,noreferrer');
        //     console.log('Clicked accountNumber:', params.value, params.node);
        // }
    };




    // console.log(rowData?.map(each=> each.profit > 0));
    // console.log(chartData.revenue, "data");
    return (
        <div>

            <div>
                {rendering === true ? <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div> : (
                    <div style={{ padding: '20px', paddingBottom: '0px' }}>
                        <div className='Dashboard-Details-2'>
                            <div style={{ width: '100%' }}>
                                <h3 style={{ color: theme === 'dark' ? 'white' : 'black', textAlign: 'start' }}>
                                    Welcome, {userdetails?.userName} !
                                </h3>
                            </div>
                            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>

                                <div style={{ width: '100%', display: 'flex', justifyContent: "space-between" }}>
                                    <Row style={{ width: '100%', height: '100px', display: 'flex', justifyContent: 'space-between' }}>
                                        <Col xs={12} sm={8} md={6} >
                                            <Select
                                                mode="tags"
                                                style={{
                                                    width: '100%',
                                                    maxHeight: '40px',
                                                    overflowY: 'auto',
                                                    // width: '100%',
                                                }}

                                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                                placeholder="Select projects"
                                                value={firstSelectValues}
                                                onChange={handleFirstSelectChange}
                                                maxTagCount="responsive"
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                dropdownRender={(menu) => (
                                                    <div
                                                        style={{
                                                            width: '100%',
                                                            maxHeight: '200px',
                                                            overflowY: 'auto',
                                                            overflowX: 'hidden',
                                                            // padding: '8px',
                                                            scrollbarWidth: 'none', // For Firefox
                                                            msOverflowStyle: 'none',
                                                        }}
                                                    >
                                                        {menu}

                                                    </div>

                                                )}
                                                options={Object.keys(transformedData).map((category) => ({
                                                    value: category,
                                                    label: category,
                                                }))}

                                            />
                                        </Col>

                                        <Col xs={16} style={{ marginBottom: '5px' }}>
                                            <Select
                                                mode="multiple"
                                                showSearch
                                                onSearch={handleSearchChange}  // Update searchValue dynamically
                                                style={{ width: '100%' }}
                                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                                placeholder="Select Accounts"
                                                dropdownClassName={theme === 'dark' ? 'custom-dropdown' : 'custom-dropdown'}
                                                value={[]} // This should be updated to reflect selectedItems based on the selected categories
                                                dropdownRender={() => (
                                                    <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px' }}>
                                                        {renderInnerSelects(theme)}
                                                    </div>
                                                )}
                                            />
                                        </Col>

                                        <Col xs={7} style={{ marginBottom: '5px' }}>
                                            <Select
                                                showSearch
                                                onChange={onChangeTime}
                                                style={{
                                                    width: '100%',
                                                }}
                                                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                                placeholder="Select timezone"
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                optionFilterProp="label"
                                                value={time}
                                                options={timezones.map((item) => ({
                                                    value: item,
                                                    label: item,
                                                }))}
                                            />
                                        </Col>

                                        <Col xs={20}>
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
                                                    value={selectedDates}
                                                    onCalendarChange={handleChangeDates}
                                                    open={isPickerOpen} // Control the open/close state
                                                    onOpenChange={handleOpenChange} // Handle outside click
                                                    onClick={() => setIsPickerOpen(true)} // Open the picker when clicked
                                                    disabledDate={disabledDate}
                                                    format="YYYY-MM-DD"
                                                    dropdownClassName={`custom-single-month-picker Dashboard-Details-2 ${theme === 'dark' ? 'dark-theme-dropdown' : ''}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '35px', // Adjust height as needed
                                                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                                        color: theme === 'dark' ? '#fff' : '#000',
                                                        borderRadius: 6,
                                                        padding: '8px 12px',
                                                    }}
                                                    renderExtraFooter={() => (
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '8px', paddingTop: '5px', paddingBottom: '5px' }}>
                                                            <Button
                                                                className='custom-button'
                                                                style={{ marginRight: '8px', border: ' 1px solid #4caf50' }} // Adds spacing between buttons
                                                                onClick={onClickCloseButton} // Close the picker
                                                            >
                                                                Close
                                                            </Button>
                                                            <Button
                                                                className='custom-button1'
                                                                style={{ backgroundColor: '#91C25F', border: ' 1px solid #4caf50' }}
                                                                onClick={handleSubmit}
                                                            >
                                                                Submit
                                                            </Button>
                                                        </div>
                                                    )}
                                                />
                                            </ConfigProvider>
                                        </Col>
                                        <Col xs={4}>
                                            <Button
                                                type="default"
                                                icon={<ReloadOutlined className='black-icon' />}
                                                style={{ float: "right", marginLeft: "10px", backgroundColor: '#C7F39A' }}
                                                onClick={refreshUsers}  // Call refresh function when clicked
                                            >
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </div>
                        <div className='Dashboard-Details-1'>
                            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                                {/* <div style={{ width: '40%' }}>
                            <h1 style={{  color: theme === 'dark' ? 'white' : 'black' , fontSize: '22px', textAlign: 'start' }}>
                                Welcome, {userdetails?.userName} !
                            </h1>
                        </div> */}
                                <div style={{ width: '40%', textAlign: 'start' }}>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: '20px',
                                        fontWeight: 600,
                                        color: theme === 'dark' ? '#fff' : '#4b5563'  // gray-700
                                    }}>
                                        Analytics dashboard
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        color: theme === 'dark' ? '#cbd5e1' : '#6b7280'  // gray-500
                                    }}>
                                        Real-time insights for your digital campaigns
                                    </p>
                                </div>

                                <div style={{
                                    width: '60%', display: 'flex', justifyContent: 'flex-end', height: '50px', borderRadius: 12,
                                    backgroundColor: theme === 'dark' ? '#1E1E1E' : '#dbd9d9ff',
                                    padding: "10px",
                                    marginBottom: '5px',

                                    boxShadow:
                                        theme === 'dark'
                                            ? '0 1px 3px rgba(0,0,0,0.6)'
                                            : '0 1px 6px rgba(0, 0, 0, 0.04)',
                                }}>
                                    <Row style={{ width: '100%', height: '100px', display: 'flex', justifyContent: 'space-between' }}>
                                        <Col span={5}>
                                            <Select
                                                mode="tags"
                                                style={{
                                                    width: '100%',
                                                    maxHeight: '40px',
                                                    overflowY: 'auto',
                                                    // width: '100%',
                                                }}
                                                className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                                placeholder="Select Projects"
                                                value={firstSelectValues}
                                                onChange={handleFirstSelectChange}
                                                maxTagCount="responsive"
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                dropdownRender={(menu) => (
                                                    <div
                                                        style={{
                                                            width: '100%',
                                                            maxHeight: '200px',
                                                            overflowY: 'auto',
                                                            overflowX: 'hidden',
                                                            // padding: '8px',
                                                            scrollbarWidth: 'none', // For Firefox
                                                            msOverflowStyle: 'none',
                                                        }}
                                                    >
                                                        {menu}
                                                    </div>
                                                )}
                                                // options={Object.keys(transformedData).map((category) => ({
                                                //     value: category,
                                                //     label: category,
                                                //     title: ''
                                                // }))}
                                                options={Object.keys(transformedData || {})
                                                    .sort((a, b) => {
                                                        const aActive = networksWithStatus.find(n => n.Network === a)?.Status === 'Active' ? 1 : 0;
                                                        const bActive = networksWithStatus.find(n => n.Network === b)?.Status === 'Active' ? 1 : 0;
                                                        return bActive - aActive; // Active first
                                                    })
                                                    .map(category => {
                                                        const isActive = networksWithStatus.find(n => n.Network === category)?.Status === 'Active';
                                                        return {
                                                            value: category,
                                                            label: (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                    {isActive
                                                                        ? <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} className='black-icon-active-1' />
                                                                        : <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} className='black-icon-pause-1' />}
                                                                    <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{category}</span>
                                                                </div>
                                                            )
                                                        };
                                                    })
                                                }

                                                optionLabelProp="label"

                                            />
                                        </Col>

                                        <Col span={7}>
                                            <Select
                                                mode="multiple"
                                                showSearch
                                                onSearch={handleSearchChange}  // Update searchValue dynamically
                                                style={{ width: '100%' }}
                                                className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                                placeholder="Select Accounts"
                                                dropdownClassName={theme === 'dark' && 'custom-dropdown'}
                                                value={[]} // This should be updated to reflect selectedItems based on the selected categories
                                                dropdownRender={() => (
                                                    <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px' }}>
                                                        {renderInnerSelects(theme)}
                                                    </div>
                                                )}
                                            />
                                        </Col>

                                        <Col span={3}>
                                            <Select
                                                showSearch
                                                onChange={onChangeTime}
                                                style={{
                                                    width: '100%',
                                                }}
                                                className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
                                                placeholder="Select timezone"
                                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                                optionFilterProp="label"
                                                value={time}
                                                options={timezones.map((item) => ({
                                                    value: item,
                                                    label: item,
                                                    title: ''
                                                }))}
                                            />
                                        </Col>

                                        <Col span={7}>
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
                                                    className="green-border-picker"
                                                    presets={rangePresets}
                                                    value={selectedDates}
                                                    onCalendarChange={handleChangeDates}
                                                    open={isPickerOpen} // Control the open/close state
                                                    onOpenChange={handleOpenChange} // Handle outside click
                                                    onClick={() => setIsPickerOpen(true)} // Open the picker when clicked
                                                    disabledDate={disabledDate}
                                                    format="YYYY-MM-DD"
                                                    style={{
                                                        width: '100%',
                                                        backgroundColor: theme === 'dark' ? '#555' : undefined,
                                                        color: theme === 'dark' ? 'white' : undefined,
                                                    }}
                                                    dropdownClassName={theme === 'dark' ? 'Dashboard-Details-1 dark-theme-dropdown' : ' Dashboard-Details-1'}
                                                    renderExtraFooter={() => (
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '8px', paddingTop: '5px', paddingBottom: '5px' }}>
                                                            <Button
                                                                className='custom-button'
                                                                style={{ marginRight: '8px', border: ' 1px solid #4caf50' }} // Adds spacing between buttons
                                                                onClick={onClickCloseButton} // Close the picker
                                                            >
                                                                Close
                                                            </Button>
                                                            <Button
                                                                className='custom-button1'
                                                                style={{ backgroundColor: '#91C25F', border: ' 1px solid #4caf50' }}
                                                                onClick={handleSubmit}
                                                            >
                                                                Submit
                                                            </Button>
                                                        </div>
                                                    )}
                                                />
                                            </ConfigProvider>
                                        </Col>
                                        <Col>
                                            <Button
                                                type="default"
                                                icon={<ReloadOutlined className='black-icon' />}
                                                style={{ float: "right", marginLeft: "10px", backgroundColor: '#91C25F' }}
                                                onClick={refreshUsers}  // Call refresh function when clicked
                                            >
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </div>

                        {skeletonLoading ? (
                            <Skeleton active paragraph={{ rows: 15 }} style={{ marginTop: '20px' }} />
                        ) : (
                            <div style={{ height: '100%' }}>
                                <Card
                                    style={{
                                        marginTop: '25px',
                                        border: 'none',
                                        boxShadow: 'none',
                                        padding: 0,
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        backgroundColor: theme === 'dark' ? '#0E1E38' : '#fff',
                                    }}
                                    bodyStyle={{ padding: 0 }}
                                    className='Dashboard-Details-2'
                                >
                                    <div
                                        className="responsive-grid"
                                        style={{
                                            display: 'grid',
                                            // gridTemplateColumns: 'repeat(2, fr)',
                                            // gap: '1px',
                                            // backgroundColor: theme === 'dark' ? '#ffffff' : '#0B3D63',
                                            width: '100%',
                                            position: 'relative',
                                        }}
                                    >
                                        {[
                                            { title: 'Revenue', value: revenue1.current, prefix: '$', color: '#00C853', dot: '#00C853' },
                                            { title: 'Profit', value: profit1.current, prefix: '$', color: '#26A69A', dot: '#26A69A' },
                                            { title: 'Spend', value: spend1.current, prefix: '$', color: '#5C58EE', dot: '#5C58EE' },
                                            { title: 'Leads', value: leads1.current, color: '#EC7117', dot: '#EC7117' },
                                            { title: 'Conversions', value: conversions1.current, color: '#5C58EE', dot: '#5C58EE' },
                                            { title: 'NCPL', value: ncpl1.current, prefix: '$', color: '#91C25F', dot: '#91C25F' },
                                            { title: 'CPL', value: cpl1.current, color: '#EC7117', dot: '#EC7117' },
                                            { title: 'CTR', value: ctr1.current, color: '#5C58EE', dot: '#5C58EE' },
                                            { title: 'CPC', value: cpc1.current, prefix: '$', color: '#EC7117', dot: '#EC7117' },
                                            { title: 'RPC', value: rpc1.current, color: '#5C58EE', dot: '#5C58EE' },
                                        ].map((item, idx) => (
                                            <div
                                                key={idx}
                                                className={theme === 'dark' ? "grid-cell" : "grid-cell-1"}
                                                style={{
                                                    backgroundColor: theme === 'dark' ? '#333' : '#e1e2e3',
                                                    padding: '16px',
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                    position: 'relative',
                                                    zIndex: 2,
                                                    borderBottom: idx < 8 ? (theme === 'dark' ? '1px solid #8d8989' : '1px solid #9e9e9e') : 'none',
                                                    borderLeft:
                                                        (idx % 2 === 1 && idx < 8 || idx === 9) ? (theme === 'dark' ? '1px solid #8d8989' : '1px solid #9e9e9e') : 'none',
                                                    // borderLeft: idx === 9 ? (theme === 'dark' ? '1px solid #fff' : '1px solid #0B3D63') : 'none',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                                                    {item.dot && (
                                                        <span
                                                            style={{
                                                                display: 'inline-block',
                                                                height: '10px',
                                                                width: '10px',
                                                                borderRadius: '50%',
                                                                backgroundColor: item.dot,
                                                                marginRight: 6,
                                                            }}
                                                        ></span>
                                                    )}
                                                    <span
                                                        style={{
                                                            fontSize: 15,
                                                            fontWeight: 600,
                                                            color: item.color || (theme === 'dark' ? '#66b2ff' : '#4a5d78'),
                                                        }}
                                                    >
                                                        {item.title}
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 18,
                                                        fontWeight: 700,
                                                        // color: '#fff',
                                                    }}
                                                >
                                                    {item.prefix || ''}
                                                    {data.length > 0 && item.value !== undefined && item.value !== Infinity ? item.value : 0}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="vertical-divider" />
                                        <div className="horizontal-divider" />
                                    </div>
                                </Card>

                                <div className='Dashboard-Details-1' >
                                    {/* <Row gutter={24} style={{ marginTop: '5px' }} justify="space-between">
                                        <Col flex="1">
                                            <Card style={{ backgroundColor: theme === "dark" ? '#333' : '', }}>
                                                <Statistic
                                                    title={
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <span
                                                                style={{
                                                                    display: 'inline-block',
                                                                    height: '12px',
                                                                    width: '12px',
                                                                    backgroundColor: '#00C853',
                                                                    borderRadius: '50%',
                                                                    marginRight: '8px',
                                                                }}
                                                            ></span>
                                                            <span style={{ color: '#00C853', fontWeight: 600 }}>Revenue</span>
                                                        </div>
                                                    }
                                                    value={data.length > 0 ? revenue1.current : 0}
                                                    prefix="$"
                                                    valueStyle={{ color: theme === 'dark' ? '#ffffff' : '#3f8600' }}
                                                />
                                            </Card>
                                        </Col>

                                        <Col flex="1">
                                            <Card style={{ backgroundColor: theme === "dark" ? '#333' : '', }}>
                                                <Statistic
                                                    title={
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <span
                                                                style={{
                                                                    display: 'inline-block',
                                                                    height: '12px',
                                                                    width: '12px',
                                                                    backgroundColor: '#26A69A',
                                                                    borderRadius: '50%',
                                                                    marginRight: '8px',
                                                                }}
                                                            ></span>
                                                            <span style={{ color: '#26A69A', fontWeight: 600 }}>Profit</span>
                                                        </div>
                                                    }
                                                    value={data.length > 0 ? profit1.current : 0}
                                                    prefix="$"
                                                    valueStyle={{ color: theme === 'dark' ? '#ffffff' : '#3f8600' }} />
                                            </Card>
                                        </Col>

                                        <Col flex="1">
                                            <Card style={{ backgroundColor: theme === "dark" ? '#333' : '', }}>
                                                <Statistic
                                                    title={
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <span
                                                                style={{
                                                                    display: 'inline-block',
                                                                    height: '12px',
                                                                    width: '12px',
                                                                    backgroundColor: '#3F51B5',
                                                                    borderRadius: '50%',
                                                                    marginRight: '8px',
                                                                }}
                                                            ></span>
                                                            <span style={{ color: '#3F51B5', fontWeight: 600 }}>Amount Spent</span>
                                                        </div>
                                                    }
                                                    value={data.length > 0 ? spend1.current : 0}
                                                    prefix="$"
                                                    valueStyle={{ color: theme === 'dark' ? '#ffffff' : '#3f8600' }} />
                                            </Card>
                                        </Col>

                                        <Col flex="1">
                                            <Card style={{ backgroundColor: theme === "dark" ? '#333' : '', }}>
                                                <Statistic
                                                    title={
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <span
                                                                style={{
                                                                    display: 'inline-block',
                                                                    height: '12px',
                                                                    width: '12px',
                                                                    backgroundColor: '#FFC107',
                                                                    borderRadius: '50%',
                                                                    marginRight: '8px',
                                                                }}
                                                            ></span>
                                                            <span style={{ color: '#FFC107', fontWeight: 600 }}>Leads</span>
                                                        </div>
                                                    }
                                                    value={data.length > 0 ? leads1.current : 0}
                                                    valueStyle={{ color: theme === 'dark' ? '#ffffff' : '#3f8600' }} />
                                            </Card>
                                        </Col>

                                        <Col flex="1">
                                            <Card style={{ backgroundColor: theme === "dark" ? '#333' : '', }}>
                                                <Statistic
                                                    title={
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <span
                                                                style={{
                                                                    display: 'inline-block',
                                                                    height: '12px',
                                                                    width: '12px',
                                                                    backgroundColor: '#673AB7',
                                                                    borderRadius: '50%',
                                                                    marginRight: '8px',
                                                                }}
                                                            ></span>
                                                            <span style={{ color: '#673AB7', fontWeight: 600 }}>Conversions</span>
                                                        </div>
                                                    }
                                                    value={data.length > 0 ? conversions1.current : 0}
                                                    valueStyle={{ color: theme === 'dark' ? '#ffffff' : '#3f8600' }} />
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Row gutter={24} style={{ marginTop: '20px' }} justify="space-between">
                                        <Col flex="1">
                                            <Card style={{ backgroundColor: theme === "dark" ? '#333' : '', }}>
                                                <Statistic
                                                    title={
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <span
                                                                style={{
                                                                    display: 'inline-block',
                                                                    height: '12px',
                                                                    width: '12px',
                                                                    backgroundColor: '#AED581',
                                                                    borderRadius: '50%',
                                                                    marginRight: '8px',
                                                                }}
                                                            ></span>
                                                            <span style={{ color: '#AED581', fontWeight: 600 }}>NCPL</span>
                                                        </div>
                                                    }
                                                    value={data.length > 0 ? ncpl1.current : 0}
                                                    valueStyle={{ color: theme === 'dark' ? '#ffffff' : '#3f8600' }} />
                                            </Card>
                                        </Col>

                                        <Col flex="1">
                                            <Card style={{ backgroundColor: theme === "dark" ? '#333' : '', }}>
                                                <Statistic
                                                    title={
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <span
                                                                style={{
                                                                    display: 'inline-block',
                                                                    height: '12px',
                                                                    width: '12px',
                                                                    backgroundColor: '#FF9800',
                                                                    borderRadius: '50%',
                                                                    marginRight: '8px',
                                                                }}
                                                            ></span>
                                                            <span style={{ color: '#FF9800', fontWeight: 600 }}>CPL</span>
                                                        </div>
                                                    }
                                                    value={data.length > 0 ? cpl1.current !== Infinity ? cpl1.current : 0 : 0}
                                                    valueStyle={{ color: theme === 'dark' ? '#ffffff' : '#3f8600' }} />
                                            </Card>
                                        </Col>

                                        <Col flex="1">
                                            <Card style={{ backgroundColor: theme === "dark" ? '#333' : '', }}>
                                                <Statistic
                                                    title={
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <span
                                                                style={{
                                                                    display: 'inline-block',
                                                                    height: '12px',
                                                                    width: '12px',
                                                                    backgroundColor: '#2196F3',
                                                                    borderRadius: '50%',
                                                                    marginRight: '8px',
                                                                }}
                                                            ></span>
                                                            <span style={{ color: '#2196F3', fontWeight: 600 }}>CTR</span>
                                                        </div>
                                                    }
                                                    value={data.length > 0 ? ctr1.current : 0}
                                                    valueStyle={{ color: theme === 'dark' ? '#ffffff' : '#3f8600' }} />
                                            </Card>
                                        </Col>

                                        <Col flex="1">
                                            <Card style={{ backgroundColor: theme === "dark" ? '#333' : '', }}>
                                                <Statistic
                                                    title={
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <span
                                                                style={{
                                                                    display: 'inline-block',
                                                                    height: '12px',
                                                                    width: '12px',
                                                                    backgroundColor: '#F44336',
                                                                    borderRadius: '50%',
                                                                    marginRight: '8px',
                                                                }}
                                                            ></span>
                                                            <span style={{ color: '#F44336', fontWeight: 600 }}>CPC</span>
                                                        </div>
                                                    }
                                                    value={data.length > 0 ? cpc1.current : 0}
                                                    valueStyle={{ color: theme === 'dark' ? '#ffffff' : '#3f8600' }} />
                                            </Card>
                                        </Col>

                                        <Col flex="1">
                                            <Card style={{ backgroundColor: theme === "dark" ? '#333' : '', }}>
                                                <Statistic
                                                    title={
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <span
                                                                style={{
                                                                    display: 'inline-block',
                                                                    height: '12px',
                                                                    width: '12px',
                                                                    backgroundColor: '#00ACC1',
                                                                    borderRadius: '50%',
                                                                    marginRight: '8px',
                                                                }}
                                                            ></span>
                                                            <span style={{ color: '#00ACC1', fontWeight: 600 }}>RPC</span>
                                                        </div>
                                                    }
                                                    value={data.length > 0 ? rpc1.current : 0}
                                                    valueStyle={{ color: theme === 'dark' ? '#ffffff' : '#3f8600' }} />
                                            </Card>
                                        </Col>
                                    </Row> */}
                                    {/* <Row className="metrics-row" gutter={[8, 8]}>
                                        {metrics.map((m) => (
                                            <Col
                                                key={m.key}
                                                className="metrics-col"
                                                xs={24}
                                                sm={12}
                                                md={8}
                                            >
                                                <Card
                                                    className="metrics-card"
                                                    style={{
                                                        backgroundColor: cardBg,
                                                        height: cardHeight,
                                                        borderRadius: 12,
                                                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                                    }}
                                                    bodyStyle={{ padding: 0 }}
                                                >
                                                    <div style={{ width: "100%" }}>
                                                        <Statistic
                                                            title={
                                                                <div className="metrics-title" style={{ display: "flex", alignItems: "center" }}>
                                                                    <span
                                                                        style={{
                                                                            display: "inline-block",
                                                                            height: 12,
                                                                            width: 12,
                                                                            backgroundColor: m.color,
                                                                            borderRadius: "50%",
                                                                            marginRight: 8,
                                                                        }}
                                                                    />
                                                                    <span style={{ color: m.color, fontWeight: 600 }}>{m.label}</span>
                                                                </div>
                                                            }
                                                            value={m.value} // ✅ fixed: must be number/string, not JSX
                                                            prefix={m.prefix}
                                                            valueStyle={valueStyle}
                                                        />
                                                    </div>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row> */}
                                    <div className="metrics-container">
    <div className="metrics-grid">
        {metrics.map((m, i) => (
            <Card className="metric-card" key={i} bordered={false}
            style={{
        backgroundColor: theme === "dark" ? "#2F2F2F" : "white"
    }}>
                <div className="metric-title" style={{ color: m.color }}>
                    <span className="dot" style={{ backgroundColor: m.color }}></span>
                    {m.label}
                </div>

                <div className="metric-value"
                 style={{
            color: theme === "dark" ? "#fff" : "#3A9100"  // <-- VALUE COLOR HERE
        }}
                >
                    {m.prefix ? m.prefix + " " : ""}{m.value}
                </div>
            </Card>
        ))}
    </div>
</div>

                                </div>

                                <div
                                    style={{
                                        display: showGraphs ? 'flex' : 'none',
                                        flexDirection: 'column',
                                        // backgroundColor: '#e6e6e6', // ✅ Background match
                                        borderRadius: '12px',
                                        padding: '16px',
                                        marginTop: '15px',
                                        boxShadow: '0 1px 6px rgba(0, 0, 0, 0.08)',
                                    }}
                                >
                                    <div style={{ padding: '0px', }}>
                                        <RenderCarouselNav2 />
                                    </div>

                                    <Tabs
                                        activeKey={activeTab2}
                                        onChange={handleTabChange2}
                                        renderTabBar={() => <></>}
                                        style={{
                                            width: '100%',
                                            borderRadius: 12,
                                            backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
                                            padding: 10,
                                            height: 'auto', // ✅ Key: no fixed height
                                            boxShadow:
                                                theme === 'dark'
                                                    ? '0 1px 3px rgba(0,0,0,0.6)'
                                                    : '0 1px 6px rgba(0,0,0,0.08)',
                                        }}

                                    >
                                        {/* Tab 1 */}
                                        <Tabs.TabPane key="1">
                                            <div>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '12px',
                                                        flexWrap: 'wrap',
                                                        marginTop: '8px',
                                                        justifyContent: 'center',

                                                    }}
                                                >
                                                    {Object.keys(colorMaps).map((label) => {
                                                        const isVisible = !hiddenByDate.includes(label);
                                                        return (
                                                            <div
                                                                key={label}
                                                                onClick={() => toggle0(label)}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '13px',
                                                                    color: theme === 'dark' ? '#fff' : '#000',
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: '16px',
                                                                        height: '16px',
                                                                        borderRadius: '4px',
                                                                        backgroundColor: colorMaps[label],
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: '#fff',
                                                                        fontWeight: 'bold',
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

                                                <Row style={{ height: '400px', marginTop: '25px' }}>
                                                    {Array.isArray(datasets0) && datasets0.length > 0 && (
                                                        <Line
                                                            ref={chartByDateRef}
                                                            data={{
                                                                labels: chartDataByDate?.datesByDate || [],
                                                                datasets: datasets0,
                                                            }}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                plugins: {
                                                                    legend: { display: false },
                                                                    tooltip: {
                                                                        mode: 'index',
                                                                        intersect: false,
                                                                        displayColors: true,
                                                                        callbacks: {
                                                                            title: (tooltipItems) => {
                                                                                const index = tooltipItems[0].dataIndex;
                                                                                const rawDate = chartDataByDate?.datesByDate?.[index];
                                                                                const dateObj = new Date(rawDate);
                                                                                const weekday = dateObj.toLocaleDateString('en-US', {
                                                                                    weekday: 'long',
                                                                                });
                                                                                return [`${rawDate} (${weekday})`];
                                                                            },
                                                                            label: (tooltipItem) => {
                                                                                const dataset = tooltipItem.dataset;
                                                                                const value = dataset.data[tooltipItem.dataIndex];
                                                                                return `${dataset.label}: ${value}`;
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
                                                                            callback: (value) => value.toFixed(2),
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
                                                    )}
                                                </Row>
                                            </div>
                                        </Tabs.TabPane>

                                        {/* Tab 2 */}
                                        <Tabs.TabPane key="2">
                                            <div>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '12px',
                                                        flexWrap: 'wrap',
                                                        marginTop: '8px',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    {Object.keys(colorMaps).map((label) => {
                                                        const isVisible = !hidden.includes(label);
                                                        return (
                                                            <div
                                                                key={label}
                                                                onClick={() => toggle(label)}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '13px',
                                                                    color: theme === 'dark' ? '#fff' : '#000',
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: '16px',
                                                                        height: '16px',
                                                                        borderRadius: '4px',
                                                                        backgroundColor: colorMaps[label],
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: '#fff',
                                                                        fontWeight: 'bold',
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

                                                <Row style={{ height: '400px', marginTop: '25px' }}>
                                                    <Line
                                                        ref={chartRef}
                                                        data={{
                                                            labels: chartData?.dates || [],
                                                            datasets,
                                                        }}
                                                        options={{
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: {
                                                                legend: { display: false },
                                                                tooltip: {
                                                                    mode: 'index',
                                                                    intersect: false,
                                                                    displayColors: true,
                                                                    callbacks: {
                                                                        title: (tooltipItems) => {
                                                                            const index = tooltipItems[0].dataIndex;
                                                                            const xValue = tooltipItems[0].label;
                                                                            const date =
                                                                                chartData?.newDates?.[index] ||
                                                                                chartData?.dates?.[index] ||
                                                                                '';
                                                                            return `${xValue} ( ${date} )`;
                                                                        },
                                                                        label: (tooltipItem) => {
                                                                            const index = tooltipItem.dataIndex;
                                                                            const dataset = tooltipItem.dataset;
                                                                            const value = dataset.data[index];
                                                                            const label = dataset.label || '';
                                                                            return `${label}: ${value}`;
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                            scales: {
                                                                x: {
                                                                    ticks: {
                                                                        padding: 30,
                                                                        color: (() => {
                                                                            const memoizedColors = {};
                                                                            return (context) => {
                                                                                const index = context.index;
                                                                                const label = chartData?.dates?.[index];
                                                                                if (!label) return '#ccc';
                                                                                if (!memoizedColors[label]) {
                                                                                    memoizedColors[label] = getColorForValue(label);
                                                                                }
                                                                                return memoizedColors[label];
                                                                            };
                                                                        })(),
                                                                    },
                                                                    grid: {
                                                                        color: theme === 'dark' ? '#444' : '#e0e0e0',
                                                                    },
                                                                },
                                                                y: {
                                                                    beginAtZero: true,
                                                                    ticks: {
                                                                        callback: (value) => value.toFixed(2),
                                                                        color: theme === 'dark' ? '#fff' : '#000',
                                                                    },
                                                                    grid: {
                                                                        color: theme === 'dark' ? '#444' : '#e0e0e0',
                                                                    },
                                                                },
                                                            },
                                                            elements: {
                                                                point: {
                                                                    radius: 4,
                                                                    hitRadius: 10,
                                                                    hoverRadius: 6,
                                                                },
                                                            },
                                                        }}
                                                        height={350}
                                                    />
                                                </Row>
                                            </div>
                                        </Tabs.TabPane>
                                    </Tabs>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                                    <Button
                                        type="default"
                                        icon={<BarChartOutlined />}
                                        onClick={() => setShowGraphs(!showGraphs)}
                                        // onMouseEnter={() => setHovered(true)}
                                        // onMouseLeave={() => setHovered(false)}
                                        style={{
                                            border: '2px solid #4CAF50',
                                            color: showGraphs || hovered ? 'green' : theme === 'dark' ? '#f9fafb' : '#1f2937',
                                            backgroundColor: showGraphs || hovered ? '#91C25F' : 'transparent',
                                            borderRadius: '999px',
                                            fontWeight: 500,
                                            padding: '0 10px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            margin: '10px',
                                            transition: 'all 0.2s ease-in-out',
                                        }}
                                    >
                                        Chart
                                    </Button>
                                    {/* {showGraphs && (
                                        <div style={{ marginTop: 10 }}>

                                            <RenderCarouselNav2 />
                                        </div>
                                    )} */}
                                </div>



                                <Row style={{ display: 'flex', flexDirection: 'column', marginTop: "5px" }}>
                                    <Col>

                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
                                            style={{
                                                width: '100%',
                                                borderRadius: 12,
                                                backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
                                                padding: 10,
                                                height: 'auto', // ✅ Key: no fixed height
                                                boxShadow:
                                                    theme === 'dark'
                                                        ? '0 1px 3px rgba(0,0,0,0.6)'
                                                        : '0 1px 6px rgba(0,0,0,0.08)',
                                            }}
                                        >
                                            <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                {/* Left: Title */}
                                                <Col>
                                                    <h3
                                                        style={{
                                                            fontSize: '16px',
                                                            fontWeight: 500,
                                                            marginLeft: 10,
                                                            color: theme === 'dark' ? '#fff' : '#111827',
                                                        }}
                                                    >
                                                        Overall report
                                                    </h3>
                                                </Col>

                                                {/* Right: Chart Switch */}
                                                <Col>
                                                    <div>


                                                        {/* <Button
                                                            type="default"
                                                            icon={<BarChartOutlined />}
                                                            onClick={() => setShowGraphs(!showGraphs)}
                                                            onMouseEnter={() => setHovered(true)}
                                                            onMouseLeave={() => setHovered(false)}
                                                            style={{
                                                                border: '3px solid #91C25F',
                                                                color: showGraphs || hovered ? '#91C25F' : '#555',
                                                                backgroundColor: showGraphs || hovered ? 'green' : 'transparent',
                                                                borderRadius: '999px',
                                                                fontWeight: 500,
                                                                padding: '0 12px',
                                                                height: '32px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                transition: 'all 0.2s ease-in-out',
                                                            }}
                                                        >
                                                            Chart
                                                        </Button> */}
                                                        {/* {showGraphs && (
                                                            <div style={{ marginTop: 10 }}>
                                                                
                                                                <RenderCarouselNav2 /> 
                                                            </div>
                                                        )} */}


                                                    </div>
                                                    {/* <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 10 }}>
      <Switch
        checked={showGraphs}
        style={{ backgroundColor: showGraphs ? '#91C25F' : undefined }}
        onClick={onClickBarChart}
      />
      <span style={{ fontSize: '14px', color: theme === 'dark' ? '#fff' : '#000' }}>
        Chart
      </span>
    </div> */}
                                                </Col>
                                            </Row>


                                            {/* Grid wrapper with no padding/margin overflow */}
                                            <div style={{ width: '100%', height: 'auto' }}>
                                                <AgGridReact
                                                    className="custom-grid"
                                                    domLayout="auto"
                                                    rowData={rowData}
                                                    columnDefs={columnDefs}
                                                    defaultColDef={{
                                                        ...defaultColDef,
                                                        wrapText: true,
                                                        autoHeight: true,
                                                        cellStyle: {
                                                            whiteSpace: 'normal',
                                                            lineHeight: '1.4',
                                                            paddingTop: '4px',
                                                            paddingBottom: '4px',
                                                            fontSize: '13px',
                                                        },
                                                    }}
                                                    gridOptions={{
                                                        ensureDomOrder: false,
                                                        suppressRowClickSelection: true,
                                                        suppressClipboardPaste: false,
                                                        enableRangeSelection: true,
                                                    }}
                                                    // onFilterChanged={onFilterChanged}

                                                    autoGroupColumnDef={autoGroupColumnDefOverAllReport}
                                                    rowGroupPanelShow="always"
                                                    suppressAggFuncInHeader={true}
                                                    groupIncludeFooter={true}
                                                    groupIncludeTotalFooter={true}
                                                    getRowHeight={() => 32} // ✅ consistent row height
                                                    // groupAggFiltering ={true}
                                                    onCellClicked={onCellClicked}
                                                    enableCharts={true}
                                                        enableRangeSelection={true}
                                                        onGridReady={(params) => { window.__top5 = params.api; }}
                                                    onFilterChanged={onFilterChanged}
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                </Row>


                                <Row style={{ display: 'flex', flexDirection: 'column', marginTop: "20px" }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
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
                                            {/* Title */}
                                            <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                {/* Left: Title */}
                                                <Col>
                                                    <h3
                                                        style={{
                                                            fontSize: '16px',
                                                            fontWeight: 500,
                                                            marginLeft: 10,
                                                            color: theme === 'dark' ? '#fff' : '#111827',
                                                        }}
                                                    >
                                                        Accounts
                                                    </h3>
                                                </Col>
                                            </Row>

                                            {/* Carousel Navigation */}
                                            <div style={{ padding: 0, marginBottom: 10 }}>{renderCarouselNav()}</div>

                                            {/* Tabs for Grid Sections */}
                                            <Tabs activeKey={activeTab} onChange={handleSlideChange} renderTabBar={() => <></>}>
                                                <Tabs.TabPane key="1">
                                                    <AgGridReact
                                                        className="custom-grid"
                                                        rowData={rowData?.filter((each) => each.profit > 0)}
                                                        columnDefs={columnDefs1}
                                                        defaultColDef={{
                                                            ...defaultColDef,
                                                            wrapText: true,
                                                            autoHeight: true,
                                                            cellStyle: {
                                                                whiteSpace: 'normal',
                                                                lineHeight: '1.4',
                                                                paddingTop: '4px',
                                                                paddingBottom: '4px',
                                                                fontSize: '13px',
                                                            },
                                                        }}
                                                        gridOptions={{
                                                            ensureDomOrder: false,
                                                            suppressRowClickSelection: true,
                                                            suppressClipboardPaste: false,
                                                            enableRangeSelection: true,
                                                        }}
                                                        rowGroupPanelShow="always"
                                                        suppressAggFuncInHeader={true}
                                                        groupIncludeFooter={true}
                                                        groupIncludeTotalFooter={true}
                                                        autoGroupColumnDef={autoGroupColumnDefProfit}
                                                        domLayout="auto"
                                                        getRowHeight={() => 32}
                                                        onCellClicked={onCellClicked}
                                                        enableCharts={true}
                                                        enableRangeSelection={true}
                                                        onGridReady={(params) => { window.__top5 = params.api; }}
                                                        onFilterChanged={onFilterChanged}
                                                    />
                                                </Tabs.TabPane>

                                                <Tabs.TabPane key="2">
                                                    <AgGridReact
                                                        className="custom-grid"
                                                        rowData={rowData?.filter((each) => each.profit < 0)}
                                                        columnDefs={columnDefs1}
                                                        defaultColDef={{
                                                            ...defaultColDef,
                                                            wrapText: true,
                                                            autoHeight: true,
                                                            cellStyle: {
                                                                whiteSpace: 'normal',
                                                                lineHeight: '1.4',
                                                                paddingTop: '4px',
                                                                paddingBottom: '4px',
                                                                fontSize: '13px',
                                                            },
                                                        }}
                                                        gridOptions={{
                                                            ensureDomOrder: false,
                                                            suppressRowClickSelection: true,
                                                            suppressClipboardPaste: false,
                                                            enableRangeSelection: true,
                                                        }}
                                                        rowGroupPanelShow="always"
                                                        suppressAggFuncInHeader={true}
                                                        groupIncludeFooter={true}
                                                        groupIncludeTotalFooter={true}
                                                        autoGroupColumnDef={autoGroupColumnDefLoss}
                                                        domLayout="auto"
                                                        getRowHeight={() => 32}
                                                        onCellClicked={onCellClicked}
                                                        enableCharts={true}
                                                        enableRangeSelection={true}
                                                        onGridReady={(params) => { window.__top5 = params.api; }}
                                                        onFilterChanged={onFilterChanged}
                                                    />
                                                </Tabs.TabPane>

                                                <Tabs.TabPane key="3">
                                                    <AgGridReact
                                                        className="custom-grid"
                                                        rowData={Object.values(
                                                            byAccountNumber?.reduce((acc, curr) => {
                                                                (acc[curr.specifiedDate] = acc[curr.specifiedDate] || []).push(curr);
                                                                return acc;
                                                            }, {})
                                                        )
                                                            .flatMap(records =>
                                                                records
                                                                    .sort((a, b) => b.spend - a.spend)
                                                                    .slice(0, 5)
                                                            )}
                                                        columnDefs={columnDefs1}
                                                        defaultColDef={{
                                                            ...defaultColDef,
                                                            wrapText: true,
                                                            autoHeight: true,
                                                            cellStyle: {
                                                                whiteSpace: 'normal',
                                                                lineHeight: '1.4',
                                                                paddingTop: '4px',
                                                                paddingBottom: '4px',
                                                                fontSize: '13px',
                                                            },
                                                        }}
                                                        gridOptions={{
                                                            ensureDomOrder: false,
                                                            suppressRowClickSelection: true,
                                                            suppressClipboardPaste: false,
                                                            enableRangeSelection: true,
                                                        }}
                                                        rowGroupPanelShow="always"
                                                        suppressAggFuncInHeader={true}
                                                        groupIncludeFooter={true}
                                                        groupIncludeTotalFooter={true}
                                                        autoGroupColumnDef={autoGroupColumnDefProfit}
                                                        domLayout="auto"
                                                        getRowHeight={() => 32}
                                                        onCellClicked={onCellClicked}
                                                        enableCharts={true}
                                                        enableRangeSelection={true}
                                                        onGridReady={(params) => { window.__top5 = params.api; }}
                                                        onFilterChanged={onFilterChanged}
                                                    />
                                                </Tabs.TabPane>

                                                <Tabs.TabPane key="4">
                                                    <AgGridReact
                                                        className="custom-grid"
                                                        rowData={Object.values(
                                                            byAccountNumber?.reduce((acc, curr) => {
                                                                (acc[curr.specifiedDate] = acc[curr.specifiedDate] || []).push(curr);
                                                                return acc;
                                                            }, {})
                                                        )
                                                            .flatMap(records =>
                                                                records
                                                                    .sort((a, b) => b.estimated_revenue - a.estimated_revenue)
                                                                    .slice(0, 5)
                                                            )}
                                                        columnDefs={columnDefs1}
                                                        defaultColDef={{
                                                            ...defaultColDef,
                                                            wrapText: true,
                                                            autoHeight: true,
                                                            cellStyle: {
                                                                whiteSpace: 'normal',
                                                                lineHeight: '1.4',
                                                                paddingTop: '4px',
                                                                paddingBottom: '4px',
                                                                fontSize: '13px',
                                                            },
                                                        }}
                                                        gridOptions={{
                                                            ensureDomOrder: false,
                                                            suppressRowClickSelection: true,
                                                            suppressClipboardPaste: false,
                                                            enableRangeSelection: true,
                                                        }}
                                                        rowGroupPanelShow="always"
                                                        suppressAggFuncInHeader={true}
                                                        groupIncludeFooter={true}
                                                        groupIncludeTotalFooter={true}
                                                        autoGroupColumnDef={autoGroupColumnDefProfit}
                                                        domLayout="auto"
                                                        getRowHeight={() => 32}
                                                        onCellClicked={onCellClicked}
                                                        enableCharts={true}
                                                        enableRangeSelection={true}
                                                        onGridReady={(params) => { window.__top5 = params.api; }}
                                                        onFilterChanged={onFilterChanged}
                                                    />
                                                </Tabs.TabPane>

                                                <Tabs.TabPane key="5">
                                                    <AgGridReact
                                                        className="custom-grid"
                                                        rowData={Object.values(
                                                            byAccountNumber?.reduce((acc, curr) => {
                                                                (acc[curr.specifiedDate] = acc[curr.specifiedDate] || []).push(curr);
                                                                return acc;
                                                            }, {})
                                                        )
                                                            .flatMap(records =>
                                                                records
                                                                    .sort((a, b) => b.profit - a.profit)
                                                                    .slice(0, 5)
                                                            )}
                                                        columnDefs={columnDefs1}
                                                        defaultColDef={{
                                                            ...defaultColDef,
                                                            wrapText: true,
                                                            autoHeight: true,
                                                            cellStyle: {
                                                                whiteSpace: 'normal',
                                                                lineHeight: '1.4',
                                                                paddingTop: '4px',
                                                                paddingBottom: '4px',
                                                                fontSize: '13px',
                                                            },
                                                        }}
                                                        gridOptions={{
                                                            ensureDomOrder: false,
                                                            suppressRowClickSelection: true,
                                                            suppressClipboardPaste: false,
                                                            enableRangeSelection: true,
                                                        }}
                                                        rowGroupPanelShow="always"
                                                        suppressAggFuncInHeader={true}
                                                        groupIncludeFooter={true}
                                                        groupIncludeTotalFooter={true}
                                                        autoGroupColumnDef={autoGroupColumnDefProfit}
                                                        domLayout="auto"
                                                        getRowHeight={() => 32}
                                                        onCellClicked={onCellClicked}
                                                        enableCharts={true}
                                                        enableRangeSelection={true}
                                                        onGridReady={(params) => { window.__top5 = params.api; }}
                                                        onFilterChanged={onFilterChanged}
                                                    />
                                                </Tabs.TabPane>
                                            </Tabs>
                                        </div>
                                    </Col>
                                </Row>


                                <Row style={{ display: 'flex', flexDirection: 'column', marginTop: "20px" }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
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

                                            <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                {/* Left: Title */}
                                                <Col>
                                                    <h3
                                                        style={{
                                                            fontSize: '16px',
                                                            fontWeight: 500,
                                                            marginLeft: 10,
                                                            color: theme === 'dark' ? '#fff' : '#111827',
                                                        }}
                                                    >
                                                        Top 5 campaigns
                                                    </h3>
                                                </Col>
                                            </Row>
                                            {/* Carousel Nav */}
                                            <div style={{ padding: 0, marginBottom: 10 }}>{renderCarouselNav1()}</div>

                                            {/* Tab Content */}
                                            <Tabs activeKey={activeTab1} onChange={handleSlideChange1} renderTabBar={() => <></>}>
                                                {/* Tab 1: Top Spend */}
                                                <Tabs.TabPane key="1">
                                                    <AgGridReact
                                                        className="custom-grid"
                                                        domLayout="autoHeight"
                                                        rowData={top5Campaigns}
                                                        columnDefs={columnDefs2}
                                                        enableCharts={true}
                                                        enableRangeSelection={true}
                                                        defaultColDef={{
                                                            ...defaultColDef,
                                                            wrapText: true,
                                                            autoHeight: true,
                                                            enableCharts: true, 
                                                            cellStyle: {
                                                                whiteSpace: 'normal',
                                                                lineHeight: '1.4',
                                                                paddingTop: '4px',
                                                                paddingBottom: '4px',
                                                                fontSize: '13px',
                                                            },
                                                        }}
                                                        gridOptions={{
                                                            ensureDomOrder: false,
                                                            suppressRowClickSelection: true,
                                                            suppressClipboardPaste: false,
                                                            enableRangeSelection: true,
                                                        }}
                                                        rowGroupPanelShow="always"
                                                        suppressAggFuncInHeader={true}
                                                        groupIncludeFooter={true}
                                                        groupIncludeTotalFooter={true}
                                                        autoGroupColumnDef={autoGroupColumnDefCampaigns}
                                                        getRowHeight={() => 32}
                                                        onCellClicked={onCellClicked}
                                                        onGridReady={(params) => { window.__top5 = params.api; }}

                                                        onFilterChanged={onFilterChanged}
                                                    />
                                                </Tabs.TabPane>

                                                {/* Tab 2: Top Revenue */}
                                                <Tabs.TabPane key="2">
                                                    <AgGridReact
                                                        className="custom-grid"
                                                        domLayout="auto"
                                                        rowData={top5RevenueCampaigns}
                                                        columnDefs={columnDefs2}
                                                        defaultColDef={{
                                                            ...defaultColDef,
                                                            wrapText: true,
                                                            autoHeight: true,
                                                            enableCharts: true, 
                                                            cellStyle: {
                                                                whiteSpace: 'normal',
                                                                lineHeight: '1.4',
                                                                paddingTop: '4px',
                                                                paddingBottom: '4px',
                                                                fontSize: '13px',
                                                            },
                                                        }}
                                                        gridOptions={{
                                                            ensureDomOrder: false,
                                                            suppressRowClickSelection: true,
                                                            suppressClipboardPaste: false,
                                                            enableRangeSelection: true,
                                                        }}
                                                        rowGroupPanelShow="always"
                                                        suppressAggFuncInHeader={true}
                                                        groupIncludeFooter={true}
                                                        groupIncludeTotalFooter={true}
                                                        autoGroupColumnDef={autoGroupColumnDefCampaigns}
                                                        getRowHeight={() => 32}
                                                        onCellClicked={onCellClicked}
                                                        enableCharts={true}
                                                        enableRangeSelection={true}
                                                        onGridReady={(params) => { window.__top5 = params.api; }}

                                                        onFilterChanged={onFilterChanged}
                                                    />
                                                </Tabs.TabPane>

                                                {/* Tab 3: Top Profit */}
                                                <Tabs.TabPane key="3">
                                                    <AgGridReact
                                                        className="custom-grid"
                                                        domLayout="auto"
                                                        rowData={top5ProfitCampaigns}
                                                        columnDefs={columnDefs2}
                                                        defaultColDef={{
                                                            ...defaultColDef,
                                                            wrapText: true,
                                                            autoHeight: true,
                                                            cellStyle: {
                                                                whiteSpace: 'normal',
                                                                lineHeight: '1.4',
                                                                paddingTop: '4px',
                                                                paddingBottom: '4px',
                                                                fontSize: '13px',
                                                            },
                                                        }}
                                                        gridOptions={{
                                                            ensureDomOrder: false,
                                                            suppressRowClickSelection: true,
                                                            suppressClipboardPaste: false,
                                                            enableRangeSelection: true,
                                                        }}
                                                        rowGroupPanelShow="always"
                                                        suppressAggFuncInHeader={true}
                                                        groupIncludeFooter={true}
                                                        groupIncludeTotalFooter={true}
                                                        autoGroupColumnDef={autoGroupColumnDefCampaigns}
                                                        getRowHeight={() => 32}
                                                        onCellClicked={onCellClicked}
                                                        enableCharts={true}
                                                        enableRangeSelection={true}
                                                        onGridReady={(params) => { window.__top5 = params.api; }}
                                                        onFilterChanged={onFilterChanged}
                                                    />
                                                </Tabs.TabPane>

                                                {/* Tab 4: Overall Profit */}
                                                <Tabs.TabPane key="4">
                                                    <AgGridReact
                                                        className="custom-grid"
                                                        domLayout="auto"
                                                        rowData={overAllProfitCampaigns}
                                                        columnDefs={columnDefs2}
                                                        defaultColDef={{
                                                            ...defaultColDef,
                                                            wrapText: true,
                                                            autoHeight: true,
                                                            cellStyle: {
                                                                whiteSpace: 'normal',
                                                                lineHeight: '1.4',
                                                                paddingTop: '4px',
                                                                paddingBottom: '4px',
                                                                fontSize: '13px',
                                                            },
                                                        }}
                                                        gridOptions={{
                                                            ensureDomOrder: false,
                                                            suppressRowClickSelection: true,
                                                            suppressClipboardPaste: false,
                                                            enableRangeSelection: true,
                                                        }}
                                                        rowGroupPanelShow="always"
                                                        suppressAggFuncInHeader={true}
                                                        groupIncludeFooter={true}
                                                        groupIncludeTotalFooter={true}
                                                        autoGroupColumnDef={autoGroupColumnDefCampaigns}
                                                        getRowHeight={() => 32}
                                                        onCellClicked={onCellClicked}
                                                        enableCharts={true}
                                                        enableRangeSelection={true}
                                                        onGridReady={(params) => { window.__top5 = params.api; }}
                                                        onFilterChanged={onFilterChanged}
                                                    />
                                                </Tabs.TabPane>

                                                {/* Tab 5: Overall Loss */}
                                                <Tabs.TabPane key="5">
                                                    <AgGridReact
                                                        className="custom-grid"
                                                        domLayout="auto"
                                                        rowData={overAllLossCampaigns}
                                                        columnDefs={columnDefs2}
                                                        defaultColDef={{
                                                            ...defaultColDef,
                                                            wrapText: true,
                                                            autoHeight: true,
                                                            cellStyle: {
                                                                whiteSpace: 'normal',
                                                                lineHeight: '1.4',
                                                                paddingTop: '4px',
                                                                paddingBottom: '4px',
                                                                fontSize: '13px',
                                                            },
                                                        }}
                                                        gridOptions={{
                                                            ensureDomOrder: false,
                                                            suppressRowClickSelection: true,
                                                            suppressClipboardPaste: false,
                                                            enableRangeSelection: true,
                                                        }}
                                                        rowGroupPanelShow="always"
                                                        suppressAggFuncInHeader={true}
                                                        groupIncludeFooter={true}
                                                        groupIncludeTotalFooter={true}
                                                        autoGroupColumnDef={autoGroupColumnDefCampaigns}
                                                        getRowHeight={() => 32}
                                                        onCellClicked={onCellClicked}
                                                        enableCharts={true}
                                                        enableRangeSelection={true}
                                                        onGridReady={(params) => { window.__top5 = params.api; }}
                                                        onFilterChanged={onFilterChanged}
                                                    />
                                                </Tabs.TabPane>
                                            </Tabs>
                                        </div>
                                    </Col>
                                </Row>


                                <Row style={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
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
                                            {/* Title Row */}
                                            <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Col>
                                                    <h3
                                                        style={{
                                                            fontSize: '16px',
                                                            fontWeight: 500,
                                                            marginLeft: 10,
                                                            color: theme === 'dark' ? '#fff' : '#111827',
                                                        }}
                                                    >
                                                        Insights by Domain & Agency
                                                    </h3>
                                                </Col>
                                            </Row>

                                            {/* Carousel Nav */}
                                            <div style={{ padding: '0px' }}>
                                                <RenderCarouselNav3 />
                                            </div>

                                            {/* Tab Navigation */}
                                            <Tabs activeKey={activeTab3} onChange={handleTabChange3} renderTabBar={() => <></>}>
                                                {/* Domain View */}
                                                <Tabs.TabPane key="1">
                                                    <AgGridReact
                                                        className="custom-grid"
                                                        domLayout="auto"
                                                        rowData={domainWiseData}
                                                        columnDefs={columnDefs3}
                                                        defaultColDef={{
                                                            ...defaultColDef,
                                                            wrapText: true,
                                                            autoHeight: true,
                                                            cellStyle: {
                                                                whiteSpace: 'normal',
                                                                lineHeight: '1.4',
                                                                paddingTop: '4px',
                                                                paddingBottom: '4px',
                                                                fontSize: '13px',
                                                            },
                                                        }}
                                                        gridOptions={{
                                                            ensureDomOrder: false,
                                                            suppressRowClickSelection: true,
                                                            suppressClipboardPaste: false,
                                                            enableRangeSelection: true,
                                                        }}
                                                        rowGroupPanelShow="always"
                                                        suppressAggFuncInHeader={true}
                                                        groupIncludeTotalFooter={true}
                                                        autoGroupColumnDef={autoGroupColumnDefDomain}
                                                        getRowHeight={() => 32}
                                                        onCellClicked={onCellClicked}
                                                        enableCharts={true}
                                                        enableRangeSelection={true}
                                                        onGridReady={(params) => { window.__top5 = params.api; }}
                                                        onFilterChanged={onFilterChanged}
                                                    />
                                                </Tabs.TabPane>

                                                {/* Agency View */}
                                                <Tabs.TabPane key="2">
                                                    <AgGridReact
                                                        className="custom-grid"
                                                        domLayout="auto"
                                                        rowData={agencyNameReport}
                                                        columnDefs={columnDefs4}
                                                        defaultColDef={{
                                                            ...defaultColDef,
                                                            wrapText: true,
                                                            autoHeight: true,
                                                            cellStyle: {
                                                                whiteSpace: 'normal',
                                                                lineHeight: '1.4',
                                                                paddingTop: '4px',
                                                                paddingBottom: '4px',
                                                                fontSize: '13px',
                                                            },
                                                        }}
                                                        gridOptions={{
                                                            groupDefaultExpanded: -1,
                                                            ensureDomOrder: false,
                                                            suppressRowClickSelection: true,
                                                            suppressClipboardPaste: false,
                                                            enableRangeSelection: true,
                                                        }}
                                                        rowGroupPanelShow="always"
                                                        suppressAggFuncInHeader={true}
                                                        groupIncludeTotalFooter={true}
                                                        autoGroupColumnDef={autoGroupColumnDefAgency}
                                                        getRowHeight={() => 32}
                                                        onCellClicked={onCellClicked}
                                                        enableCharts={true}
                                                        enableRangeSelection={true}
                                                        onGridReady={(params) => { window.__top5 = params.api; }}
                                                        onFilterChanged={onFilterChanged}
                                                    />
                                                </Tabs.TabPane>
                                            </Tabs>
                                        </div>
                                    </Col>
                                </Row>

                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* } */}
        </div>
    );
};

export default Dashboard;
