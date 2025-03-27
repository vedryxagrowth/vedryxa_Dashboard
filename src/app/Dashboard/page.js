// pages/dashboard.js
"use client"
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
// pages/index.js
import React from 'react';
import axios from 'axios';
import { Select, Tag, theme, Button,Carousel,Tabs, Tooltip, message } from 'antd';
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
    "TONIC1":"FB_Tonic1",
    "Domain Active":"FB_DomainActive",
    "ENKI":"FB_Enki",
    "System1":"FB_System1",
    "Domain_Active":"Newsbreak_DA",
};

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
    "FB_Tonic1": "Facebook_Tonic1"
}

import { DatePicker, Space, ConfigProvider, Flex, Spin, Skeleton } from 'antd';
import { generate } from '@ant-design/colors'; // For dynamic color generation
import { ReloadOutlined } from "@ant-design/icons";
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

import { LoadingOutlined } from '@ant-design/icons';
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
    'DST'
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
        carouselRef.current.goTo(parseInt(index)-1)
        console.log(index);
        if(index == 2){
            setIsDomain("Domain");
        }
    };

    const handleSlideChange = (from, to) => {
        setActiveTab((parseInt(to)+1).toString());
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
                className="custom-tabs" // Apply custom CSS class
                style={{
                backgroundColor: '#f0f2f5',
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
                field:"network",
                resizable: true,
                sortable: true,
                hide: true, // Hide column as it's grouped
                rowGroup: true,
                enableRowGroup: true,
                minWidth: 150,
                flex:6,

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
                      <div style={{display:'flex', alignItems:'center'}}>
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
                aggFunc:spender,
                valueFormatter:currencyFormatter,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: "revenue",
                resizable: true,
                sortable: true,
                minWidth: 150,
                aggFunc:spender,
                valueFormatter:currencyFormatter,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            { 
                field: 'profit', 
                resizable: true,
                sortable: true,
                minWidth: 150,
                aggFunc:spender,
                cellClassRules: {
                    'font-red': p => p.value < 0
                },
                valueFormatter:currencyFormatter,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: "margin",
                headerName:"Margin(%)",
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
                field:'domain',
                headerName:'Domain',
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
                aggFunc:spender,
                valueFormatter:currencyFormatter,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: "revenue",
                resizable: true,
                sortable: true,
                minWidth: 150,
                aggFunc:spender,
                valueFormatter:currencyFormatter,
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
                    'font-red': p => p.value < 0
                },
                aggFunc:spender,
                valueFormatter:currencyFormatter,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                field: "margin",
                headerName:'Margin(%)',
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

    useEffect(()=>{
        if(isDomain === "Domain"){
            functionForFetchingRevenuePartnerDomainData();
        }
    },[isDomain]);

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
        placeholder: 'Select Projects',
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
        <div style={{ width: '100%', margin:'0px', padding:'0px'}}>
            <Space direction="vertical" style={{ width: '100%', paddingBottom: "1%" }}>
                {/* Filters */}
                <Row gutter={[16, 16]}>
                    <Col xs={8} sm={8} md={5} lg={4}>
                        <Space
                            direction="vertical"
                            style={{
                                width: '100%',
                            }}
                        >
                            <Select {...sharedProps} {...selectProps} />
                        </Space>
                    </Col>
                    <Col xs={16} sm={16} md={10} lg={8}>
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
                    <Col xs={12} sm={12} md={4} lg={3}>
                        <Select
                            placeholder="Select Timezone"
                            onChange={onChangeTime}
                            value={timeZone}
                            options={timezones.map((item) => ({ value: item, label: item }))}
                        />
                    </Col>
                    <Col xs={12} sm={12} md={2}>
                        <Button onClick={onClickSubmit} style={{backgroundColor: '#C7F39A',}}>
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
            <Carousel dots={false}  ref={carouselRef} beforeChange={handleSlideChange}>
                <div>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '75vh' }}>
                            <Spin indicator={<LoadingOutlined spin />} size="large" />
                        </div>
                    ) : (
                        revenuePartnerData.length > 0 && (
                            <div
                                className={`ag-theme-alpine ${gridThemeClass}`}
                                style={{ width: '100%', height: '70vh' }}
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

    if(userdetails?.role === "Revenue_Partner"){
        return(
            <RevenuePartnerDashboard />
        )
    };

    const transformData = (data) => {
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => {
                // Check if the value is an array and if it contains objects
                if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                    // Convert array of objects to array of accountNumbers
                    return [key, value.map(obj => ({accountNumber:obj.accountNumber, accountName: obj.accountName}))];
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
    console.log(transformedData, "transformedData");
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
    // const toggleTheme = () => {
    //     setDarkMode(!darkMode);
    // };
    const [time, setTime] = useState('UTC');
    
    const [agencyNameReport, setAgencyNameReport] = useState([]);

    const [byAccountNumber, setByAccountNumber] = useState([]);

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

    const [chartData, setChartData] = useState({ dates: [], newDates: [], spend: [], revenue: [], profit: [], margin: [] });

    const [chartDataByDate, setChartDataByDate] = useState({ datesByDate: [], spendByDate: [], revenueByDate: [], profitByDate: [], marginByDate: [] });

    const [rowData, setRowData] = useState([]);
    const [top5Campaigns, setTop5Campaigns] = useState([]);
    const [top5RevenueCampaigns, setTop5RevenueCampaigns] = useState([]);
    const [top5ProfitCampaigns, setTop5ProfitCampaigns] = useState([]);
    const [overAllProfitCampaigns, setOverAllProfitCampaigns] = useState([]);
    const [overAllLossCampaigns, setOverAllLossCampaigns] = useState([]);
    const [selectedDates, setSelectedDates] = useState(defaultDates);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [domainWiseData, setDomainWiseData] = useState([]);
    const { apiClient } = useTokenContext();
    // const [collectionName, setCollectionName] = useState([]);

    // const functionalCall = (data) => {
    //     setData(data);
    // }

    const [searchValue, setSearchValue] = useState('');

    const handleSearchChange = (value) => {
        setSearchValue(value.toLowerCase());  // Store lowercase search term
    };

    // const handleSelectAllChange = (checked, category) => {
    //     if (checked) {
    //         setSearchValue(""); // Reset search value when network is selected
    //     }
    //     // Your existing logic for handling "Select All"
    // };

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
        if(collectionName?.length === 1 && collectionName[0] === "Facebook_Mnet" && time === "UTC"){
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
        else{
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

    function getAverageEstimatedCpc(fullData) {
        // Filter items that have a valid 'cpc' value
        const validCpcItems = fullData?.filter(item => item.cpc);

        // Calculate the total sum of 'cpc'
        const total = validCpcItems?.reduce((sum, item) => {
            return sum + parseFloat(item.cpc);
        }, 0);

        // Calculate the average, and round to 2 decimal places
        const average = validCpcItems?.length > 0 ? (total / validCpcItems?.length) : 0;

        return Math.round(average * 100) / 100;
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
                if (key === "Newsbreak_DA"){
                    newKey = "Newsbreak_DomainActive"
                }else if (key === "FB_DomainActive"){
                    newKey = "Facebook_DActive_Names"
                }
                else{ newKey = "Facebook_" + splitKey[1];}
        
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
        try{
            response = await apiClient.post(`/Dashboard?timezone=${time}&start_date=${startDate}&end_date=${endDate}`, { formattedData: [transformedObject] });

        }catch(error){
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
                const campaignKey = obj?.campaign_name;
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
                        Date: dateKey,
                        spend: obj.spend ? parseFloat(obj.spend) : 0,
                        estimated_revenue: obj?.estimated_revenue ? parseFloat(obj?.estimated_revenue) : 0,
                        fbLeads: obj.fbLeads ? parseInt(obj?.fbLeads) : 0,
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
                account.rpc = parseFloat(((account.estimated_revenue/account.conversions)*100)/100).toFixed(2),
                account.cpl = parseFloat(((account.spend/account.fbLeads)*100)/100).toFixed(2) || 0
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

        const marginByDate = sortedDataByDate.map(d => d.estimated_revenue !== 0 ?Math.round((((d.estimated_revenue - d.spend) / d.estimated_revenue) * 100) * 100) / 100 : 0);

        setChartDataByDate({ datesByDate, spendByDate, revenueByDate, profitByDate, marginByDate, rpcByDate, cplByDate });

        console.log(groupedData);

        function groupDataByDomainAndAccount(data, dateField) {
            console.log(dateField);
            const DomainGroupedData = data?.reduce((acc, obj) => {
              const { domain, accountNumber, spend, estimated_revenue, revenuePartner, MediaBuyerName, Holder } = obj;
              const specifiedDate = obj[dateField]; // Dynamically get the date based on the field
          
              // Create a unique key for grouping by domain, specifiedDate, and accountNumber
              const key = `${specifiedDate}-${domain}-${accountNumber}`;
          
              if (!acc[key]) {
                acc[key] = {
                  specifiedDate,
                  domain,
                  accountNumber,
                  revenuePartner,   // Store the revenuePartner for the group
                  MediaBuyerName,   // Store the MediaBuyerName for the group
                  Holder,           // Store the Holder for the group
                  spend: 0,
                  estimated_revenue: 0,
                };
              }
          
              // Sum the fields (spend, estimated_revenue) based on the new grouping
              acc[key].spend += spend;
              acc[key].estimated_revenue += estimated_revenue;
          
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
              const {  spend, estimated_revenue, BMName, AgencyName } = obj;
              const specifiedDate = obj[dateField]; // Dynamically get the date based on the field
          
              // Create a unique key for grouping by domain, specifiedDate, and accountNumber
              const key = `${specifiedDate}-${BMName}-${AgencyName}`;
          
              if (!acc[key]) {
                acc[key] = {
                  specifiedDate,
                  BMName,
                  AgencyName,
                  spend: 0,
                  estimated_revenue: 0,
                };
              }
          
              // Sum the fields (spend, estimated_revenue) based on the new grouping
              acc[key].spend += spend;
              acc[key].estimated_revenue += estimated_revenue;
          
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

        const margin = sortedData.map(d => d.estimated_revenue !== 0 ?Math.round((((d.estimated_revenue - d.spend) / d.estimated_revenue) * 100) * 100) / 100 : 0);

        // console.log(revenue);

        setChartData({ dates, newDates, spend, revenue, profit, margin, rpc, cpl });
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
        if(startDate !== '' && endDate !== ''){
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

    const debouncedUpdateSelectedItems = useCallback(
        debounce((category, checkedValues) => {
            setSelectedItems((prevSelected) => ({
                ...prevSelected,  // Spread the previous selected items to retain selections for other categories
            [category]: checkedValues.map(value => ({
                accountNumber: value  // Store the accountNumber in the selected items array for the category
            }))
            }));
            //   setSkeletonLoading(false); // Optionally stop loading
        }, 1000), // Adjust debounce time (1000ms in this example)
        []
    );

    const handleGroupChange = (checkedValues, category) => {
        setSkeletonLoading(true);
        // Call the debounced function to update the state
        debouncedUpdateSelectedItems(category, checkedValues);
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

    // Render checkboxes for categories dynamically based on the first Select values
    const renderInnerSelects = (theme) => {
        return firstSelectValues.map((category) => {
            const allSelected =
                transformedData[category]?.length === selectedItems[category]?.length;

            // Filter transformedData based on search query
            const filteredData = transformedData[category]?.filter(item =>
                item.accountNumber?.toString().toLowerCase().includes(searchValue)
            ) || [];

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
                            {category}
                            <Checkbox
                                checked={allSelected}
                                onChange={(e) => handleSelectAllChange(e.target.checked, category)}
                                style={{ marginLeft: '15px' }}
                                className={theme === 'dark' ? 'checkbox-dark' : 'checkbox-light'}
                            />
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
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '600' }}>{accountNumber}</span>
                                                <span>{item.accountName || ''}</span>
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
                return Number(RPC.toFixed(2));
            }
        }
    
        return 0;
    };

    const autoGroupColumnDefProfit = {
        headerName: 'AccountNumber',
        minWidth: 210,
        sortable: true,
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
        headerName: 'AccountNumber',
        minWidth: 200,
        sortable: true,
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
        headerName: 'Campaign Name',
        minWidth: 200,
        sortable: true,
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
                                const url = `/DailyAndCampaignHistory/CampaignHistory/${campaignNameToPass.replace(/\//g, "*").replace(/-/g, "^")}-${accountNumberToPassToReports}-${time}-${collectionName}`;
                                console.log(url);
    
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

    const [columnDefs] = useState([
        {
            headerName: 'Project Name',
            field: "revenuePartner",
            resizable: true,
            sortable: true,
            width: 100,
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
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
        }, // Group by Holder
        { field: 'accountNumber', headerName: 'AccountNumber',
        resizable: true,
        width: 150,
        sortable: true,
        hide: true, // Hide column as it's grouped
        rowGroup: true,
        enableRowGroup: true,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu', },
        {field:'specifiedDate', headerName:'Date',
            minWidth: 115,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',},
        {
            headerName: 'User',
            field: "mediaBuyerName",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        }, // Display Media Buyer name
        {
            field: "spend",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        }, // Summing Spend column
        {
            headerName: 'Revenue',
            field: "estimated_revenue",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        }, // Summing Revenue column
        {
            field: "profit",
            aggFunc: spender,
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        }, // Custom aggregation for Profit
        {
            field: 'rpc',
            headerName: 'RPC',
            valueGetter: avgRpcCpl,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            // valueFormatter: rpcCplFormatter,
        },
        {
            field: 'cpl',
            headerName: 'CPL',
            valueGetter: avgCpl,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            // valueFormatter: rpcCplFormatter,
        }, 
        {
            field: 'conversions',
            headerName: 'Conv',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            // valueFormatter: rpcCplFormatter,
        }, 
        {
            field: 'fbLeads',
            headerName: 'FbLeads',
            aggFunc: spender,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            // valueFormatter: rpcCplFormatter,
        }, 

    ]);

    const items = [
        { key: '1', label: 'Profit', content: 'Content for Profit Accounts' },
        { key: '2', label: 'Loss', content: 'Content for Loss Accounts' },
        { key: '3', label: 'Top 5 Spend', content: 'Content for Top 5 Spend Accounts' },
        { key: '4', label: 'Top 5 Revenue', content: 'Content for Top 5 Revenue Accounts' },
        { key: '5', label: 'Top 5 Profit', content: 'Content for Top 5 Profit Accounts' },
    ];

    const items1 = [
        { key: '1', label: 'Spend', content: 'Content for Top 5 Spend Campaigns' },
        { key: '2', label: 'Revenue', content: 'Content for Top 5 Revenue Campaigns' },
        { key: '3', label: 'Profit', content: 'Content for Top 5 Profit Campaigns' },
        { key: '4', label: 'All-Profit', content: 'Content for Top 5 Revenue Campaigns' },
        { key: '5', label: 'All-Loss', content: 'Content for Top 5 Profit Campaigns' },
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
        setActiveTab((parseInt(to)+1).toString());
        // console.log((parseInt(to)+1).toString());
    };

    const handleCarouselChange = (index) => {
        setActiveTab(index);
        // console.log(index);
        // console.log(parseInt(index)-1);
        carouselRef.current.goTo(parseInt(index)-1)
        
    };

    const handleSlideChange1 = (from, to) => {
        // console.log(to, "to");
        setActiveTab1((parseInt(to)+1).toString());
        // console.log((parseInt(to)+1).toString());
    };
    const handleSlideChange2 = (from, to) => {
        // console.log(to, "to");
        setActiveTab2((parseInt(to)+1).toString());
        // console.log((parseInt(to)+1).toString());
    };

    const handleSlideChange3 = (from, to) => {
        // console.log(to, "to");
        setActiveTab3((parseInt(to)+1).toString());
        // console.log((parseInt(to)+1).toString());
    };

    const handleCarouselChange1 = (index) => {
        setActiveTab1(index);
        // console.log(index);
        // console.log(parseInt(index)-1);
        carouselRef1.current.goTo(parseInt(index)-1)
        
    };

    const handleCarouselChange2 = (index) => {
        setActiveTab2(index);
        // console.log(index);
        // console.log(parseInt(index)-1);
        carouselRef2.current.goTo(parseInt(index)-1)
        
    };

    const handleCarouselChange3 = (index) => {
        setActiveTab3(index);
        // console.log(index);
        // console.log(parseInt(index)-1);
        carouselRef3.current.goTo(parseInt(index)-1)
        
    };

    const renderCarouselNav1 = () => (
        <StickyBox offsetTop={64} offsetBottom={20} style={{ zIndex: 1, padding: '0px', margin: '0px', paddingLeft: '0px' }}>
            <Tabs
                activeKey={activeTab1}
                onChange={(key) => handleCarouselChange1(key)}
                items={items1.map((item) => ({
                key: item.key,
                label: item.label,
                }))}
                className="custom-tabs" // Apply custom CSS class
                style={{
                backgroundColor: '#f0f2f5',
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
                    className="custom-tabs" // Apply custom CSS class
                    style={{
                    backgroundColor: '#f0f2f5',
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
        <StickyBox offsetTop={64} offsetBottom={20} style={{ zIndex: 1, padding: '0px', margin: '0px' }}>
            <Tabs
                activeKey={activeTab2}
                onChange={handleCarouselChange2}
                items={items2.map((item) => ({
                    key: item.key,
                    label: item.label,
                }))}
                className="custom-tabs"
                style={{
                    backgroundColor: '#f0f2f5',
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
                className="custom-tabs"
                style={{
                    backgroundColor: '#f0f2f5',
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

    const [columnDefs1] = useState([
        {
            headerName: "AccountNumber",
            field: "accountNumber",
            resizable: true,
            sortable: true,
            hide: true, // Hide column as it's grouped
            rowGroup: true,
            enableRowGroup: true,
            

        }, // Group by Network
        {field:'specifiedDate', headerName:'Date',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',},
        {
            field: "spend",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        }, // Summing Spend column
        {
            headerName: 'Revenue',
            field: "estimated_revenue",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        }, // Summing Revenue column
        {
            field: "profit",
            aggFunc: spender,
            sort: 'desc',
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        {
            headerName: 'Project Name',
            field: "revenuePartner",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        }, // Group by Holder
        {
            field: "holder",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        {
            field: "mediaBuyerName", headerName:'User',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
    ]);
    

    const [columnDefs2] = useState([
        {   field: 'campaign_name', headerName:'CampaignName', minWidth: 430, suppressAutoSize: true,  
            resizable: true,
            sortable: true,
            hide: true, // Hide column as it's grouped
            rowGroup: true,
            enableRowGroup: true,
        },
        {
            field: "accountNumber", minWidth:170,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',

        }, // Group by Network
        {field:'Date',
        minWidth: 112,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',},
        {
            field: "spend",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            minWidth: 108,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
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
        }, // Summing Revenue column
        {
            field: "profit",
            aggFunc: spender,
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            valueFormatter: currencyFormatter,
            minWidth: 108,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        {
            headerName: 'Project Name',
            field: "revenuePartner",
            minWidth: 150,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        }, // Group by Holder
        {
            field: "holder",
            minWidth: 125,// Group by MediaBuyerName,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        {
            field: "mediaBuyerName", headerName:'User',
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
    ]);
    const [columnDefs3] = useState([
        {   
            field: 'domain', minWidth: 200, suppressAutoSize: true,  
            resizable: true,
            sortable: true,
            hide: true, // Hide column as it's grouped
            rowGroup: true,
            enableRowGroup: true,
        },
        {
            field: "accountNumber", minWidth:180,
            resizable: true,
            sortable: true,
            hide: true, // Hide column as it's grouped
            rowGroup: true,
            enableRowGroup: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',

        }, // Group by Network
        {field:'specifiedDate', headerName:"Date",
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',},
        {
            field: "spend",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
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
        }, // Summing Revenue column
        {
            field: "profit",
            aggFunc: spender,
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            valueFormatter: currencyFormatter,
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        {
            headerName: 'Project Name',
            field: "revenuePartner",
            minWidth: 180,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        }, // Group by Holder
        {
            field: "Holder",
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        {
            field: "MediaBuyerName", headerName:'User',
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
    ]);
    const [columnDefs4] = useState([
        {   
            field: 'BMName', minWidth: 200, suppressAutoSize: true,  
            resizable: true,
            sortable: true,
            hide: true, // Hide column as it's grouped
            rowGroup: true,
            enableRowGroup: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        },
        {
            field: "AgencyName", minWidth:180,
            resizable: true,
            sortable: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            // hide: true, // Hide column as it's grouped
            // rowGroup: true,
            // enableRowGroup: true,

        }, // Group by Network
        {field:'specifiedDate', headerName:"Date",
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',},
        {
            field: "spend",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
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
        }, // Summing Revenue column
        {
            field: "profit",
            aggFunc: spender,
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            valueFormatter: currencyFormatter,
            minWidth: 125,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
        }
    ]);

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
        headerName: 'Campaign Name', // Display name for the grouped column
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
      };
      const autoGroupColumnDefAgency = {
        headerName: 'BMName', // Display name for the grouped column
        minWidth: 250, // Set width for grouped rows
        resizable: true, // Enable resizing
        sortable: true, // Enable sorting
        cellRendererParams: {
          suppressCount: true, // Suppress row count in the grouped column
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






    // console.log(rowData?.map(each=> each.profit > 0));
    // console.log(chartData.revenue, "data");
    return (
        <div>
            {/* {userdetails?.role === "Revenue_Partner" && <div><h1>hello</h1></div>}
            {userdetails?.role !== "Revenue_Partner" &&  */}
            <div>
            {rendering === true ? <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large"/></div> : (
                <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: '40%' }}>
                        <h1 style={{  color: theme === 'dark' ? 'white' : 'black' , fontSize: '22px', textAlign: 'start' }}>
                            Welcome, {userdetails?.userName} !
                        </h1>
                    </div>
                    <div style={{ width: '60%', display: 'flex', justifyContent: 'flex-end', height: '50px' }}>
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
                                    className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
                                    options={Object.keys(transformedData).map((category) => ({
                                        value: category,
                                        label: category,
                                    }))}
                                />
                            </Col>
    
                            <Col span={6}>
            <Select
                mode="multiple"
                showSearch
                onSearch={handleSearchChange}  // Update searchValue dynamically
                style={{ width: '100%' }}
                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
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
                                    className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                                    placeholder="Select Timezone"
                                    dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                    optionFilterProp="label"
                                    value={time}
                                    options={timezones.map((item) => ({
                                        value: item,
                                        label: item,
                                    }))}
                                />
                            </Col>
    
                            <Col span={8}>
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
                                        style={{
                                            width: '100%',
                                            backgroundColor: theme === 'dark' ? '#555' : undefined,
                                            color: theme === 'dark' ? 'white' : undefined,
                                        }}
                                        dropdownClassName={theme === 'dark' ? 'dark-theme-dropdown' : ''}
                                        renderExtraFooter={() => (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '8px', paddingTop: '5px', paddingBottom: '5px' }}>
                                            <Button
                                                style={{ marginRight: '8px' }} // Adds spacing between buttons
                                                onClick={onClickCloseButton} // Close the picker
                                            >
                                                Close
                                            </Button>
                                            <Button
                                                style={{ backgroundColor: '#C7F39A' }} 
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
                                    icon={<ReloadOutlined />} 
                                    style={{ float: "right", marginLeft: "10px", backgroundColor: '#C7F39A' }} 
                                    onClick={refreshUsers}  // Call refresh function when clicked
                                >
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </div>
    
                {skeletonLoading ? (
                    <Skeleton active paragraph={{ rows: 15 }} />
                ) : (
                    <div style={{ height: '100%', paddingBottom: '40px' }}>
                        <Row gutter={24} style={{ marginTop: '20px' }} justify="space-between">
                            <Col flex="1">
                                <Card>
                                    <Statistic
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        height: '12px',
                                                        width: '12px',
                                                        backgroundColor: '#A3F254',
                                                        borderRadius: '50%',
                                                        marginRight: '8px',
                                                    }}
                                                ></span>
                                                <span style={{ color: '#A3F254', fontWeight: 600 }}>Revenue</span>
                                            </div>
                                        }
                                        value={data.length > 0 ? revenue1.current : 0}
                                        prefix="$"
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                </Card>
                            </Col>
    
                            <Col flex="1">
                                <Card>
                                    <Statistic
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        height: '12px',
                                                        width: '12px',
                                                        backgroundColor: '#EC7117',
                                                        borderRadius: '50%',
                                                        marginRight: '8px',
                                                    }}
                                                ></span>
                                                <span style={{ color: '#EC7117', fontWeight: 600 }}>Profit</span>
                                            </div>
                                        }
                                        value={data.length > 0 ? profit1.current : 0}
                                        prefix="$"
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                </Card>
                            </Col>
    
                            <Col flex="1">
                                <Card>
                                    <Statistic
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        height: '12px',
                                                        width: '12px',
                                                        backgroundColor: '#5C58EE',
                                                        borderRadius: '50%',
                                                        marginRight: '8px',
                                                    }}
                                                ></span>
                                                <span style={{ color: '#5C58EE', fontWeight: 600 }}>Spend</span>
                                            </div>
                                        }
                                        value={data.length > 0 ? spend1.current : 0}
                                        prefix="$"
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                </Card>
                            </Col>
    
                            <Col flex="1">
                                <Card>
                                    <Statistic
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        height: '12px',
                                                        width: '12px',
                                                        backgroundColor: '#EC7117',
                                                        borderRadius: '50%',
                                                        marginRight: '8px',
                                                    }}
                                                ></span>
                                                <span style={{ color: '#EC7117', fontWeight: 600 }}>Leads</span>
                                            </div>
                                        }
                                        value={data.length > 0 ? leads1.current : 0}
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                </Card>
                            </Col>
    
                            <Col flex="1">
                                <Card>
                                    <Statistic
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        height: '12px',
                                                        width: '12px',
                                                        backgroundColor: '#5C58EE',
                                                        borderRadius: '50%',
                                                        marginRight: '8px',
                                                    }}
                                                ></span>
                                                <span style={{ color: '#5C58EE', fontWeight: 600 }}>Conversions</span>
                                            </div>
                                        }
                                        value={data.length > 0 ? conversions1.current : 0}
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                </Card>
                            </Col>
                        </Row>
    
                        <Row gutter={24} style={{ marginTop: '20px' }} justify="space-between">
                            <Col flex="1">
                                <Card>
                                    <Statistic
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        height: '12px',
                                                        width: '12px',
                                                        backgroundColor: '#A3F254',
                                                        borderRadius: '50%',
                                                        marginRight: '8px',
                                                    }}
                                                ></span>
                                                <span style={{ color: '#A3F254', fontWeight: 600 }}>NCPL</span>
                                            </div>
                                        }
                                        value={data.length > 0 ? ncpl1.current : 0}
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                </Card>
                            </Col>
    
                            <Col flex="1">
                                <Card>
                                    <Statistic
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        height: '12px',
                                                        width: '12px',
                                                        backgroundColor: '#EC7117',
                                                        borderRadius: '50%',
                                                        marginRight: '8px',
                                                    }}
                                                ></span>
                                                <span style={{ color: '#EC7117', fontWeight: 600 }}>CPL</span>
                                            </div>
                                        }
                                        value={data.length > 0 ? cpl1.current !== Infinity ? cpl1.current: 0 : 0}
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                </Card>
                            </Col>
    
                            <Col flex="1">
                                <Card>
                                    <Statistic
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        height: '12px',
                                                        width: '12px',
                                                        backgroundColor: '#5C58EE',
                                                        borderRadius: '50%',
                                                        marginRight: '8px',
                                                    }}
                                                ></span>
                                                <span style={{ color: '#5C58EE', fontWeight: 600 }}>CTR</span>
                                            </div>
                                        }
                                        value={data.length > 0 ? ctr1.current : 0}
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                </Card>
                            </Col>
    
                            <Col flex="1">
                                <Card>
                                    <Statistic
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        height: '12px',
                                                        width: '12px',
                                                        backgroundColor: '#EC7117',
                                                        borderRadius: '50%',
                                                        marginRight: '8px',
                                                    }}
                                                ></span>
                                                <span style={{ color: '#EC7117', fontWeight: 600 }}>CPC</span>
                                            </div>
                                        }
                                        value={data.length > 0 ? cpc1.current : 0}
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                </Card>
                            </Col>
    
                            <Col flex="1">
                                <Card>
                                    <Statistic
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        height: '12px',
                                                        width: '12px',
                                                        backgroundColor: '#5C58EE',
                                                        borderRadius: '50%',
                                                        marginRight: '8px',
                                                    }}
                                                ></span>
                                                <span style={{ color: '#5C58EE', fontWeight: 600 }}>RPC</span>
                                            </div>
                                        }
                                        value={data.length > 0 ? rpc1.current : 0}
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                </Card>
                            </Col>
                        </Row>
    
                        {/* <Row style={{ height: '400px', marginBottom: '10px', marginTop: '25px', padding: '0px', marginLeft:'0px', marginRight:'0px' }}>
                        <Line
                        data={{
                            labels: chartData.dates,
                            datasets: [
                            {
                                label: 'Spend',
                                data: chartData.spend,
                                borderColor: 'rgba(44, 144, 192, 1)',
                                backgroundColor: 'rgba(44, 144, 192, 0.2)',
                                fill: true,
                                hidden: true,
                                tension: 0.3
                            },
                            {
                                label: 'Revenue',
                                data: chartData.revenue,
                                borderColor: 'rgba(99, 200, 99, 1)',
                                backgroundColor: 'rgba(99, 200, 99, 0.2)',
                                fill: true,
                                hidden: true,
                                tension: 0.3
                            },
                            {
                                label: 'RPC',
                                data: chartData.rpc,
                                borderColor: 'rgba(255, 99, 132, 1)',
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                fill: true,
                                hidden: true,
                                tension: 0.3
                            },
                            {
                                label: 'CPL',
                                data: chartData.cpl,
                                borderColor: 'rgba(255, 159, 64, 1)',
                                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                                fill: true,
                                hidden: true,
                                tension: 0.3
                            },
                            {
                                label: 'Profit',
                                data: chartData.profit,
                                borderColor: 'rgba(255, 206, 86, 1)',
                                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                                fill: true,
                                tension: 0.3
                            },
                            {
                                label: 'Margin',
                                data: chartData.margin,
                                borderColor: 'rgba(153, 102, 255, 1)',
                                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                                fill: true,
                                hidden: true,
                                tension: 0.3
                            },
                            ],
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                            x: {
                                ticks: {
                                padding: 30,
                                },
                            },
                            y: {
                                beginAtZero: true,
                            },
                            },
                        }}
                        height={350}
                        />
                    </Row> */}
                        <div style={{padding:'0px', marginTop:'15px'}}>
                            <RenderCarouselNav2/>
                        </div>
                        <Carousel ref={carouselRef2} beforeChange={handleSlideChange2} dots={false}>
                            <div>
                                <Row
                                    style={{
                                        height: '400px',
                                        marginBottom: '10px',
                                        marginTop: '25px',
                                        padding: '0px',
                                        marginLeft: '0px',
                                        marginRight: '0px',
                                    }}
                                >
                                    <Line
                                        data={{
                                            labels: chartDataByDate.datesByDate, // X-axis labels (dates)
                                            datasets: [
                                            {
                                                label: 'Spend',
                                                data: chartDataByDate.spendByDate,
                                                borderColor: 'rgba(44, 144, 192, 1)',
                                                backgroundColor: 'rgba(44, 144, 192, 0.2)',
                                                fill: true,
                                                hidden: true,
                                                tension: 0.3,
                                                pointRadius: 5,
                                                pointHoverRadius: 8,
                                                pointBackgroundColor: 'rgba(44, 144, 192, 1)',
                                                pointHoverBackgroundColor: 'rgba(44, 144, 192, 1)',
                                            },
                                            {
                                                label: 'Revenue',
                                                data: chartDataByDate.revenueByDate,
                                                borderColor: 'rgba(99, 200, 99, 1)',
                                                backgroundColor: 'rgba(99, 200, 99, 0.2)',
                                                fill: true,
                                                hidden: true,
                                                tension: 0.3,
                                                pointRadius: 5,
                                                pointHoverRadius: 8,
                                                pointBackgroundColor: 'rgba(99, 200, 99, 1)',
                                                pointHoverBackgroundColor: 'rgba(99, 200, 99, 1)',
                                            },
                                            {
                                                label: 'RPC',
                                                data: chartDataByDate.rpcByDate,
                                                borderColor: 'rgba(255, 99, 132, 1)',
                                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                                fill: true,
                                                hidden: true,
                                                tension: 0.3,
                                                pointRadius: 5,
                                                pointHoverRadius: 8,
                                                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                                                pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
                                            },
                                            {
                                                label: 'CPL',
                                                data: chartDataByDate.cplByDate,
                                                borderColor: 'rgba(255, 159, 64, 1)',
                                                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                                                fill: true,
                                                hidden: true,
                                                tension: 0.3,
                                                pointRadius: 5,
                                                pointHoverRadius: 8,
                                                pointBackgroundColor: 'rgba(255, 159, 64, 1)',
                                                pointHoverBackgroundColor: 'rgba(255, 159, 64, 1)',
                                            },
                                            {
                                                label: 'Profit',
                                                data: chartDataByDate.profitByDate,
                                                borderColor: 'rgba(255, 206, 86, 1)',
                                                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                                                fill: true,
                                                tension: 0.3,
                                                pointRadius: 5,
                                                pointHoverRadius: 8,
                                                pointBackgroundColor: 'rgba(255, 206, 86, 1)',
                                                pointHoverBackgroundColor: 'rgba(255, 206, 86, 1)',
                                            },
                                            {
                                                label: 'Margin',
                                                data: chartDataByDate.marginByDate,
                                                borderColor: 'rgba(153, 102, 255, 1)',
                                                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                                                fill: true,
                                                hidden: true,
                                                tension: 0.3,
                                                pointRadius: 5,
                                                pointHoverRadius: 8,
                                                pointBackgroundColor: 'rgba(153, 102, 255, 1)',
                                                pointHoverBackgroundColor: 'rgba(153, 102, 255, 1)',
                                            },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                            x: {
                                                ticks: {
                                                padding: 30,
                                                color: (context) => {
                                                    const label = chartDataByDate.datesByDate[context.index];
                                                    return getColorForValue(label);
                                                },
                                                },
                                                grid: {
                                                color: darkMode ? '#444' : '#e0e0e0',
                                                },
                                            },
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                callback: function (value) {
                                                    return value.toFixed(2);
                                                },
                                                color: darkMode ? '#fff' : '#000',
                                                },
                                                grid: {
                                                color: darkMode ? '#444' : '#e0e0e0',
                                                },
                                            },
                                            },
                                            plugins: {
                                            legend: {
                                                labels: {
                                                color: darkMode ? '#fff' : '#000',
                                                },
                                            },
                                            tooltip: {
                                                mode: 'index', // Ensure all datasets at this x-axis point are shown
                                                intersect: true, // Show tooltip only when hovering directly over a bubble/point
                                                callbacks: {
                                                label: function (tooltipItem) {
                                                    const index = tooltipItem.dataIndex;
                                                    const dataset = tooltipItem.dataset;
                                                    const value = dataset.data[index];
                                                    const datasetLabel = dataset.label || '';

                                                    // Return label with value and date
                                                    return `${datasetLabel}: ${value} (Date: ${chartDataByDate.datesByDate[index]})`;
                                                },
                                                },
                                                displayColors: true, // Enable color box for each dataset
                                                boxWidth: 15, // Adjust the width of the color box
                                                boxHeight: 15, // Adjust the height of the color box
                                            },
                                            },
                                        }}
                                        height={350}
                                    />
                                </Row>
                            </div>
                            <div>
                                <Row
                                    style={{
                                        height: '400px',
                                        marginBottom: '10px',
                                        marginTop: '25px',
                                        padding: '0px',
                                        marginLeft: '0px',
                                        marginRight: '0px',
                                    }}
                                >
                                    <Line
                                        data={{
                                            labels: chartData?.dates, // X-axis labels (dates)
                                            datasets: [
                                            {
                                                label: 'Spend',
                                                data: chartData?.spend,
                                                borderColor: 'rgba(44, 144, 192, 1)',
                                                backgroundColor: 'rgba(44, 144, 192, 0.2)',
                                                fill: true,
                                                hidden: true,
                                                tension: 0.3,
                                                pointRadius: 5,
                                                pointHoverRadius: 8,
                                                pointBackgroundColor: 'rgba(44, 144, 192, 1)',
                                                pointHoverBackgroundColor: 'rgba(44, 144, 192, 1)',
                                            },
                                            {
                                                label: 'Revenue',
                                                data: chartData?.revenue,
                                                borderColor: 'rgba(99, 200, 99, 1)',
                                                backgroundColor: 'rgba(99, 200, 99, 0.2)',
                                                fill: true,
                                                hidden: true,
                                                tension: 0.3,
                                                pointRadius: 5,
                                                pointHoverRadius: 8,
                                                pointBackgroundColor: 'rgba(99, 200, 99, 1)',
                                                pointHoverBackgroundColor: 'rgba(99, 200, 99, 1)',
                                            },
                                            {
                                                label: 'RPC',
                                                data: chartData.rpc,
                                                borderColor: 'rgba(255, 99, 132, 1)',
                                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                                fill: true,
                                                hidden: true,
                                                tension: 0.3,
                                                pointRadius: 5,
                                                pointHoverRadius: 8,
                                                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                                                pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
                                            },
                                            {
                                                label: 'CPL',
                                                data: chartData?.cpl,
                                                borderColor: 'rgba(255, 159, 64, 1)',
                                                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                                                fill: true,
                                                hidden: true,
                                                tension: 0.3,
                                                pointRadius: 5,
                                                pointHoverRadius: 8,
                                                pointBackgroundColor: 'rgba(255, 159, 64, 1)',
                                                pointHoverBackgroundColor: 'rgba(255, 159, 64, 1)',
                                            },
                                            {
                                                label: 'Profit',
                                                data: chartData?.profit,
                                                borderColor: 'rgba(255, 206, 86, 1)',
                                                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                                                fill: true,
                                                tension: 0.3,
                                                pointRadius: 5,
                                                pointHoverRadius: 8,
                                                pointBackgroundColor: 'rgba(255, 206, 86, 1)',
                                                pointHoverBackgroundColor: 'rgba(255, 206, 86, 1)',
                                            },
                                            {
                                                label: 'Margin',
                                                data: chartData?.margin,
                                                borderColor: 'rgba(153, 102, 255, 1)',
                                                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                                                fill: true,
                                                hidden: true,
                                                tension: 0.3,
                                                pointRadius: 5,
                                                pointHoverRadius: 8,
                                                pointBackgroundColor: 'rgba(153, 102, 255, 1)',
                                                pointHoverBackgroundColor: 'rgba(153, 102, 255, 1)',
                                            },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                            x: {
                                                ticks: {
                                                padding: 30,
                                                color: (context) => {
                                                    const label = chartData?.dates[context.index];
                                                    return getColorForValue(label);
                                                },
                                                },
                                                grid: {
                                                color: darkMode ? '#444' : '#e0e0e0',
                                                },
                                            },
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                callback: function (value) {
                                                    return value.toFixed(2);
                                                },
                                                color: darkMode ? '#fff' : '#000',
                                                },
                                                grid: {
                                                color: darkMode ? '#444' : '#e0e0e0',
                                                },
                                            },
                                            },
                                            plugins: {
                                            legend: {
                                                labels: {
                                                color: darkMode ? '#fff' : '#000',
                                                },
                                            },
                                            tooltip: {
                                                mode: 'index', // Ensure all datasets at this x-axis point are shown
                                                intersect: true, // Show tooltip only when hovering directly over a bubble/point
                                                callbacks: {
                                                label: function (tooltipItem) {
                                                    const index = tooltipItem.dataIndex;
                                                    const dataset = tooltipItem.dataset;
                                                    const value = dataset.data[index];
                                                    const datasetLabel = dataset.label || '';

                                                    // Return label with value and date
                                                    return `${datasetLabel}: ${value} (Date: ${chartData?.newDates[index]})`;
                                                },
                                                },
                                                displayColors: true, // Enable color box for each dataset
                                                boxWidth: 15, // Adjust the width of the color box
                                                boxHeight: 15, // Adjust the height of the color box
                                            },
                                            },
                                        }}
                                        height={350}
                                    />
                                </Row>
                            </div>
                        </Carousel>
                        

                        
    
                        <Row style={{ display: 'flex', flexDirection: 'column' }}>
                            <Col>
                                <h2>
                                    Overall Report
                                </h2>
    
                            </Col>
                            {/* <Col>
                            <div className="ag-theme-alpine" style={{ width: '100%', height: '400px' }}>
                                
                                <AgGridReact
                                rowData={rowData}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                rowGroupPanelShow="always"
                                suppressAggFuncInHeader={true}
                                groupIncludeFooter={true}
                                groupIncludeTotalFooter={true}
                                />
                            </div>
                        </Col> */}
                            <Col>
                                <div
                                    className={`ag-theme-alpine ${gridThemeClass}`}
                                    style={{ width: '100%', height: '400px' }}
                                >
                                    <AgGridReact
                                        rowData={rowData}
                                        columnDefs={columnDefs}
                                        defaultColDef={defaultColDef}
                                        gridOptions={{
                                            ensureDomOrder: false,
                                            suppressRowClickSelection: true,
                                            suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                            enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                        }}
                                        autoGroupColumnDef={autoGroupColumnDefOverAllReport}
                                        rowGroupPanelShow="always"
                                        suppressAggFuncInHeader={true}
                                        groupIncludeFooter={true}
                                        groupIncludeTotalFooter={true}
                                    />
                                </div>
                            </Col>
    
                        </Row>
                        <h2 style={{marginTop: "15px"}}>Accounts</h2>
                        <div style={{padding:'0px', margin:'0px'}}>
                            {renderCarouselNav()}
                        </div>
                        <Carousel ref={carouselRef} beforeChange={handleSlideChange} dots={false}>
                            <div>
                                <Row style={{ display: 'flex', flexDirection: 'column', paddingTop:'10px' }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
                                            style={{ width: '100%', height: '400px' }}
                                        >
                                            <AgGridReact
                                                rowData={rowData?.filter((each) => each.profit > 0)}
                                                columnDefs={columnDefs1}
                                                defaultColDef={defaultColDef}
                                                gridOptions={{
                                                    ensureDomOrder: false,
                                                    suppressRowClickSelection: true,
                                                    suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                    enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                                }}
                                                rowGroupPanelShow="always"
                                                suppressAggFuncInHeader={true}
                                                groupIncludeFooter={true}
                                                groupIncludeTotalFooter={true}
                                                autoGroupColumnDef={autoGroupColumnDefProfit}
                                            />
                                        </div>
                                    </Col>
            
                                </Row>
                            </div>
                            <div>
                                <Row style={{ display: 'flex', flexDirection: 'column', paddingTop:'10px' }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
                                            style={{ width: '100%', height: '400px' }}
                                        >             <AgGridReact
                                                rowData={rowData?.filter(each => each.profit < 0)}
                                                columnDefs={columnDefs1}
                                                defaultColDef={defaultColDef}
                                                gridOptions={{
                                                    ensureDomOrder: false,
                                                    suppressRowClickSelection: true,
                                                    suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                    enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                                }}
                                                rowGroupPanelShow="always"
                                                suppressAggFuncInHeader={true}
                                                groupIncludeFooter={true}
                                                groupIncludeTotalFooter={true}
                                                autoGroupColumnDef={autoGroupColumnDefLoss}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div>
                                <Row style={{ display: 'flex', flexDirection: 'column', paddingTop:'10px' }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
                                            style={{ width: '100%', height: '400px' }}
                                        >
                                            <AgGridReact
                                                rowData={Object.values(
                                                    byAccountNumber?.reduce((acc, curr) => {
                                                      (acc[curr.specifiedDate] = acc[curr.specifiedDate] || []).push(curr);
                                                      return acc;
                                                    }, {})
                                                  ).flatMap(records =>
                                                    records
                                                      .sort((a, b) => b.spend - a.spend) // Sort by spend (descending)
                                                      .slice(0, 5) // Get top 5 records per date
                                                  )}
                                                columnDefs={columnDefs1}
                                                defaultColDef={defaultColDef}
                                                gridOptions={{
                                                    ensureDomOrder: false,
                                                    suppressRowClickSelection: true,
                                                    suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                    enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                                }}
                                                rowGroupPanelShow="always"
                                                suppressAggFuncInHeader={true}
                                                groupIncludeFooter={true}
                                                groupIncludeTotalFooter={true}
                                                autoGroupColumnDef={autoGroupColumnDefProfit}
                                            />
                                        </div>
                                    </Col>
            
                                </Row>
                            </div>
                            <div>
                                <Row style={{ display: 'flex', flexDirection: 'column', paddingTop:'10px' }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
                                            style={{ width: '100%', height: '400px' }}
                                        >
                                            <AgGridReact
                                                rowData={Object.values(
                                                    byAccountNumber?.reduce((acc, curr) => {
                                                      (acc[curr.specifiedDate] = acc[curr.specifiedDate] || []).push(curr);
                                                      return acc;
                                                    }, {})
                                                  ).flatMap(records =>
                                                    records
                                                      .sort((a, b) => b.estimated_revenue - a.estimated_revenue) // Sort by spend (descending)
                                                      .slice(0, 5) // Get top 5 records per date
                                                  )}
                                                columnDefs={columnDefs1}
                                                defaultColDef={defaultColDef}
                                                gridOptions={{
                                                    ensureDomOrder: false,
                                                    suppressRowClickSelection: true,
                                                    suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                    enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                                }}
                                                rowGroupPanelShow="always"
                                                suppressAggFuncInHeader={true}
                                                groupIncludeFooter={true}
                                                groupIncludeTotalFooter={true}
                                                autoGroupColumnDef={autoGroupColumnDefProfit}
                                            />
                                        </div>
                                    </Col>
            
                                </Row>
                            </div>
                            <div>
                                <Row style={{ display: 'flex', flexDirection: 'column', paddingTop:'10px' }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
                                            style={{ width: '100%', height: '400px' }}
                                        >
                                            <AgGridReact
                                                rowData={Object.values(
                                                    byAccountNumber?.reduce((acc, curr) => {
                                                      (acc[curr.specifiedDate] = acc[curr.specifiedDate] || []).push(curr);
                                                      return acc;
                                                    }, {})
                                                  ).flatMap(records =>
                                                    records
                                                      .sort((a, b) => b.profit - a.profit) // Sort by spend (descending)
                                                      .slice(0, 5) // Get top 5 records per date
                                                  )}
                                                columnDefs={columnDefs1}
                                                defaultColDef={defaultColDef}
                                                gridOptions={{
                                                    ensureDomOrder: false,
                                                    suppressRowClickSelection: true,
                                                    suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                    enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                                }}
                                                rowGroupPanelShow="always"
                                                suppressAggFuncInHeader={true}
                                                groupIncludeFooter={true}
                                                groupIncludeTotalFooter={true}
                                                autoGroupColumnDef={autoGroupColumnDefProfit}
                                            />
                                        </div>
                                    </Col>
            
                                </Row>
                            </div>
                        </Carousel>

                        <h2 style={{marginTop: "15px"}}>Top 5 Campaigns</h2>

                        <div style={{padding:'0px', margin:'0px'}}>
                            {renderCarouselNav1()}
                        </div>
    
                        <Carousel ref={carouselRef1} beforeChange={handleSlideChange1} dots={false}>
                            <div>
                                <Row style={{ display: 'flex', flexDirection: 'column', paddingTop:'10px' }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
                                            style={{ width: '100%', height: '400px' }}
                                        >             <AgGridReact
                                                rowData={top5Campaigns}
                                                columnDefs={columnDefs2}
                                                defaultColDef={defaultColDef}
                                                gridOptions={{
                                                    ensureDomOrder: false,
                                                    suppressRowClickSelection: true,
                                                    suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                    enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                                }}
                                                rowGroupPanelShow="always"
                                                suppressAggFuncInHeader={true}
                                                groupIncludeFooter={true}
                                                groupIncludeTotalFooter={true}
                                                autoGroupColumnDef={autoGroupColumnDefCampaigns}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div>
                                <Row style={{ display: 'flex', flexDirection: 'column', paddingTop:'10px' }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
                                            style={{ width: '100%', height: '400px' }}
                                        >             <AgGridReact
                                                rowData={top5RevenueCampaigns}
                                                columnDefs={columnDefs2}
                                                defaultColDef={defaultColDef}
                                                gridOptions={{
                                                    ensureDomOrder: false,
                                                    suppressRowClickSelection: true,
                                                    suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                    enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                                }}
                                                rowGroupPanelShow="always"
                                                suppressAggFuncInHeader={true}
                                                groupIncludeFooter={true}
                                                groupIncludeTotalFooter={true}
                                                autoGroupColumnDef={autoGroupColumnDefCampaigns}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div>
                                <Row style={{ display: 'flex', flexDirection: 'column', paddingTop:'10px' }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
                                            style={{ width: '100%', height: '400px' }}
                                        >   <AgGridReact
                                                rowData={top5ProfitCampaigns}
                                                columnDefs={columnDefs2}
                                                defaultColDef={defaultColDef}
                                                gridOptions={{
                                                    ensureDomOrder: false,
                                                    suppressRowClickSelection: true,
                                                    suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                    enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                                }}
                                                rowGroupPanelShow="always"
                                                suppressAggFuncInHeader={true}
                                                groupIncludeFooter={true}
                                                groupIncludeTotalFooter={true}
                                                autoGroupColumnDef={autoGroupColumnDefCampaigns}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div>
                                <Row style={{ display: 'flex', flexDirection: 'column', paddingTop:'10px' }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
                                            style={{ width: '100%', height: '400px' }}
                                        >             <AgGridReact
                                                rowData={overAllProfitCampaigns}
                                                columnDefs={columnDefs2}
                                                defaultColDef={defaultColDef}
                                                gridOptions={{
                                                    ensureDomOrder: false,
                                                    suppressRowClickSelection: true,
                                                    suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                    enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                                }}
                                                rowGroupPanelShow="always"
                                                suppressAggFuncInHeader={true}
                                                groupIncludeFooter={true}
                                                groupIncludeTotalFooter={true}
                                                autoGroupColumnDef={autoGroupColumnDefCampaigns}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div>
                                <Row style={{ display: 'flex', flexDirection: 'column', paddingTop:'10px' }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
                                            style={{ width: '100%', height: '400px' }}
                                        >             <AgGridReact
                                                rowData={overAllLossCampaigns}
                                                columnDefs={columnDefs2}
                                                defaultColDef={defaultColDef}
                                                gridOptions={{
                                                    ensureDomOrder: false,
                                                    suppressRowClickSelection: true,
                                                    suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                    enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                                }}
                                                rowGroupPanelShow="always"
                                                suppressAggFuncInHeader={true}
                                                groupIncludeFooter={true}
                                                groupIncludeTotalFooter={true}
                                                autoGroupColumnDef={autoGroupColumnDefCampaigns}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Carousel>
                        
                        <div style={{padding:'0px', marginTop:'15px'}}>
                            <RenderCarouselNav3/>
                        </div>
                        <Carousel ref={carouselRef3} beforeChange={handleSlideChange3} dots={false}>
                            <div>
                                <Row style={{ display: 'flex', flexDirection: 'column', paddingTop:'10px' }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
                                            style={{ width: '100%', height: '400px' }}
                                        >             <AgGridReact
                                                rowData={domainWiseData}
                                                columnDefs={columnDefs3}
                                                defaultColDef={defaultColDef}
                                                gridOptions={{
                                                    ensureDomOrder: false,
                                                    suppressRowClickSelection: true,
                                                    suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                    enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                                }}
                                                // rowGroupPanelShow="always"
                                                suppressAggFuncInHeader={true}
                                                // groupIncludeFooter={true}
                                                groupIncludeTotalFooter={true}
                                                autoGroupColumnDef={autoGroupColumnDefDomain}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div>
                                <Row style={{ display: 'flex', flexDirection: 'column', paddingTop:'10px' }}>
                                    <Col>
                                        <div
                                            className={`ag-theme-alpine ${gridThemeClass}`}
                                            style={{ width: '100%', height: '400px' }}
                                        >           <AgGridReact
                                                        rowData={agencyNameReport}
                                                        columnDefs={columnDefs4}
                                                        defaultColDef={defaultColDef}
                                                        gridOptions={{
                                                            groupDefaultExpanded: -1, 
                                                            ensureDomOrder: false,
                                                            suppressRowClickSelection: true,
                                                            suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                                            enableRangeSelection: true,// Expands all groups by default
                                                        }}
                                                        // rowGroupPanelShow="always"
                                                        suppressAggFuncInHeader={true}
                                                        rowGroupPanelShow="always"
                                                        // groupIncludeFooter={true}
                                                        groupIncludeTotalFooter={true}
                                                        autoGroupColumnDef={autoGroupColumnDefAgency}
                                                    />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Carousel>
                        <Row></Row>
    
    
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
