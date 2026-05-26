"use client"
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import React from 'react';
import moment from 'moment-timezone';
import { Button, Result } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
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
    "FB_Inmobi": "Facebook_Inmobi",
}

const MnetDomainReports = ({ startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, campaignComments, Camapignlevelstatus, userdetails, refreshComments, refreshpage }) => {
    const { theme } = useTokenContext();
    const { apiClient } = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

    const [domainData, setDomainData] = useState([]);

    const [domainFixedFooter, setDomainFixedFooter] = useState([]);

    const [apiStatus, setApiStatus] = useState(false);

    const [selectedCells, setSelectedCells] = useState([]);
    const [firstSelectedCell, setFirstSelectedCell] = useState(null);

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
    const getFilteration = (params) => {

        let fbLeads = 0;
        let conversions = 0;

        // Normal rows
        if (params.data) {
            fbLeads = parseInt(params.data.fbLeads || 0);
            conversions = parseInt(params.data.conversions || 0);
        }

        // Group rows
        if (params.node?.aggData) {
            fbLeads = parseInt(params.node.aggData.fbLeads || 0);
            conversions = parseInt(params.node.aggData.conversions || 0);
        }

        if (fbLeads <= 0) {
            return 0;
        }

        const filteration =
            ((fbLeads - conversions) / fbLeads) * 100;

        return Number(filteration.toFixed(2));
    };
    const getCpcLc = (params) => {
        if (params.data !== undefined) {
            const { spend, fbLinkClicks } = params.data;
            if (fbLinkClicks !== 0) {
                const RPC = spend / fbLinkClicks;
                if (RPC === Infinity || isNaN(RPC)) {
                    return 0;
                }
                return Number(RPC.toFixed(2));

            }
        }
        if (params.node.aggData !== undefined) {
            const { spend, fbLinkClicks } = params.node.aggData;
            if (fbLinkClicks !== 0) {
                const RPC = spend / fbLinkClicks;
                return Number(RPC.toFixed(2));
            }
        }

        return 0;
    }
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
    const getCtr = (params) => {

        let impressions = 0;
        let fbClicks = 0;

        // Normal rows
        if (params.data) {
            impressions = parseInt(params.data.impressions || 0);
            fbClicks = parseInt(params.data.fbClicks || 0);
        }

        // Group rows
        if (params.node?.aggData) {
            impressions = parseInt(params.node.aggData.impressions || 0);
            fbClicks = parseInt(params.node.aggData.fbClicks || 0);
        }

        if (impressions <= 0) {
            return 0;
        }

        const ctr = (fbClicks / impressions) * 100;

        return Number(ctr.toFixed(2));
    };
    const getRpc = (params) => {

        let estimatedRevenue = 0;
        let conversions = 0;

        // Normal rows
        if (params.data) {
            estimatedRevenue = parseFloat(params.data.estimated_revenue || 0);
            conversions = parseInt(params.data.conversions || 0);
        }

        // Group rows
        if (params.node?.aggData) {
            estimatedRevenue = parseFloat(params.node.aggData.estimated_revenue || 0);
            conversions = parseInt(params.node.aggData.conversions || 0);
        }

        if (conversions <= 0) {
            return 0;
        }

        return Number((estimatedRevenue / conversions).toFixed(2));
    };
    const getFmargin = (params) => {

        let profit = 0;
        let spend = 0;

        // Normal rows
        if (params.data) {
            profit = parseFloat(params.data.profit || 0);
            spend = parseFloat(params.data.spend || 0);
        }

        // Group rows
        if (params.node?.aggData) {
            profit = parseFloat(params.node.aggData.profit || 0);
            spend = parseFloat(params.node.aggData.spend || 0);
        }

        if (spend <= 0) {
            return 0;
        }

        return Number(((profit / spend) * 100).toFixed(2));
    };
    const getROI = (params) => {

        let estimatedRevenue = 0;
        let spend = 0;

        // Normal rows
        if (params.data) {
            estimatedRevenue = parseFloat(params.data.estimated_revenue || 0);
            spend = parseFloat(params.data.spend || 0);
        }

        // Group rows
        if (params.node?.aggData) {
            estimatedRevenue = parseFloat(params.node.aggData.estimated_revenue || 0);
            spend = parseFloat(params.node.aggData.spend || 0);
        }

        if (spend <= 0) {
            return 0;
        }

        return Number(
            (((estimatedRevenue - spend) / spend) * 100).toFixed(2)
        );
    };
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
    const average = (params) => {
        const total = params.values.reduce((acc, value) => acc + parseFloat(value || 0), 0);
        const count = params.values.filter(value => value !== null && value !== undefined).length;  // Count non-null/undefined values
        return count > 0 ? Math.round((total / count) * 100) / 100 : 0;  // Avoid division by zero
    };
    const marginFormatter = (params) => {
        return `${parseFloat(params.value || 0).toFixed(2)}%`; // Ensure 2 decimal places in currency format
    };
    const currencyFormatter = (params) => {
        return `$${parseFloat(params.value || 0).toFixed(2)}`; // Ensure 2 decimal places in currency format
    };
    const rpcCplFormatter = (params) => {
        const value = params.value;
        return isNaN(value) || !isFinite(value) ? '0' : parseFloat(value).toFixed(2);
    };
    const [isLoading, setLoading] = useState(true);

    const oneTimeFetch = useRef(true);

    function groupAndCalculateProfit(data) {
        const groupedData = data.reduce((acc, item) => {
            const key = `${item.domain}-${item.accountNumber}-${item[`${newtime}Date`]}`;

            if (!acc[key]) {
                acc[key] = {
                    domain: item.domain,
                    [`${newtime}Date`]: item[`${newtime}Date`],
                    estimated_revenue: 0,
                    spend: 0,
                    conversions: 0,
                    fbLeads: 0,
                    adClicks: 0, // Store total ad_clicks
                    fbLinkClicks: 0,
                    impressions: 0,
                    fbClicks: 0,
                    accountNumber: item.accountNumber
                };
            }

            acc[key].estimated_revenue += item.estimated_revenue || 0;
            acc[key].spend += parseFloat(item.spend) || 0;
            acc[key].conversions += item.conversions || 0;
            acc[key].fbLeads += parseInt(item.fbLeads) || 0;
            acc[key].adClicks += item.adClicks || 0; // Sum ad_clicks separately
            acc[key].fbLinkClicks += parseInt(item.fbLinkClicks || 0);
            acc[key].impressions += parseInt(item.impressions || 0);
            acc[key].fbClicks += parseInt(item.fbClicks || 0);
            return acc;
        }, {});

        return Object.values(groupedData).map(item => {
            const finalConversions = item.adClicks > 0 ? item.adClicks : item.conversions; // ✅ Ensure correct conversions

            return {
                ...item,
                conversions: finalConversions, // ✅ Set correct conversions before using in rpc
                profit: item.estimated_revenue - item.spend,
                margin: item.estimated_revenue > 0 ? ((item.estimated_revenue - item.spend) / item.estimated_revenue) * 100 : 0,
                rpc: finalConversions > 0 ? (item.estimated_revenue / finalConversions) : 0, // ✅ Now uses correct conversions
                cpl: item.fbLeads > 0 ? (item.spend / item.fbLeads) : 0,  // Cost per Lead
                cpm: item.impressions > 0 ? (item.spend / item.impressions) * 1000 : 0,  // Cost per Mille
                cpc: item.cpc,
                impressions: item.impressions, // Ensure impressions are included in the final output
                fbClicks: item.fbClicks, // Ensure fbClicks are included in the final output
                fbLeads: item.fbLeads, // Ensure fbLeads are included in the final output
                fbLinkClicks: item.fbLinkClicks, // Ensure fbLinkClicks are included in the final output

            };
        });
    }

    const onCellClickedLive = (event) => {
        // ✅ Keep your existing functionality
        if (event.colDef.field === "adsetname") {
            const value = event.value;
            if (value !== undefined) {
                const url = `/LiveHistory/LiveAdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                window.open(url, "_blank", "noopener,noreferrer");
            }
        }

        // ✅ Ensure first selected cell gets highlighted
        if (event.event.shiftKey || event.event.ctrlKey) {
            // Add to selection when Shift/Ctrl is pressed
            setSelectedCells((prev) => [...prev, { rowIndex: event.node.rowIndex, colId: event.column.getId() }]);
        } else {
            // Single click selects only one cell
            setFirstSelectedCell({ rowIndex: event.node.rowIndex, colId: event.column.getId() });
            setSelectedCells([{ rowIndex: event.node.rowIndex, colId: event.column.getId() }]);
        }
    };

    const domainColumnDefs = [
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
            headerClass: 'hide-menu' // Add a custom class

        },
        {
            field: 'accountNumber',
            headerName: 'Account',
            minWidth: 200,
            // resizable: true,
            sortable: true,
            // hide: true, // Hide column as it's grouped
            // rowGroup: true,
            // enableRowGroup: true,
            flex: 9,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu'
        },
        {
            field: `${newtime}Date`,
            headerName: 'Date',
            flex: 6,
            minWidth: 120,
            filter: true,
            suppressMenu: true,

            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
        },
        {
            field: "spend",
            resizable: true,
            sortable: true,
            minWidth: 100,
            flex: 4,
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
        },
        {
            field: "conversions",
            resizable: true,
            headerName: "Conversions",
            filter: "agNumberColumnFilter",
            sortable: true,
            minWidth: 100,
            flex: 4,
            aggFunc: newSpender,
            // valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
        },
        {
            field: "estimated_revenue",
            headerName: "Revenue",
            resizable: true,
            sortable: true,

            minWidth: 110,
            filter: "agNumberColumnFilter",
            flex: 4,
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
        },
        {
            field: 'profit',
            resizable: true,
            sortable: true,
            minWidth: 100,
            filter: "agNumberColumnFilter",
            flex: 4,
            cellClassRules: {
                'font-red': p => p.value < 0,
                'font-green': params => params.value > 0,
            },
            aggFunc: spender,

            valueFormatter: currencyFormatter,

            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu'
        },
        {
            field: "margin",
            headerName: 'Margin',
            aggFunc: average,
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            minWidth: 110,
            flex: 4,
            valueFormatter: marginFormatter,
            filter: "agNumberColumnFilter",
            suppressMenu: true,
            headerTooltip: 'Margin = (Profit / Revenue) * 100',
            menuTabs: [],
            headerClass: 'hide-menu'
        },
        {
            field: 'rpc',
            headerName: 'RPC',
            aggFunc: avgRpcCpl,
            valueFormatter: rpcCplFormatter,
            filter: "agNumberColumnFilter",
            minWidth: 100,
            flex: 3,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "RPC = Revenue / Conversions",
            cellStyle: { fontWeight: 'bold' } // Make text bold
        },
        {
            field: 'cpl',
            headerName: 'CPL',
            aggFunc: avgRpcCpl,
            valueFormatter: rpcCplFormatter,
            filter: "agNumberColumnFilter",
            minWidth: 100,
            flex: 3,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            headerTooltip: "CPL = Spend / FBLeads",
        },
        {
            field: "fbLeads",
            headerName: "FB Leads",
            filter: "agNumberColumnFilter",
            resizable: true,
            sortable: true,
            minWidth: 100,
            flex: 3,
            aggFunc: newSpender,
            // valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
        },
        {
            field: "fbClicks",
            headerName: "FB Clicks",
            filter: "agNumberColumnFilter",
            resizable: true,
            sortable: true,
            minWidth: 100,
            flex: 4,
            aggFunc: newSpender,
            // valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
        },
        {
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
        {
            field: "filteration",
            headerName: "Filteration",
            resizable: true,
            sortable: true,
            minWidth: 120,
            filter: "agNumberColumnFilter",
            flex: 4,
            valueGetter: getFilteration,
            valueFormatter: (params) => `${params.value}%`,
            // aggFunc: newSpender,
            // valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',// Add a custom class
            headerTooltip: "((fbLeads - conversions) / fbLeads) * 100"
        },
        {
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
        {
            headerName: 'CPC_LC',
            field: 'cpclinkclicks',
            minWidth: 80,
            valueGetter: getCpcLc,
            sortable: true,
            filter: 'agNumberColumnFilter',
            hide: false,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
        },
        {
            headerName: 'FB_LC',
            field: 'fbLinkClicks',
            headerTooltip: 'fblinkclicks',
            minWidth: 110,
            aggFunc: newSpender,
            sortable: true,
            filter: 'agNumberColumnFilter',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu'
        },
        {
            headerName: 'CTR',
            field: 'ctr',
            valueGetter: getCtr,
            sortable: true,
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
        {
            headerName: 'NCPL',
            field: 'ncpl',
            minWidth: 90,
            valueGetter: getNcpl,
            sortable: true,
            filter: 'agNumberColumnFilter',
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu',
            headerTooltip: "NCPL = Spend / Conversions"
        },
        {
            headerName: 'FMargin',
            field: 'fmargin',
            valueGetter: getFmargin,
            sortable: true,
            filter: "agNumberColumnFilter",
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
        {
            headerName: 'ROI',
            field: 'roi',
            valueGetter: getROI,
            sortable: true,
            filter: "agNumberColumnFilter",
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
            headerTooltip: "ROI = ((Revenue - Spend) / Spend) * 100",
        },



    ];

    const memorizedDomainData = useMemo(() => domainData, [domainData]);
    const memorizeddomainColumnDefs = useMemo(() => domainColumnDefs, [domainColumnDefs]);

    const functionCall1 = async () => {
        try {
            setLoading(true);
            // console.log(newRevenuePratner);
            const collectionName = newRevenuePratner === "FB_DomainActive" ? "Facebook_DActive_Names" : newtworkCollections[newRevenuePratner];
            const fetchData = await apiClient.get(`/Live?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=${collectionName}`);
            const mainData1 = fetchData.data;
            const mainData = mainData1.filter(obj => !("ad_clicks" in obj));
            let campaignComments = [];

            if (fetchData.status === 200 && mainData1.length > 0) {
                const groupAndCalculateProfit1 = groupAndCalculateProfit(mainData1);

                setDomainData(groupAndCalculateProfit1);
                setDomainFixedFooter([
                    {
                        // domain:'Totals',
                        [`${newtime}Date`]: 'Totals',
                        spend: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0).toFixed(2)),
                        estimated_revenue: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.estimated_revenue), 0).toFixed(2)),
                        profit: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0).toFixed(2)),
                        margin: parseFloat((groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr.estimated_revenue), 0) * 100).toFixed(2)),
                        rpc: parseFloat((groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.rpc), 0)).toFixed(2)),
                        cpl: parseFloat((groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.cpl), 0)).toFixed(2)),
                        conversions: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.conversions), 0).toFixed(2)),
                        fbLinkClicks: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.fbLinkClicks), 0).toFixed(2)),
                        impressions: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0).toFixed(2)),
                        fbClicks: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.fbClicks), 0).toFixed(2)),
                        fbLeads: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.fbLeads), 0).toFixed(2)),
                        clicks: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.clicks), 0).toFixed(2)),
                        // impressions: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0).toFixed(2)),
                    }
                ]);
                fetchData.status === 200 && setApiStatus(false);
            }
            else {
                setDomainData([]);
                setDomainFixedFooter([]);
                setLoading(false);
            }
            setLoading(false);
        }
        catch (error) {
            setApiStatus(true);
            setLoading(false);
        }

    }

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
        functionCall1();
        setApiStatus(false);
    }

    useEffect(() => {
        if (refreshpage === "Refresh5" && newRevenuePratner === "FB_Mnet") {
            handleReFetchData();
        }
    }
        , [refreshpage]);
    useEffect(() => {
        if (oneTimeFetch.current) {
            functionCall1();
            oneTimeFetch.current = false;
        }
    }, [oneTimeFetch.current]);
    return (
        <div style={{ height: "100%", marginBottom: '20px' }}>
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
                ) : domainData.length > 0 ? (

                    <div
                        className={`ag-theme-alpine ${gridThemeClass}`}
                        style={{ width: '100%', height: '500px' }}
                    >
                        <AgGridReact
                            rowData={memorizedDomainData}
                            columnDefs={memorizeddomainColumnDefs}
                            // defaultColDef={defaultColDef}
                            suppressAggFuncInHeader={true}
                            enableCharts={true}
                            enableRangeSelection={true}
                            onGridReady={(params) => {
                                // keep the debug global
                                window.__top5 = params.api;
                                // call your existing handler passing the grid id and ref
                            }}

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
                            gridOptions={{
                                ensureDomOrder: false,
                                suppressRowClickSelection: true,
                                suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                groupSelectsChildren: true, // ✅ Ensures child rows are selected properly
                            }}
                            onCellKeyDown={onCellKeyDown}
                            onCellClicked={onCellClickedLive}
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
                                api.forEachNodeAfterFilterAndSort((node) => {
                                    if (!node.rowPinned) {
                                        filteredData.push(node.data);
                                    }
                                });

                                const updatedFooter = [
                                    {
                                        [`${newtime}Date`]: 'Totals',
                                        spend: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend || 0), 0).toFixed(2)),
                                        estimated_revenue: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.estimated_revenue || 0), 0).toFixed(2)),
                                        profit: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.profit || 0), 0).toFixed(2)),
                                        margin: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.estimated_revenue), 0) * 100).toFixed(2)),
                                        rpc: parseFloat(
                                            (filteredData.reduce((acc, curr) => acc + parseFloat(curr?.rpc || 0), 0) || 0).toFixed(2)
                                        ),
                                        cpl: parseFloat(
                                            (filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpl || 0), 0) || 0).toFixed(2)
                                        ),
                                        impressions: groupAndCalculateProfit1?.reduce(
                                            (acc, curr) => acc + parseInt(curr?.impressions || 0),
                                            0
                                        ),
                                        fbClicks: groupAndCalculateProfit1?.reduce(
                                            (acc, curr) => acc + parseInt(curr?.fbClicks || 0),
                                            0),
                                        cpc: parseFloat(
                                            (filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpc || 0), 0) || 0).toFixed(2)
                                        ),
                                    },
                                ];

                                setDomainFixedFooter(updatedFooter);
                            }}
                        />
                    </div>

                ) : <div style={{ backgroundColor: theme === "dark" && "#333" }}>
                    {apiStatus === true ?
                        <Result
                            className={theme === 'dark' ? 'dark-result' : 'light-result'}
                            // icon={<SmileOutlined />}
                            title={`API failed to fetch the data. Please click retry button to fetch the data`}
                            extra={<Button type="primary" onClick={handleReFetchData}>Retry</Button>}
                        /> : (startDate !== endDate ? <Result
                            className={theme === 'dark' ? 'dark-result' : 'light-result'}
                            icon={<SmileOutlined />}
                            title={`No DomainData for ${newaccount} from ${startDate} to ${endDate}`}
                        // extra={<Button type="primary">Next</Button>}
                        /> : <Result
                            className={theme === 'dark' ? 'dark-result' : 'light-result'}
                            icon={<SmileOutlined />}
                            title={`No DomainData for ${newaccount} to ${startDate}`}
                        // extra={<Button type="primary">Next</Button>}
                        />)}
                </div>}
            </div>
        </div>

    );
};

export default MnetDomainReports;
