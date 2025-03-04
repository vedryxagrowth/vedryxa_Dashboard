"use client"
import React from 'react';
import axios from 'axios';
// import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import moment from 'moment-timezone';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {useTokenContext} from '../../../components/parent'
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Spin, Row, Col, Select } from 'antd';
Chart.register(...registerables);
import debounce from 'lodash.debounce';

export default function AdsetNameAndAccount({params}){
    
    const {userdetails} = useTokenContext();
    const { apiClient } = useTokenContext();
    const { theme } = useTokenContext();

    console.log(theme);
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

    console.log(userdetails, "userDetails");

    const user = userdetails?.email;

    const gridRef = useRef();

    const [columnDefs, setColumnStructure] = useState([]);
    const [chartData, setChartData] = useState({ dates: [], spend: [], revenue: [], profit: [], margin: [] });

    const [isLoading, setLoading] = useState(true);
    const [dailyData, setdailyData] = useState([]);
    const paramsData = ((params.AdsetName).split("-"));
    let decodedString = decodeURIComponent(paramsData[0]);
    decodedString = decodedString.replace(/\*/g, "/").replace(/\^/g, "-");
    const accountNumber = paramsData[1];
    const timeZone = paramsData[2];
    const network = paramsData[3];
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

    const columnStructure = [
        "date_n",
        "date_f",
        "hour_n",
        "hour_f",
        "date",
        "adsetname",
        "spend",
        "revenue",
        "profit",
        "margin",
        "rpc",
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
        "ctr"
    ];

    const getMargin = (params) =>{
        if (params.data !== undefined) {
            const { revenue, spend} = params.data;
            
            if (revenue !== "0.00" || revenue !== undefined) {
              const RPC = ((revenue - spend) / revenue)*100;
              if(RPC === Infinity || isNaN(RPC) || RPC === -Infinity){
                return `0%`;
              }
              return `${Math.round(RPC*100)/100}%`;
              
            }
        }
        if (params.node.aggData !== undefined) {
            const { revenue, spend} = params.node.aggData;
            if (revenue !== "0.00" || revenue !== undefined) {
                const RPC = ((revenue - spend) / revenue)*100;
                if(RPC === Infinity || isNaN(RPC) || RPC === -Infinity){
                  return `0%`;
                }
                return `${Math.round(RPC*100)/100}%`;
                
            }
        }
          
        return 0;
    }

    const getCpl = (params) => {
        if (params.data !== undefined) {
          const { fbleads, spend } = params.data;
          
          if (fbleads !== 0) {
            const CPL = spend / fbleads;
            if(CPL === Infinity){
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
            const { revenue, conversions} = params.data;
            if (conversions !== 0) {
              const RPC = revenue / conversions;
              if(RPC === Infinity || isNaN(RPC)){
                  return 0;
              }
              return Number(RPC.toFixed(2));
              
            }
        }
        if (params.node.aggData !== undefined) {
            const { revenue, conversions} = params.node.aggData;
            if (conversions !== 0) {
              const RPC = revenue / conversions;
              return Number(RPC.toFixed(2));
            }
        }
          
        return 0;
    }

    const getCtr = (params) =>{
        if (params.data !== undefined) {
            const { impressions, fbclicks} = params.data;
            if (impressions !== 0) {
              const RPC = (fbclicks / impressions)*100;
              if(RPC === Infinity || isNaN(RPC)){
                  return 0;
              }
              return `${Number(RPC.toFixed(2))}%`;
              
            }
        }
        if (params.node.aggData !== undefined) {
            const { impressions, fbclicks} = params.node.aggData;
            if (impressions !== 0) {
              const RPC = (fbclicks / impressions)*100;
              return `${Number(RPC.toFixed(2))}%`;
            }
        }
          
        return 0;
    }

    const getDev = (params) =>{
        const rpc = getRpc(params);
        if (params.data !== undefined) {
            const { fbleads } = params.data;
            
            if (fbleads !== 0) {
              const CPL = rpc * fbleads;
              if(CPL === Infinity){
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

    const getFmargin = (params) =>{
        const revenue = getDev(params);
        if (params.data !== undefined) {
            const { profit } = params.data;
            if (revenue !== 0) {
              const RPC = (profit / revenue)*100;
              if(RPC === Infinity || isNaN(RPC) || RPC === -Infinity){
                  return 0;
              }
              return `${Number(RPC.toFixed(2))}%`;
              
            }
        }
        if (params.node.aggData !== undefined) {
            const { profit } = params.node.aggData;
            if (revenue !== 0) {
              const RPC = (profit / revenue)*100;
              return `${Number(RPC.toFixed(2))}%`;
            }
        }
          
        return 0;
    }
    

    const getNcpl = (params) => {
        if (params.data !== undefined) {
            const { spend, conversions} = params.data;
            if (conversions !== 0) {
              const RPC = spend / conversions;
              if(RPC === Infinity || isNaN(RPC)){
                return 0;
              }
              return Number(RPC.toFixed(2));
              
            }
        }
        if (params.node.aggData !== undefined) {
            const { spend, conversions} = params.node.aggData;
            if (conversions !== 0) {
              const RPC = spend / conversions;
              return Number(RPC.toFixed(2));
            }
        }
          
        return 0;
    }

    

    const getROI = (params) =>{
        if (params.data !== undefined) {
            const { revenue, spend} = params.data;
            
            if (revenue !== "0.00" || revenue !== undefined) {
              const RPC = ((revenue - spend) / spend)*100;
              if(RPC === Infinity || isNaN(RPC) || RPC === -Infinity){
                return `0%`;
              }
              return `${Math.round(RPC*100)/100}%`;
              
            }
        }
        if (params.node.aggData !== undefined) {
            const { revenue, spend} = params.node.aggData;
            if (revenue !== "0.00" || revenue !== undefined) {
                const RPC = ((revenue - spend) / spend)*100;
                if(RPC === Infinity || isNaN(RPC) || RPC === -Infinity){
                  return `0%`;
                }
                return `${Math.round(RPC*100)/100}%`;
                
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

  const [domainFixedFooter, setDomainFixedFooter] = useState([]);
  
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

    const functionCallForUserColumnStructure = async() => {
        const fetchData = await apiClient.get(`https://prodapis.adsgoat.in/api/singleUserData?email=${user}`);
        // const data = await fetchData.json();
        const mainData = fetchData.data;
        console.log(mainData.historyStructure, "historyStructure");
        const filteredData = mainData.historyStructure.filter((each)=> each !== "actions" );
        console.log(filteredData);
        setColumnStructure(getColumnDefs(filteredData));
        // setRowStructure(mainData.rows); 
    }

    const getHistoryData = async() => {
        const fetchData = await apiClient.get(`/DailyAdsetHistory?adsetName=${decodedString}&accountNumber=${accountNumber}&timezone=${timeZone}&network=${network}`);
        // console.log(`https://prodapis.adsgoat.in/LiveAdsetHistory?adsetName=${decodedString}&accountNumber=${accountNumber}&timezone=${timeZone}&network=${network}`, "url");
        const url = `http://localhost:8000/MnetLiveCampaignHistory?adsetName=${decodedString}&accountNumber=${accountNumber}&timezone=${timeZone}`
        
        const mainData = fetchData.data;
        console.log(mainData, "adset");
        
        const specifiedTimeZone = selectTimezone[timeZone];
        // const sortedArray = mainData?.sort((a, b) => new Date(a[specifiedTimeZone]) - new Date(b[specifiedTimeZone]));
        // console.log(sortedArray, "sort");
        const filteredData = mainData && mainData.length > 0 ? 
        mainData.map(eachData=>{
            const Revenue = eachData.estimated_revenue !== undefined ? (eachData.estimated_revenue) : 0;
            const profit = Math.round((Revenue - eachData.spend)*100)/100;
            const margin = Revenue !== 0 ? `${Math.round((((Revenue-eachData.spend)/eachData.estimated_revenue)*100)*100)/100}%`: '0%'
            let rpc = eachData.conversions !== 0  ? (Math.round((Revenue/eachData.conversions)*100)/100): 0;
            const revenue = ((eachData.estimated_revenue-eachData.spend)/(eachData.fbLeads * rpc))*100;
            let fMargin = revenue !== 0  ? Math.round(((profit/revenue)*100)*100)/100 : 0;
            const cpl = eachData.fbLeads !== 0 ? Math.round((eachData.spend/eachData.fbLeads)*100)/100 : 0;
            let ncpl = eachData.conversions !== 0 ? Math.round((eachData.spend/eachData.conversions)*100)/100 : 0;
            const roi = eachData.spend !== 0 ? `${Math.round((((Revenue - eachData.spend)/eachData.spend)*100)*100)/100}%` : '0%';
            const ctr = eachData.impressions !== 0 ? `${Math.round(((eachData.fbClicks/eachData.impressions)*100)*100)/100}%` : '0%';
            const mainRvenue = ((Math.round(Revenue*100)/100)).toString();
            const conversions = eachData.conversions !== undefined && eachData.conversions !== null ? eachData.conversions : '0';
            console.log(conversions, "conversions");
            rpc = !isNaN(rpc) ? rpc : 0;
            ncpl = !isNaN(ncpl) ? ncpl : 0;
            fMargin = !isNaN(fMargin) ? `${fMargin}%`: '0%';
            return(
                {
                    campaignname: eachData.campaign_name,
                    date: eachData[specifiedTimeZone],
                    adsetname: eachData.adsetName,
                    spend:(eachData.spend).toString(),
                    revenue: mainRvenue,
                    profit: profit.toString(),
                    margin: margin,
                    rpc:rpc.toString(),
                    cpl:cpl.toString(),
                    ncpl:ncpl.toString(),
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

    useEffect(()=>{
      setDomainFixedFooter([
          {
              adsetName: 'Total',
              spend: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend || 0), 0).toFixed(2),
              revenue: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue || 0), 0).toFixed(2),
              profit: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit || 0), 0).toFixed(2),
              margin: `${(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)}%`,
              rpc: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / filteredData?.length,
              cpl: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / filteredData?.length,
              ncpl: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / filteredData?.length,
              fbleads: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0),
              conversions: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0),
              fmargin: `${(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)}%`,
              roi: `${(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100}%`,
              cpc: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / filteredData?.length,
              fbclicks: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0),
              impressions: filteredData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0),
              ctr: `${(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)}%`
          }
      ]);
    },[filteredData])

    const debouncedFunctionCallForUserColumnStructure = debounce(async () => {
        await functionCallForUserColumnStructure();
    }, 100);
      
    const debouncedFunctionCall = debounce(async () => {
        await getHistoryData();
    }, 100);

    useEffect(()=>{
        if(userdetails?.adAccounts){
            const functionCall = async()=>{
                await debouncedFunctionCallForUserColumnStructure();
                await debouncedFunctionCall();
            }
            functionCall();
        }
    },[userdetails]);

    // const pinnedBottomRowData = [
    //     {
    //         adsetName: 'Total',
    //         spend: dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0),
    //         revenue: dailyData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0),
    //         profit: dailyData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0),
    //         margin: `${(dailyData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)}%`,
    //         rpc: dailyData.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / dailyData.length,
    //         cpl: dailyData.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / dailyData.length,
    //         ncpl: dailyData.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / dailyData.length,
    //         fbleads: dailyData.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0),
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
    //         date:{ headerName: 'Date', field: 'date', width: 140, sort: 'asc',
    //         comparator: (valueA, valueB) => {
    //             if (valueA == null && valueB == null) return 0;
    //             if (valueA == null) return -1;
    //             if (valueB == null) return 1;
    
    //             const dateA = new Date(valueA);
    //             const dateB = new Date(valueB);
    
    //             // Compare valid dates
    //             if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
    //                 return dateA - dateB;
    //             }
    
    //             // Fallback for invalid dates (compare as strings)
    //             return valueA.toString().localeCompare(valueB.toString());
    //         }
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
        console.log(newFieldOrder);
        await apiClient.post(`/api/updateHistoryPageStructure?email=${userdetails?.email}`, {updateDataArray: newFieldOrder});
        // console.log(`Updating columns structure for grid: ${gridId}`);
    };

    const debouncedHandleColumnMove = useCallback(debounce((params, gridId) => handleColumnMove(params, gridId), 600), []);

    const onGridReady = (params, gridId, gridRef) => {
        gridRef.current = params;
        params.api.applyColumnState({ state: columnDefs, applyOrder: true });
        params.api.addEventListener('dragStopped', (e) => debouncedHandleColumnMove(e, gridId));
    };

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
      // {headerName:'CampaignName', field:'campaignName',
      //     // rowGroup: true,
      //     // filter: true,
      //     // hide: true,
      //     // resizable: true,
      //     // enableRowGroup: true,
      //     // groupDisplayType: 'group',
      //     width: 450,
      // },
      adsetname : { headerName: 'Adset-Name', field: 'adsetname',
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
                    <span style={{ color: "green", fontWeight: "bold" }}>Copied!</span>
                </span>
            );
        }
        return params.value;
      }
      // hide: true,
      // // resizable:false,
      // rowGroup: true,
      // filter: true,
      // pinned: 'left',
      // enableRowGroup: true,
      // autoHeight: true, 
      },
      date : { headerName: 'Date', field: 'date', width: 160, sort: 'asc',
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
       },
       hour_f : { headerName: 'Date', field: 'hour_f', width: 160, sort: 'asc',
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
       hour_n : { headerName: 'Date', field: 'hour_n', width: 160, sort: 'asc',
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
       date_f : { headerName: 'Date', field: 'date_f', width: 160, sort: 'asc',
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
       date_n : { headerName: 'Date', field: 'date_n', width: 160, sort: 'asc',
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
      spend : { headerName: 'Spend', field: 'spend', width: 105,
          aggFunc: agFunc, 
          valueFormatter: params => params.value ? Math.round(params.value*100)/100 : '',
          suppressMenu: true,
          menuTabs: [],
          headerClass: 'hide-menu',
          valueFormatter: (params) => `$${params.value}`,
      },
      revenue : { headerName: 'Revenue', field: 'revenue', width: 105,
          aggFunc: agFunc,
          valueFormatter: params => params.value ? Math.round(params.value*100)/100 : '', 
          suppressMenu: true,
          menuTabs: [],
          headerClass: 'hide-menu',
          valueFormatter: (params) => `$${params.value}`,
      },
      profit : { headerName: 'Profit', field: 'profit', width: 100, 
          cellClassRules:{
          'font-red': p => p.value < 0
          },
          aggFunc: agFunc,
          valueFormatter: params => params.value ? Math.round(params.value*100)/100 : '',
          suppressMenu: true,
          menuTabs: [],
          headerClass: 'hide-menu',
          valueFormatter: (params) => `$${params.value}`,
          headerToolTip: 'Profit = Revenue - Spend',
      },
      margin : { headerName: 'Margin', field: 'margin', valueGetter: getMargin,
          suppressMenu: true,
          menuTabs: [],
          headerClass: 'hide-menu',
          width: 105,
          // valueFormatter: (params) => `${params.value}%`,
          headerToolTip: 'Margin = ((Revenue - Spend) / Revenue) * 100',
          
      },
      rpc : { headerName: 'RPC', field: 'rpc', valueGetter: getRpc,
          suppressMenu: true,
          menuTabs: [],
          headerClass: 'hide-menu',
          headerToolTip: 'RPC = Revenue / Conversions',
          width: 85,},
      cpl : { headerName: 'CPL', field: 'cpl', valueGetter: getCpl,
          suppressMenu: true,
          menuTabs: [],
          headerClass: 'hide-menu',
          headerToolTip: 'CPL = Spend / FBLeads',
          width: 85,},
      ncpl : { headerName: 'NCPL', field: 'ncpl', valueGetter: getNcpl,
          suppressMenu: true,
          menuTabs: [],
          headerClass: 'hide-menu',
          headerToolTip: 'NCPL = Spend / Conversions',
          width: 95},
      fbleads : { headerName: 'Leads', field: 'fbleads', width: 100, aggFunc: agFunc,
          suppressMenu: true,
          menuTabs: [],
          headerClass: 'hide-menu', 
        },
      // { headerName: "Filteration", field:'filterarion', width: 120,  valueGetter: getFilteration},
      // { headerName: "Filteration", field:'filterarion', width: 115, 
      //     valueFormatter: params => params.value ? `${params.value}%` : '0%',
      //     suppressMenu: true,
      //     menuTabs: [],
      //     headerClass: 'hide-menu',
      // },
      conversions : { headerName: 'Conv', field: 'conversions', width: 90, aggFunc: agFunc, 
          suppressMenu: true,
          menuTabs: [],
          headerToolTip: 'Conversions',
          headerClass: 'hide-menu',  },
      fmargin : { headerName: 'FMargin', field: 'fmargin', valueGetter: getFmargin,
          suppressMenu: true,
          menuTabs: [],
          headerClass: 'hide-menu',
          valueFormatter: (params) => `${params.value}`,
          headerToolTip: 'FMargin = (Profit / Revenue) * 100',
          width: 110},
      roi : { headerName: 'ROI', field: 'roi', valueGetter: getROI,
          suppressMenu: true,
          menuTabs: [],
          headerClass: 'hide-menu',
          valueFormatter: (params) => `${params.value}`,
          headerToolTip: 'ROI = ((Revenue - Spend) / Spend) * 100',
          width: 90},
      cpc : { headerName: 'CPC', field: 'cpc',
          aggFunc: (params) => {
              const sum = params.values.reduce((sum, value) => sum + parseFloat(value), 0);
              return sum / params.values.length;
          },
          valueFormatter: params => params.value !== undefined ? Math.round(params.value*100)/100 : '',
          suppressMenu: true,
          menuTabs: [],
          headerClass: 'hide-menu',
          width: 90,
          headerToolTip: 'CPC = Spend / FBClicks',

      },
      fbclicks : { headerName: 'FBClicks', field: 'fbclicks', width: 110, aggFunc: agFunc, 
          suppressMenu: true,
          menuTabs: [],
          headerClass: 'hide-menu', },
      impressions : { headerName: 'IMP', field: 'impressions', width: 80, aggFunc: agFunc,
          suppressMenu: true,
          menuTabs: [],
          headerToolTip: 'Impressions',
          headerClass: 'hide-menu',   },
      ctr : { headerName: 'CTR', field: 'ctr', valueGetter: getCtr,
          suppressMenu: true,
          menuTabs: [],
          headerClass: 'hide-menu',
          headerToolTip: 'CTR = (FBClicks / Impressions) * 100',
      width: 90},
      filteration : { headerName: "Filteration", field:'filteration', width: 115, 
        valueFormatter: params => params.value ? `${params.value}%` : '0%',
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        hide: true
        },
      
      // { headerName: 'AdsetId', field: 'adsetId' },
      // {headerName: "CampaignId", field:'campaignId'}
    };

    console.log(columnDefs);

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

    return(
        <Row style={{display:'flex', flexDirection:'column'}}>
            <Col style={{width:'100%', display:'flex', alignItems:'center'}}>
                <div style={{width:'100%'}}>
                    <h3 style={{textAlign:'center'}}>{decodedString}</h3>
                </div>
                <div style={{width:'120px'}}>
                    <p>Timezone: <span style={{fontWeight:'bold'}}>{timeZone}</span></p>
                </div>
                    
            </Col>
            {/* <h1>AdsetName: {decodedString}</h1> */}
            <Col style={{ height: '400px', marginBottom: '10px' }}> {/* Container with fixed height */}
                {chartData.dates.length === 0 ? (<div style={{width:'100%', height:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}><Spin size="large" /></div>):
                    (
                        <Line
                        data={{
                          labels: chartData.dates, // X-axis labels
                          datasets: [
                            {
                              label: 'Spend',
                              data: chartData.spend,
                              borderColor: 'rgba(75, 192, 192, 1)', // Teal
                              backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light Teal
                              fill: true,
                              hidden: true,
                              tension: 0.3,
                              pointRadius: 5,
                              pointHoverRadius: 8,
                              pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                              pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
                            },
                            {
                              label: 'Revenue',
                              data: chartData.revenue,
                              borderColor: 'rgba(54, 162, 235, 1)', // Blue
                              backgroundColor: 'rgba(54, 162, 235, 0.2)', // Light Blue
                              fill: true,
                              hidden: true,
                              tension: 0.3,
                              pointRadius: 5,
                              pointHoverRadius: 8,
                              pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                              pointHoverBackgroundColor: 'rgba(54, 162, 235, 1)',
                            },
                            {
                              label: 'RPC',
                              data: chartData.rpc,
                              borderColor: 'rgba(255, 99, 132, 1)', // Red
                              backgroundColor: 'rgba(255, 99, 132, 0.2)', // Light Red
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
                              data: chartData.cpl,
                              borderColor: 'rgba(255, 159, 64, 1)', // Orange
                              backgroundColor: 'rgba(255, 159, 64, 0.2)', // Light Orange
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
                              data: chartData.profit,
                              borderColor: 'rgba(255, 206, 86, 1)', // Yellow
                              backgroundColor: 'rgba(255, 206, 86, 0.2)', // Light Yellow
                              fill: true,
                              tension: 0.3,
                              pointRadius: 5,
                              pointHoverRadius: 8,
                              pointBackgroundColor: 'rgba(255, 206, 86, 1)',
                              pointHoverBackgroundColor: 'rgba(255, 206, 86, 1)',
                            },
                            {
                              label: 'Margin',
                              data: chartData.margin,
                              borderColor: 'rgba(153, 102, 255, 1)', // Purple
                              backgroundColor: 'rgba(153, 102, 255, 0.2)', // Light Purple
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
                          maintainAspectRatio: false, // Allow the chart to take the full height of its container
                          scales: {
                            x: {
                              // ticks: {
                              //   padding: 30, // Increase padding between labels and the axis
                              //   color: (context) => {
                              //     // Dynamically set color for x-axis labels
                              //     const label = chartData.dates[context.index];
                              //     return getColorForValue(label); // Use a custom function for dynamic coloring
                              //   },
                              // },
                              grid: {
                                color: theme === 'dark' ? '#444' : '#e0e0e0', // Adjust gridline color based on theme
                              },
                            },
                            y: {
                              beginAtZero: true, // Ensure the y-axis starts at zero
                              ticks: {
                                callback: function (value) {
                                  return value.toFixed(2); // Format y-axis values to 2 decimal places
                                },
                                color: theme === "dark" ? '#e0e0e0':'#050505', // Adjust tick color based on theme
                              },
                              grid: {
                                color: theme === "dark" ? '#444' : '#e0e0e0', // Adjust gridline color based on theme
                              },
                            },
                          },
                          plugins: {
                            legend: {
                              labels: {
                                color: theme === "dark" ? '#faf7f7' : '#050505', // Legend text color based on theme
                              },
                            },
                            tooltip: {
                              mode: 'index', // Ensure all datasets at this x-axis point are shown
                              intersect: true, // Show tooltip only when hovering directly over a point
                              callbacks: {
                                label: function (tooltipItem) {
                                  const index = tooltipItem.dataIndex;
                                  const dataset = tooltipItem.dataset;
                                  const value = dataset.data[index];
                                  const datasetLabel = dataset.label || '';
                      
                                  // Return label with value and date
                                  return `${datasetLabel}: ${value} (Date: ${chartData.dates[index]})`;
                                },
                              },
                              displayColors: true, // Enable color box for each dataset
                              boxWidth: 15, // Adjust the width of the color box
                              boxHeight: 15, // Adjust the height of the color box
                            },
                          },
                        }}
                        height={350} // Set the height of the chart
                      />
                      
                    )}
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
            {/* <h1>{params.campaignAndAccount}hi</h1> */}
            <Col style={{display:'flex', justifyContent:'flex-end'}}>
                <Select
                    placeholder="Select a range"
                    value={selectedValue}
                    onChange={handleChange}
                    style={{ width: "200px" }}
                    allowClear
                >
                    {dateOptions.map((option, index) => (
                    <Option key={index} value={option}>
                        {option}
                    </Option>
                    ))}
                </Select>
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
            ) :  (
                // <div className="ag-theme-alpine ag-container" >
                <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>
                  <AgGridReact
                      rowData={filteredData}
                      columnDefs={columnDefs}
                      defaultColDef={defaultColDef}
                      pinnedBottomRowData={domainFixedFooter}
                      gridOptions={gridOptions}
                      onGridReady={(params) => onGridReady(params, 'grid1', gridRef)}
                      getRowStyle={(params) => {
                          if (params.node.rowPinned) {
                              return {
                                  fontWeight: 'bold',
                                  backgroundColor: theme === "dark" ? '#000' : '#fff',
                                  color: theme === "dark" ? '#fff' : '#000',
                              };
                          }
                          return null;
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
                                  impressions: filteredData.reduce((acc, curr) => acc + parseFloat(curr.impressions || 0), 0),
                                  ctr: `${(
                                      (filteredData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks || 0), 0) /
                                          filteredData.reduce((acc, curr) => acc + parseFloat(curr.impressions || 0), 0)) *
                                      100
                                  ).toFixed(2)}%`,
                              },
                          ];

                          // setFilteredData(filteredData);
                          setDomainFixedFooter(updatedFooter);

                          // Example field-based filtering logic
                          const specificFieldData = fieldValueFilter('status', 'Active'); // Replace 'status' and 'Active' with your field and value
                          console.log('Filtered by status (Active):', specificFieldData);
                      }}
                  />
                </div>
            ) }
            </Col>
        </Row>
    )
}