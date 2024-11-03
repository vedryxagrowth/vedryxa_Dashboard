"use client"
import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import moment from 'moment-timezone';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useTokenContext } from '../../../components/parent'
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Spin, Row, Col } from 'antd';
Chart.register(...registerables);
import debounce from 'lodash.debounce';

export default function CampaignAndAccount({ params }) {

    const { userdetails } = useTokenContext();

    console.log(userdetails, "userDetails");

    const user = userdetails?.email;

    const [columnDefs, setColumnStructure] = useState([]);

    const [isLoading, setLoading] = useState(true);
    const [dailyData, setdailyData] = useState([]);
    const [chartData, setChartData] = useState({ dates: [], spend: [], revenue: [], profit: [], margin: [] });
    const { theme } = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
    const [darkMode, setDarkMode] = useState(false);
    const paramsData = ((params.CampaignName).split("-"));
    const decodedString = decodeURIComponent(paramsData[0]);
    const accountNumber = paramsData[1];
    const timeZone = paramsData[2];
    const network = paramsData[3]
    console.log(decodedString, "decode");
    console.log(accountNumber);
    console.log(timeZone);
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
        DST: 'DSTDate'
    };

    const getMargin = (params) => {
        if (params.data !== undefined) {
            const { revenue, spend } = params.data;

            if (revenue !== "0.00" || revenue !== undefined) {
                const RPC = ((revenue - spend) / revenue) * 100;
                if (RPC === Infinity || isNaN(RPC) || RPC === -Infinity) {
                    return `0`;
                }
                return `${Math.round(RPC * 100) / 100}`;

            }
        }
        if (params.node.aggData !== undefined) {
            const { revenue, spend } = params.node.aggData;
            if (revenue !== "0.00" || revenue !== undefined) {
                const RPC = ((revenue - spend) / revenue) * 100;
                if (RPC === Infinity || isNaN(RPC) || RPC === -Infinity) {
                    return `0`;
                }
                return `${Math.round(RPC * 100) / 100}`;

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
                return `${Number(RPC.toFixed(2))}`;

            }
        }
        if (params.node.aggData !== undefined) {
            const { impressions, fbclicks } = params.node.aggData;
            if (impressions !== 0) {
                const RPC = (fbclicks / impressions) * 100;
                return `${Number(RPC.toFixed(2))}`;
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
                    return `0`;
                }
                return `${Math.round(RPC * 100) / 100}`;

            }
        }
        if (params.node.aggData !== undefined) {
            const { revenue, spend } = params.node.aggData;
            if (revenue !== "0.00" || revenue !== undefined) {
                const RPC = ((revenue - spend) / spend) * 100;
                if (RPC === Infinity || isNaN(RPC) || RPC === -Infinity) {
                    return `0`;
                }
                return `${Math.round(RPC * 100) / 100}`;

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

    const token = localStorage.getItem("token")

    const functionCallForUserColumnStructure = async () => {
        const fetchData = await axios.get(`https://prodapis.adsgoat.in/api/singleUserData?email=${user}`);
        // const data = await fetchData.json();
        const mainData = fetchData.data;
        console.log(mainData.columnStructure, "columnStructure");
        const filteredData = mainData.columnStructure.filter((each) => each !== "fb-hour" && each !== "mnet-hour" && each !== "timezone" && each !== "actions" );
        console.log(filteredData);
        setColumnStructure(getColumnDefs(filteredData));
        // setRowStructure(mainData.rows); 
    }

    const getHistoryData = async () => {
        // const fetchData = await fetch(`http://localhost:8000/MnetCampaignDailyHistory?accountNumber=${accountNumber}&timezone=${timeZone}&campaignName=${decodedString}`);
        // const data = await fetchData.json();
        // const mainData = await data;
        const fetchData = await axios.get(`https://prodapis.adsgoat.in/DailyCampaignHistory?campaignName=${decodedString}&accountNumber=${accountNumber}&timezone=${timeZone}&network=${network}`, {
            headers: {
                Authorization: token,
            },
        });
        // console.log(`https://prodapis.adsgoat.in/LiveAdsetHistory?adsetName=${decodedString}&accountNumber=${accountNumber}&timezone=${timeZone}&network=${network}`, "url");
        const url = `http://localhost:8000/MnetLiveCampaignHistory?adsetName=${decodedString}&accountNumber=${accountNumber}&timezone=${timeZone}`

        const mainData = fetchData.data;
        console.log(mainData);
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
                rpc = !isNaN(rpc) ? rpc : 0;
                ncpl = !isNaN(ncpl) ? ncpl : 0;
                fMargin = !isNaN(fMargin) ? `${fMargin}%` : '0%';
                return (
                    {
                        campaignName: eachData.campaign_name,
                        date: eachData[specifiedTimeZone],
                        adsetName: eachData.adsetName,
                        spend: (eachData.spend).toString(),
                        revenue: mainRvenue,
                        profit: profit.toString(),
                        margin: margin,
                        rpc: rpc.toString(),
                        cpl: cpl.toString(),
                        ncpl: ncpl.toString(),
                        roi: roi,
                        cpc: (eachData.cpc).toString(),
                        fbleads: (eachData.fbLeads).toString(),
                        fbclicks: (eachData.fbClicks).toString(),
                        impressions: (eachData.impressions).toString(),
                        conversions: conversions.toString(),
                        fmargin: fMargin,
                        ctr: ctr,
                        adsetId: eachData.adset_id,
                        campaignId: eachData.campaign_id,


                    }
                )
            })
            : null;
        setdailyData(filteredData);
        setLoading(false);
        const dates = filteredData.map(d => d.date);
        const spend = filteredData.map(d => d.spend);
        const revenue = filteredData.map(d => d.revenue);
        const profit = filteredData.map(d => d.profit);
        const rpc = filteredData.map(d => d.rpc);
        const cpl = filteredData.map(d => d.cpl);

        const margin = filteredData.map(d => parseFloat(d.margin));

        setChartData({ dates, spend, revenue, profit, margin, rpc, cpl });
    }

    const debouncedFunctionCallForUserColumnStructure = debounce(async () => {
        await functionCallForUserColumnStructure();
      }, 1500);
      
      const debouncedFunctionCall = debounce(async () => {
        await getHistoryData();
      }, 3000);

    useEffect(() => {
        if (userdetails?.adAccounts) {
            const functionCall = async () => {
                await debouncedFunctionCallForUserColumnStructure();
                await debouncedFunctionCall();
            }
            functionCall();
        }
    }, [userdetails]);
    const pinnedBottomRowData = [
        {
            campaignName: 'Total',
            spend: dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0),
            revenue: dailyData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0),
            profit: dailyData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0),
            margin: `${(dailyData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)}%`,
            rpc: dailyData.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / dailyData.length,
            cpl: dailyData.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / dailyData.length,
            ncpl: dailyData.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / dailyData.length,
            fbleads: dailyData.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0),
            conversions: dailyData.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0),
            fmargin: `${(dailyData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)}%`,
            roi: `${(dailyData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100}%`,
            cpc: dailyData.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / dailyData.length,
            fbclicks: dailyData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0),
            impressions: dailyData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0),
            ctr: `${(dailyData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)}%`
        }
    ];

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

    const defaultColDef = {
        comparator: defaultComparator, // Use the universal comparator for sorting
        sortable: true,  // Enable sorting for all columns
        filter: true,    // Enable filtering for all columns
    };

    const columnDefsObject = {
        campaignname: {
            headerName: 'CampaignName', field: 'campaignName',
            // rowGroup: true,
            // filter: true,
            // hide: true,
            // resizable: true,
            // enableRowGroup: true,
            // groupDisplayType: 'group',
            width: 400,
        },
        date: { headerName: 'Date', field: 'date', width: 120, sort: 'asc',
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
        }
         },
        spend: {
            headerName: 'Spend', field: 'spend', width: 120,
            aggFunc: agFunc,
            valueFormatter: params => params.value ? Math.round(params.value * 100) / 100 : '',
            
        },
        revenue: {
            headerName: 'Revenue', field: 'revenue', width: 120,
            aggFunc: agFunc,
            valueFormatter: params => params.value ? Math.round(params.value * 100) / 100 : '',
            
        },
        profit: {
            headerName: 'Profit', field: 'profit', width: 120, cellClassRules: {
                'font-red': p => p.value < 0
            },
            aggFunc: agFunc,
            valueFormatter: params => params.value ? Math.round(params.value * 100) / 100 : '',
            
        },
        margin: {
            headerName: 'Margin', field: 'margin', valueGetter: getMargin, width: 120,
            
            valueFormatter: (params) => `${params.value}%`,

        },
        rpc: { headerName: 'Rpc', field: 'rpc', valueGetter: getRpc, width: 120,
            
         },
        cpl: { headerName: 'Cpl', field: 'cpl', valueGetter: getCpl, width: 120,
            
         },
        ncpl: { headerName: 'Ncpl', field: 'ncpl', valueGetter: getNcpl, width: 120,
            
         },
        fbleads: { headerName: 'FbLeads', field: 'fbleads', width: 150, aggFunc: agFunc,
            
         },
        conversions: { headerName: 'Conversions', field: 'conversions', width: 150, aggFunc: agFunc,
            
         },
        fmargin: { headerName: 'Fmargin', field: 'fmargin', valueGetter: getFmargin,
            
            valueFormatter: (params) => `${params.value}%`,
         },
        roi: { headerName: 'ROI', field: 'roi', valueGetter: getROI, width: 120,
            
            valueFormatter: (params) => `${params.value}%`,
         },
        cpc: {
            headerName: 'cpc', width: 120, field: 'cpc',
            aggFunc: (params) => {
                const sum = params.values.reduce((sum, value) => sum + parseFloat(value), 0);
                return sum / params.values.length;
            },
            valueFormatter: params => params.value !== undefined ? Math.round(params.value * 100) / 100 : '',
            

        },
        fbclicks: { headerName: 'FbClicks', field: 'fbclicks', width: 150, aggFunc: agFunc, 
        comparator: (valueA, valueB) => {
            // Default comparator for handling null or undefined values
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        },
        },
        impressions: { headerName: 'Impressions', field: 'impressions', width: 150, aggFunc: agFunc, 
        comparator: (valueA, valueB) => {
            // Default comparator for handling null or undefined values
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        },
        },
        ctr: { headerName: 'Ctr', field: 'ctr', valueGetter: getCtr,
            
            valueFormatter: (params) => `${params.value}%`,
         },
        adsetname: {
            headerName: 'AdsetName', field: 'adsetName',
            // resizeble: true,
            // sortable: true,
            width: 500,
            // hide: true,
            // // resizable:false,
            // rowGroup: true,
            // filter: true,
            // pinned: 'left',
            // enableRowGroup: true,
            // autoHeight: true, 
            
        },
        adsetid: { headerName: 'AdsetId', field: 'adsetId',
        
         },
        campaignid: { headerName: 'CampaignId', field: 'campaignId',
        
         }
    };

    return (
        <Row style={{display:'flex', flexDirection:'column'}}>
            <Col style={{width:'100%', display:'flex', alignItems:'center'}}>
                <div style={{width:'100%'}}>
                    <h3 style={{textAlign:'center'}}>{decodedString}</h3>
                </div>
                <div style={{width:'120px'}}>
                    <p>Timezone: <span style={{fontWeight:'bold'}}>{timeZone}</span></p>
                </div>
                    
            </Col>
            {/* <h1>{params.campaignAndAccount}hi</h1> */}
            <Col style={{ height: '400px', marginBottom: '10px' }}> {/* Container with fixed height */}
              {chartData.dates.length === 0 ? (<div style={{width:'100%', height:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}><Spin size="large" /></div>):
                (<Line
                    data={{
                        labels: chartData.dates,
                        datasets: [
                            {
                                label: 'Spend',
                                data: chartData.spend,
                                borderColor: 'rgba(75, 192, 192, 1)',        // Teal
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',   // Light Teal
                                fill: true,
                                hidden: true,
                                tension: 0.3
                            },
                            {
                                label: 'Revenue',
                                data: chartData.revenue,
                                borderColor: 'rgba(54, 162, 235, 1)',        // Blue
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',   // Light Blue
                                fill: true,
                                hidden: true,
                                tension: 0.3

                            },
                            {
                                label: 'RPC',
                                data: chartData.rpc,
                                borderColor: 'rgba(255, 99, 132, 1)',        // Red
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',   // Light Red
                                fill: true,
                                hidden: true,
                                tension: 0.3

                            },
                            {
                                label: 'CPL',
                                data: chartData.cpl,
                                borderColor: 'rgba(255, 159, 64, 1)',        // Orange
                                backgroundColor: 'rgba(255, 159, 64, 0.2)',   // Light Orange
                                fill: true,
                                hidden: true,
                                tension: 0.3

                            },
                            {
                                label: 'Profit',
                                data: chartData.profit,
                                borderColor: 'rgba(255, 206, 86, 1)',        // Yellow
                                backgroundColor: 'rgba(255, 206, 86, 0.2)',   // Light Yellow
                                fill: true,
                                tension: 0.3
                            },
                            {
                                label: 'Margin',
                                data: chartData.margin,
                                borderColor: 'rgba(153, 102, 255, 1)',       // Purple
                                backgroundColor: 'rgba(153, 102, 255, 0.2)',  // Light Purple
                                fill: true,
                                hidden: true,
                                tension: 0.3

                            }
                        ],

                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false, // Allow the chart to take the full height of its container
                        scales: {
                            x: {
                                ticks: {
                                    // autoSkip: false,
                                    // maxRotation: 0, // Keep labels horizontal
                                    padding: 30, // Increase padding between labels and the axis
                                },
                            },
                            y: {
                                beginAtZero: true, // Ensure the y-axis starts at zero
                            },
                        },
                    }}
                    height={350} // Set the height of the chart
                />)}
            </Col>
            <Col style={{ display: 'flex', width: '100%', marginLeft: '2%' }}>
                {/* Top 5 Dates with RPC */}
                <div style={{ width: '20%' }}>
                    <h3>Top 5 Dates with RPC</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ddd', padding: '3px' }}>Date</th>
                                <th style={{ border: '1px solid #ddd', padding: '2px' }}>RPC</th>
                                <th style={{ border: '1px solid #ddd', padding: '3px' }}>WeekDay</th>
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
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.date}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.rpc}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{moment(item.date).format('dddd')}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Top 5 Dates with Margin */}
                <div style={{ marginLeft: "1%", width: '20%' }}>
                    <h3>Top 5 Dates with Margin</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ddd', padding: '3px' }}>Date</th>
                                <th style={{ border: '1px solid #ddd', padding: '3px' }}>Margin</th>
                                <th style={{ border: '1px solid #ddd', padding: '3px' }}>WeekDay</th>
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
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.date}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.margin}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{moment(item.date).format('dddd')}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </Col>
            <Col>
            {isLoading === true ? (
                <div className="loader-container ag-container">
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
            ) : dailyData?.length > 0 ? (
                // <div className="ag-theme-alpine ag-container" >
                     <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>
                    <AgGridReact
                        rowData={dailyData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        // grandTotalRow="bottom"
                        pinnedBottomRowData={pinnedBottomRowData}
                        getRowStyle={params => {
                            if (params.node.rowPinned) {
                                return {
                                    fontWeight: 'bold',
                                    backgroundColor: darkMode ? '#000' : '#fff', // Dark mode background should be dark, light mode should be light
                                    color: darkMode ? '#fff' : '#000',           // Text color should contrast with the background
                                };
                            }
                            return null;
                        }}
                        // onCellClicked={onCellClicked}
                        // height={520}
                        // pagination={true}
                        // paginationPageSize={30}
                        // paginationPageSizeSelector={[10,20,30]}
                        groupDisplayType='multipleColumns'
                        suppressAggFuncInHeader={true}
                        groupSuppressBlankHeader={true}
                        // groupIncludeTotalFooter={true}
                        // rowGroupPanelShow='always'
                    // groupIncludeFooter={true}
                    // autoGroupColumnDef={autoGroupColumnDef}
                    // statusBar={{
                    //     statusPanels: [
                    //       {
                    //         statusPanel: 'agTotalAndFilteredRowCountComponent',
                    //         align: 'left',
                    //       },
                    //       {
                    //         statusPanel: 'agAggregationComponent',
                    //         statusPanelParams: {
                    //           aggFuncs: ['sum', 'avg'],
                    //         },
                    //       },
                    //     ],
                    // }}
                    />
                </div>
            ) : null}
            </Col>
        </Row>
    )
}