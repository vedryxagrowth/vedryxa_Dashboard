"use client"
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import axios from 'axios';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useTokenContext } from '../../../components/parent'
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const MnetLiveCampaignHistory = ({ params }) => {
    // Define your rowData and columnDefs
    const { userdetails } = useTokenContext();

    // console.log(userdetails, "userDetails");

    const user = userdetails?.email;

    // console.log(user, "user Email");

    const [rowData, setRowData] = useState([]);

    const [isLoading, setLoading] = useState(true);

    const [isTrue, setTrue] = useState(false);

    const [input, setInput] = useState();

    const [account, setAccount] = useState('674038077865381');

    const [time, setTime] = useState('UTC');

    const [fetchvalue, setValue] = useState([]);

    const [dateStart1, setDateStart1] = useState();

    const [endDate1, setEndDate1] = useState();

    const [columnDefs, setColumnStructure] = useState([]);

    const [chartData, setChartData] = useState({ dates: [], spend: [], revenue: [], profit: [], margin: [] });


    const spender = (params) => {
        var total = 0;
        params.values.forEach((value) => (total += parseFloat(value)));
        var total1 = total.toString()
        var total2 = total1.split(".")
        if (total2[1] !== undefined && total2[1].length > 2) {
            var total22 = total2[1].slice(0, 2)
            var totalone = total2[0] + '.' + total22
            return totalone ? parseFloat(totalone).toFixed(2) : 0;
        }
        return total;
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

    const getCpc = (params) => {
        var sum = 0;
        var count = 0;
        params.values.forEach(function (value) {
            if (typeof value === 'number') {
                sum += value;
                count++;
            }
        });
        var average = sum / count;
        return isNaN(average) ? null : average;
    };


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




    const pinnedBottomRowData = [
        {
            campaignName: 'Total',
            spend: rowData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0),
            revenue: rowData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0),
            profit: rowData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0),
            margin: `${(rowData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / rowData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)}%`,
            rpc: rowData.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / rowData.length,
            cpl: rowData.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / rowData.length,
            ncpl: rowData.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / rowData.length,
            fbleads: rowData.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0),
            conversions: rowData.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0),
            fmargin: `${(rowData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / rowData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)}%`,
            roi: `${(rowData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - rowData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / rowData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100}%`,
            cpc: rowData.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / rowData.length,
            fbclicks: rowData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0),
            impressions: rowData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0),
            ctr: `${(rowData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / rowData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)}%`
        }
    ];
    const columnDefsObject = {
        date: {
            headerName: 'Date', field: 'date', width: 120,
            minWidth: 450,
            resizable: true,
            sortable: true,
            // width: 500,
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
            pinned: 'left',
            sort: 'asc' 
        },
        campaignname: {
            headerName: 'CampaignName', field: 'campaignName', resizeble: true,
            // sortable: true,
            minWidth: 400,
            // hide: true,
            // // // resizable:false,
            // rowGroup: true,
            // filter: true,
            // groupDisplayType: 'group',
            // pinned: 'left',
            // enableRowGroup: true,
            // autoHeight: true, 
        },
        adsetname: {
            headerName: 'AdsetName', field: 'adsetName',
            // resizeble: true,
            // // sortable: true,
            minWidth: 350,
            // hide: true,
            // // // resizable:false,
            // // rowGroup: true,
            // filter: true,
            // pinned: 'left',
            // enableRowGroup: true,
            // autoHeight: true, 
        },
        // { headerName: 'FB-Hour', field: 'fb-hour', width: 120 },
        // { headerName: 'MNet-Hour', field: 'mnet-hour', width: 120 },
        spend: { headerName: 'Spend', field: 'spend', width: 120, aggFunc: spender },
        revenue: { headerName: 'Revenue', field: 'revenue', width: 120, aggFunc: spender },
        profit: {
            headerName: 'Profit', field: 'profit', width: 120, aggFunc: spender, cellClassRules: {
                'font-red': p => p.value < 0
            }
        },
        margin: { headerName: 'Margin', field: 'margin', valueGetter: getMargin, },
        fbleads: { headerName: 'FbLeads', field: 'fbleads', width: 120, aggFunc: spender },
        conversions: { headerName: 'Conversions', field: 'conversions', width: 120, aggFunc: newSpender },
        cpc: { headerName: 'cpc', field: 'cpc', aggFunc: cpcSpender },
        fbclicks: { headerName: 'FbClicks', field: 'fbclicks', width: 120, aggFunc: spender },
        impressions: { headerName: 'Impressions', field: 'impressions', width: 120, aggFunc: spender },
        ctr: { headerName: 'Ctr', field: 'ctr', valueGetter: getCtr },
        rpc: { headerName: 'Rpc', field: 'rpc', valueGetter: getRpc },
        cpl: { headerName: 'Cpl', field: 'cpl', valueGetter: getCpl },
        ncpl: { headerName: 'Ncpl', field: 'ncpl', valueGetter: getNcpl },
        fmargin: { headerName: 'Fmargin', field: 'fmargin', valueGetter: getFmargin },
        roi: { headerName: 'ROI', field: 'roi', valueGetter: getROI },
        adsetid: { headerName: 'AdsetId', field: 'adsetId' },
        campaignid: { headerName: 'CampaignId', field: 'campaignId' },
        timezone: { headerName: 'TimeZone', field: 'timezone' },
    };

    const getColumnDefs = (order) => {
        return order?.map(colKey => columnDefsObject[colKey]);
    };
    const token = localStorage.getItem("token")

    const functionCallForUserColumnStructure = async () => {
        console.log(user, "user email");
        const fetchData = await axios.get(`https://prodapis.adsgoat.in/api/singleUserData?email=${user}`);
        // const data = await fetchData.json();
        const mainData = fetchData.data;
        console.log(mainData);
        console.log(mainData.columnStructure, "columnStructure");
        const filteredData = mainData.columnStructure?.filter((each) => each !== "fb-hour" && each !== "mnet-hour");
        console.log(filteredData);
        setColumnStructure(getColumnDefs(filteredData));
        // setRowStructure(mainData.rows); 
    }


    // const functionCall = async () => {
    //     const paramsData = ((params.CampaignName).split("-"));
    //     const decodedString = decodeURIComponent(paramsData[0]);
    //     const accountNumber = paramsData[1];
    //     const timeZone = paramsData[2];
    //     let network = paramsData[3];
    //     console.log(network, "network");
    //     console.log(decodedString, "decode");
    //     const fetchData = await axios.get(`https://prodapis.adsgoat.in/LiveCampaignHistory?campaignName=${decodedString}&accountNumber=${accountNumber}&timezone=${timeZone}&network=${network}`, {
    //         headers: {
    //             Authorization: token,
    //         },
    //     });
    //     const url = `http://localhost:8000/MnetLiveCampaignHistory?campaignName=${decodedString}&accountNumber=${accountNumber}&timezone=${timeZone}`

    //     const mainData = fetchData?.data;
    //     console.log(mainData[0]);
    //     const filteredData = mainData && mainData.length > 0 ?
    //         mainData.map((eachData) => {
    //             let revenueData;
    //             if (eachData.estimated_revenue === 0) {
    //                 revenueData = '0.00';
    //             }
    //             else if (eachData.estimated_revenue === undefined) {
    //                 revenueData = '0.00';
    //             }
    //             else if (eachData.estimated_revenue === null) {
    //                 revenueData = '0.00';
    //             }
    //             else {
    //                 revenueData = eachData.estimated_revenue;
    //             }
    //             const profit = (revenueData - eachData.spend).toFixed(2);
    //             let margin;
    //             if (revenueData === '0.00') {
    //                 margin = "0";
    //             }
    //             else {
    //                 margin = `${Math.round((((revenueData - eachData.spend) / revenueData) * 100) * 100) / 100}%`;
    //             }
    //             const rpc = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((revenueData / eachData.conversions) * 100) / 100;

    //             let cpl;
    //             if (eachData.fbLeads == 0) {
    //                 cpl = 0;
    //             } else {
    //                 cpl = Math.round((eachData.spend / eachData.fbLeads) * 100) / 100;
    //             }
    //             const ncpl = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((eachData.spend / eachData.conversions) * 100) / 100;

    //             return (
    //                 {
    //                     date: eachData[time].split(" ")[0],
    //                     campaignName: eachData.campaign_name,
    //                     adsetName: eachData.adsetName,
    //                     // 'fb-hour': eachData.hour,
    //                     // 'mnet-hour': eachData.updatedHour,
    //                     spend: eachData.spend,
    //                     revenue: revenueData !== null ? revenueData : '0.00',
    //                     profit: profit,
    //                     margin: margin,
    //                     fbleads: eachData.fbLeads,
    //                     conversions: eachData.conversions !== null ? eachData.conversions : 0,
    //                     cpc: eachData.cpc,
    //                     fbclicks: eachData.fbClicks,
    //                     impressions: eachData.impressions,
    //                     rpc: rpc,
    //                     cpl: cpl,
    //                     ncpl: ncpl,
    //                     adsetId: eachData.adset_id,
    //                     campaignId: eachData.campaign_id,
    //                     timezone: eachData[time],
    //                 }
    //             )
    //         })
    //         : null;
    //     // console.log(mainData, "mainData");
    //     setRowData(filteredData);
    //     setValue(mainData);
    //     setLoading(false);


    //     console.log(filteredData, "filter");
    //     setTrue(false);

    // }
    const functionCall = async () => {
        const paramsData = ((params.CampaignName).split("-"));
        const decodedString = decodeURIComponent(paramsData[0]);
        const accountNumber = paramsData[1];
        const timeZone = paramsData[2];
        let network = paramsData[3];
        console.log(network, "network");
        console.log(decodedString, "decode");

        const fetchData = await axios.get(`https://prodapis.adsgoat.in/LiveCampaignHistory?campaignName=${decodedString}&accountNumber=${accountNumber}&timezone=${timeZone}&network=${network}`, {
            headers: {
                Authorization: token,
            },
        });

        const mainData = fetchData?.data;
        console.log(mainData[0]);

        const filteredData = mainData && mainData.length > 0 ?
            mainData.map((eachData) => {
                const revenueData = eachData.estimated_revenue || '0.00';
                const profit = (revenueData - eachData.spend).toFixed(2);
                const margin = revenueData !== '0.00' ? `${((revenueData - eachData.spend) / revenueData * 100).toFixed(2)}%` : "0%";

                const rpc = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((revenueData / eachData.conversions) * 100) / 100;

                let cpl;
                if (eachData.fbLeads == 0) {
                    cpl = 0;
                } else {
                    cpl = Math.round((eachData.spend / eachData.fbLeads) * 100) / 100;
                }
                const ncpl = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((eachData.spend / eachData.conversions) * 100) / 100;

                return {
                    date: eachData[time].split(" ")[0],
                    campaignName: eachData.campaign_name,
                    adsetName: eachData.adsetName,
                    spend: eachData.spend,
                    revenue: revenueData,
                    profit: profit,
                    margin: margin,
                    fbleads: eachData.fbLeads,
                    conversions: eachData.conversions !== null ? eachData.conversions : 0,
                    cpc: eachData.cpc,
                    fbclicks: eachData.fbClicks,
                    impressions: eachData.impressions,
                    rpc: rpc,
                    cpl: cpl,
                    ncpl: ncpl,
                    adsetId: eachData.adset_id,
                    campaignId: eachData.campaign_id,
                    timezone: eachData[time],
                };
            })
            : null;

        setRowData(filteredData);
        setValue(mainData);
        setLoading(false);

        // Prepare data for charts
        const dates = filteredData.map(d => d.date);
        const spend = filteredData.map(d => d.spend);
        const revenue = filteredData.map(d => d.revenue);
        const profit = filteredData.map(d => d.profit);
        const rpc = filteredData.map(d => d.rpc);
        const cpl = filteredData.map(d => d.cpl);

        const margin = filteredData.map(d => parseFloat(d.margin));

        setChartData({ dates, spend, revenue, profit, margin, rpc, cpl });

        console.log(filteredData, "filter");
        setTrue(false);
    }


    useEffect(() => {
        if (user !== undefined) {
            const mainFunctionCall = async () => {
                await functionCallForUserColumnStructure();
                await functionCall();
            }
            mainFunctionCall();
        }

    }, [user])
    // console.log(fetchvalue);

    // const selectElementData = ['674038077865381', '665204411821465', '364991119488050'];


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

    const defaultColDef = useMemo(() => ({
        filter: true,
        floatingFilter: true,
    }), []);

    // const autoGroupColumnDef = {
    //     headerName: 'CampaignName',
    //     minWidth: 450,

    // };
    console.log(columnDefs, "rowData");

    return (
        <div>
            {/* Chart.js integration */}
            <div style={{ height: '400px', marginBottom: '10px' }}> {/* Container with fixed height */}
                <Line
                    data={{
                        labels: chartData.dates,
                        datasets: [
                            {
                                label: 'Spend',
                                data: chartData.spend,
                                borderColor: 'rgba(75, 192, 192, 1)',        // Teal
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',   // Light Teal
                                fill: true,
                                hidden: true
                            },
                            {
                                label: 'Revenue',
                                data: chartData.revenue,
                                borderColor: 'rgba(54, 162, 235, 1)',        // Blue
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',   // Light Blue
                                fill: true,
                                hidden: true

                            },
                            {
                                label: 'RPC',
                                data: chartData.rpc,
                                borderColor: 'rgba(255, 99, 132, 1)',        // Red
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',   // Light Red
                                fill: true,
                                hidden: true

                            },
                            {
                                label: 'CPL',
                                data: chartData.cpl,
                                borderColor: 'rgba(255, 159, 64, 1)',        // Orange
                                backgroundColor: 'rgba(255, 159, 64, 0.2)',   // Light Orange
                                fill: true,
                                hidden: true

                            },
                            {
                                label: 'Profit',
                                data: chartData.profit,
                                borderColor: 'rgba(255, 206, 86, 1)',        // Yellow
                                backgroundColor: 'rgba(255, 206, 86, 0.2)',   // Light Yellow
                                fill: true,

                            },
                            {
                                label: 'Margin',
                                data: chartData.margin,
                                borderColor: 'rgba(153, 102, 255, 1)',       // Purple
                                backgroundColor: 'rgba(153, 102, 255, 0.2)',  // Light Purple
                                fill: true,
                                hidden: true

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
                />
            </div>
            <div style={{ display: 'flex', width: '100%', marginLeft: '2%' }}>
                {/* Left Table: Top 5 RPC Today */}
                <div style={{ width: '20%' }}>
                    <h3>Top 5 RPC Today</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ddd', padding: '3px' }}>Hour</th>
                                <th style={{ border: '1px solid #ddd', padding: '2px' }}>RPC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.dates
                                .map((date, index) => ({
                                    date: date,
                                    rpc: chartData.rpc[index],
                                }))
                                .filter(item => item.date === "2024-08-26")
                                // new Date().toISOString().split('T')[0]) // Filter for today
                                .sort((a, b) => b.rpc - a.rpc) // Sort by RPC descending
                                .slice(0, 5) // Take top 5
                                .map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.date}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.rpc}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ marginLeft: "1%", width: '20%' }}>
                    <h3>Top 5 Margin Today</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ddd', padding: '3px' }}>Hour</th>
                                <th style={{ border: '1px solid #ddd', padding: '3px' }}>Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.dates
                                .map((date, index) => ({
                                    date: date,
                                    margin: chartData.margin[index],
                                }))
                                .filter(item => item.date === "2024-08-26")
                                .sort((a, b) => b.margin - a.margin) // Sort by Margin descending
                                .slice(0, 5) // Take top 5
                                .map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.date}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.margin}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginLeft: "1%", width: '25%' }}>
                    <h3>Top 5 Repeated Hours with RPC (Last 10 Days)</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ddd', padding: '3px' }}>Hour</th>
                                <th style={{ border: '1px solid #ddd', padding: '3px' }}>RPC</th>
                                <th style={{ border: '1px solid #ddd', padding: '3px' }}>Times Repeated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(chartData.dates
                                .map((date, index) => ({
                                    date: date.split(" ")[0], // Get the date part only
                                    hour: new Date(date).getHours(), // Extract hour from date
                                    rpc: chartData.rpc[index],
                                }))
                                .filter(item => {
                                    const today = new Date();
                                    const itemDate = new Date(item.date);
                                    return itemDate >= new Date(today.setDate(today.getDate() - 10)); // Filter for last 10 days
                                })
                                .reduce((acc, item) => {
                                    const key = `${item.date}-${item.hour}`;
                                    if (!acc[key]) {
                                        acc[key] = { ...item, count: 0, totalRpc: 0 };
                                    }
                                    acc[key].count += 1;
                                    acc[key].totalRpc += item.rpc; // Sum the RPC values for the same hour
                                    return acc;
                                }, {}))
                                .filter(item => item.count > 1) // Only take hours that repeated more than once
                                .sort((a, b) => b.count - a.count) // Sort by frequency (count) descending
                                .slice(0, 20) // Take top 5
                                .map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.hour}:00</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(item.totalRpc / item.count).toFixed(2)}</td> {/* Average RPC for that hour */}
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.count}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <div style={{ marginLeft: "1%", width: '25%' }}>
                    <h3>Top 5 Repeated Hours Margin (Last 10 Days)</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ddd', padding: '3px' }}>Hour</th>
                                <th style={{ border: '1px solid #ddd', padding: '3px' }}>Average Margin</th>
                                <th style={{ border: '1px solid #ddd', padding: '3px' }}>Times Repeated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(chartData.dates
                                .map((date, index) => ({
                                    date: date.split(" ")[0], // Get the date part only
                                    hour: new Date(date).getHours(), // Extract hour from date
                                    margin: chartData.margin[index],
                                }))
                                .filter(item => {
                                    const today = new Date();
                                    const itemDate = new Date(item.date);
                                    return itemDate >= new Date(today.setDate(today.getDate() - 10)); // Filter for last 10 days
                                })
                                .reduce((acc, item) => {
                                    const key = `${item.date}-${item.hour}`;
                                    if (!acc[key]) {
                                        acc[key] = { ...item, count: 0, totalMargin: 0 };
                                    }
                                    acc[key].count += 1;
                                    acc[key].totalMargin += item.margin; // Sum the margin values for the same hour
                                    return acc;
                                }, {}))
                                .filter(item => item.count > 1) // Only take hours that repeated more than once
                                .sort((a, b) => b.count - a.count) // Sort by frequency (count) descending
                                .slice(0, 5) // Take top 5
                                .map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.hour}:00</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(item.totalMargin / item.count).toFixed(2)}</td> {/* Average Margin for that hour */}
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.count}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>




            </div>

            <div>
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
                ) : rowData?.length > 0 ? (
                    <div className="ag-theme-alpine ag-container">
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            pinnedBottomRowData={pinnedBottomRowData}
                            getRowStyle={params => {
                                if (params.node.rowPinned) {
                                    return {
                                        fontWeight: 'bold',
                                        backgroundColor: '#f4f4f4' // Highlight the footer row
                                    };
                                }
                                return null;
                            }}
                            pagination={true}
                            paginationPageSize={30}
                            paginationPageSizeSelector={[10, 20, 30]}
                            suppressAggFuncInHeader={true}
                            groupDisplayType='multipleColumns'
                        // groupIncludeTotalFooter={true}
                        // rowGroupPanelShow='always'
                        // groupIncludeFooter={true}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );


};

export default MnetLiveCampaignHistory;
