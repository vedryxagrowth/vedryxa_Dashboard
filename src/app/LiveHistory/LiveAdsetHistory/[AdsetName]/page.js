"use client"
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import { DatePicker, Space } from 'antd';
const { RangePicker } = DatePicker;
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const MnetLiveAdsetHistory = ({params}) => {
    // Define your rowData and columnDefs
    const [rowData, setRowData] = useState([]);

    const [isLoading, setLoading] = useState(true);

    const [isTrue, setTrue] = useState(false);

    const [input, setInput] = useState();

    const [account, setAccount] = useState('674038077865381');

    const [time, setTime] = useState('UTC');
    
    const [fetchvalue, setValue] = useState([]);

    const [dateStart1, setDateStart1] = useState();

    const [endDate1, setEndDate1] = useState();

    const spender = (params) => {
        var total = 0;
        params.values.forEach((value) => (total += parseFloat(value)));
        var total1 = total.toString()
        var total2 = total1.split(".")
        if (total2[1] !== undefined && total2[1].length > 2) {
          var total22 = total2[1].slice(0, 2)
          var totalone = total2[0] + '.' + total22
          return parseFloat(totalone).toFixed(2)
        }
        return total;
    };

    const newSpender = (params) =>{
        var total = 0;
        params.values.forEach((value) => {
            if (value !== undefined){
                return(
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

    const cpcSpender = (params) =>{
        var total = 0;
        var count = 0;
        params.values.forEach((value) => {
            (total += parseFloat(value))
            count +=1
        });
        var total1 = total.toString()
        var total2 = total1.split(".")
        if (total2[1] !== undefined && total2[1].length > 2) {
          var total22 = total2[1].slice(0, 2)
          var totalone = total2[0] + '.' + total22
          return parseFloat(totalone/count).toFixed(2)
        }
        return Number((total/count).toFixed(2));
    }

    const getCpc = (params) => {
        var sum = 0;
        var count = 0;
        params.values.forEach(function(value) {
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

    

    

    const columnDefs = [
        { headerName: 'Date', field: 'date', width: 120,
            minWidth: 450,
            hide: true,
            // // resizable:false,
            rowGroup: true,
            filter: true,
        },
        { headerName: 'CampaignName', field: 'campaignName',
            // resizeble: true,
            // // sortable: true,
            minWidth: 340,
            // hide: true,
            // // // resizable:false,
            // rowGroup: true,
            // filter: true,
            // groupDisplayType: 'group',
            // pinned: 'left',
            // enableRowGroup: true,
            // autoHeight: true, 
        },
        { headerName: 'AdsetName', field: 'adsetname',resizeble: true,
        // sortable: true,
            minWidth: 350,
            // hide: true,
            // // // resizable:false,
            // rowGroup: true,
            // filter: true,
            // pinned: 'left',
            // enableRowGroup: true,
            // autoHeight: true, 
        },
        // { headerName: 'FB-Hour', field: 'fb-hour', width: 120 },
        // { headerName: 'MNet-Hour', field: 'mnet-hour', width: 120 },
        { headerName: 'Spend', field: 'spend', width: 120, aggFunc: spender },
        { headerName: 'Revenue', field: 'revenue', width: 120, aggFunc: spender },
        { headerName: 'Profit', field: 'profit', width: 120, aggFunc: spender, cellClassRules:{
            'font-red': p => p.value < 0
        }  },
        { headerName: 'Margin', field: 'margin', valueGetter: getMargin,  },
        { headerName: 'FbLeads', field: 'fbleads', width: 120, aggFunc: spender  },
        { headerName: 'Conversions', field: 'conversions', width: 120, aggFunc: newSpender  },
        { headerName: 'cpc', field: 'cpc', aggFunc: cpcSpender},
        { headerName: 'FbClicks', field: 'fbclicks', width: 120, aggFunc: spender  },
        { headerName: 'Impressions', field: 'impressions', width: 120, aggFunc: spender  },
        { headerName: 'Ctr', field: 'ctr', valueGetter: getCtr},
        { headerName: 'Rpc', field: 'rpc', valueGetter: getRpc },
        { headerName: 'Cpl', field: 'cpl', valueGetter: getCpl},
        { headerName: 'Ncpl', field: 'ncpl', valueGetter: getNcpl },
        { headerName: 'Fmargin', field: 'fmargin', valueGetter: getFmargin},
        { headerName: 'ROI', field: 'roi', valueGetter: getROI},
        { headerName: 'AdsetId', field: 'adsetid' },
        { headerName: 'CompaignId', field: 'compaignid' },
        { headerName: 'TimeZone', field: 'timezone'},
    ];




    const functionCall = async() =>{
        const paramsData = ((params.AdsetName).split("-"));
        const decodedString = decodeURIComponent(paramsData[0]);
        const accountNumber = paramsData[1];
        const timeZone = paramsData[2];
        // console.log(paramsData[3], "network");
        let network;
        switch(paramsData[3]){
            case "FB_Mnet":
                network = "MnetLiveAdsetHistory";
                break;
            case "FB_Enki":
                network = "EnkiLiveAdsetHistory";
            default:
                null;
                break;
        }
        console.log(decodedString, "decode");
        const fetchData = await fetch(`http://localhost:8000/${network}?adsetName=${decodedString}&accountNumber=${accountNumber}&timezone=${timeZone}`);
        const data = await fetchData.json();
        const mainData = await data;
        console.log(mainData[0]);
        const filteredData = mainData && mainData.length > 0 ? 
        mainData.map((eachData)=> {
            let revenueData;
            if (eachData.estimated_revenue === 0){
                revenueData = '0.00';
            }
            else if (eachData.estimated_revenue === undefined){
                revenueData = '0.00';
            }
            else{
                revenueData = eachData.estimated_revenue;
            }
            const profit = (revenueData - eachData.spend).toFixed(2);
            let margin ;
            if (revenueData === '0.00'){
                margin = "0";
            }
            else{
                margin = `${Math.round((((revenueData - eachData.spend)/revenueData)*100) * 100) / 100}%`;
            }
            const rpc = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((revenueData/eachData.conversions)*100) / 100;
            
            let cpl;
            if (eachData.fbLeads == 0 ){
                cpl = 0;
            } else{
                cpl = Math.round((eachData.spend/eachData.fbLeads)*100)/100;
            } 
            const ncpl = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((eachData.spend/eachData.conversions)*100)/100;
            
            return(
                {
                    date: eachData.dateStart,
                    campaignName: eachData.campaign_name,
                    adsetname: eachData.adsetName,
                    // 'fb-hour': eachData.hour,
                    // 'mnet-hour': eachData.updatedHour,
                    spend:eachData.spend,
                    revenue: revenueData,
                    profit: profit,
                    margin: margin,
                    fbleads: eachData.fbLeads,
                    conversions: eachData.conversions,
                    cpc: eachData.cpc,
                    fbclicks: eachData.fbClicks,
                    impressions: eachData.impressions,
                    rpc:rpc,
                    cpl:cpl,
                    ncpl:ncpl,
                    adsetid: eachData.adset_id,
                    compaignid: eachData.campaign_id,
                    timezone: eachData[time],
                }
            )
        })
        : null;
        setRowData(filteredData);
        setValue(mainData);
        setLoading(false);
        setTrue(false);

    }

    useEffect(()=>{
        
        functionCall();
        
    },[])
    console.log(fetchvalue);
    
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

    const defaultColDef = useMemo(()=>({
        filter: true,
        floatingFilter: true,
    }),[]);

    // const autoGroupColumnDef = {
    //     headerName: 'CampaignName',
    //     minWidth: 450,
        
    // };

    return (
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
                        pagination={true}
                        paginationPageSize={30}
                        paginationPageSizeSelector={[10,20,30]}
                        suppressAggFuncInHeader={true}
                        groupDisplayType='multipleColumns'
                        groupIncludeTotalFooter ={true}
                        rowGroupPanelShow='always'
                        groupIncludeFooter={true}
                        // autoGroupColumnDef={autoGroupColumnDef}
                    />
                </div>
            ) : null}
            
        </div>
    );
};

export default MnetLiveAdsetHistory;
