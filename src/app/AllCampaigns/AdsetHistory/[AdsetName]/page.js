"use client"
import React from 'react';
import { Select } from 'antd';
import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function AllCampaignsAdsetHistory({params}){
    const [isLoading, setLoading] = useState(true);
    const [dailyData, setdailyData] = useState([]);
    const paramsData = ((params.AdsetName).split("-"));
    const decodedString = decodeURIComponent(paramsData[0]);
    const accountNumber = paramsData[1];
    const timeZone = paramsData[2];
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

    const getHistoryData = async() => {
        const fetchData = await fetch(`http://localhost:8000/MnetAdsetDailyHistory?accountNumber=${accountNumber}&timezone=${timeZone}&adsetName=${decodedString}`);
        const data = await fetchData.json();
        const mainData = await data;
        console.log(mainData, "adset");
        console.log(typeof(mainData), "type");
        const specifiedTimeZone = selectTimezone[timeZone];
        // const sortedArray = mainData.sort((a, b) => new Date(a[specifiedTimeZone]) - new Date(b[specifiedTimeZone]));
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
            const conversions = eachData.conversions !== undefined ? eachData.conversions : '0';
            rpc = !isNaN(rpc) ? rpc : 0;
            ncpl = !isNaN(ncpl) ? ncpl : 0;
            fMargin = !isNaN(fMargin) ? `${fMargin}%`: '0%';
            return(
                {
                    // campaignName: eachData.campaign_name,
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
                    adsetid: eachData.adset_id,


                }
            )
        })
        : null;
        setdailyData(filteredData);
        setLoading(false);
    }

    useEffect(()=>{
        getHistoryData();
    },[]);

    const dailyColumns = [
            // {headerName:'CampaignName', field:'campaignName',
            //     // rowGroup: true,
            //     // filter: true,
            //     // hide: true,
            //     // resizable: true,
            //     // enableRowGroup: true,
            //     // groupDisplayType: 'group',
            //     width: 450,
            // },
            { headerName: 'AdsetName', field: 'adsetname',
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
            { headerName: 'Date', field: 'date', width: 120 },
            { headerName: 'Spend', field: 'spend', width: 120,
                aggFunc: agFunc, 
                valueFormatter: params => params.value ? Math.round(params.value*100)/100 : '',
            },
            { headerName: 'Revenue', field: 'revenue', width: 120,
                aggFunc: agFunc,
                valueFormatter: params => params.value ? Math.round(params.value*100)/100 : '', 
            },
            { headerName: 'Profit', field: 'profit', width: 120, cellClassRules:{
                'font-red': p => p.value < 0
                },
                aggFunc: agFunc,
                valueFormatter: params => params.value ? Math.round(params.value*100)/100 : '',
            },
            { headerName: 'Margin', field: 'margin', valueGetter: getMargin,
                
            },
            { headerName: 'Rpc', field: 'rpc', valueGetter: getRpc},
            { headerName: 'Cpl', field: 'cpl', valueGetter: getCpl},
            { headerName: 'Ncpl', field: 'ncpl', valueGetter: getNcpl },
            { headerName: 'FbLeads', field: 'fbleads', width: 120, aggFunc: agFunc,   },
            { headerName: 'Conversions', field: 'conversions', width: 120, aggFunc: agFunc,   },
            { headerName: 'Fmargin', field: 'fmargin', valueGetter: getFmargin},
            { headerName: 'ROI', field: 'roi', valueGetter: getROI},
            { headerName: 'cpc', field: 'cpc',
                aggFunc: (params) => {
                    const sum = params.values.reduce((sum, value) => sum + parseFloat(value), 0);
                    return sum / params.values.length;
                },
                valueFormatter: params => params.value !== undefined ? Math.round(params.value*100)/100 : '',

            },
            { headerName: 'FbClicks', field: 'fbclicks', width: 120, aggFunc: agFunc,  },
            { headerName: 'Impressions', field: 'impressions', width: 120, aggFunc: agFunc,   },
            { headerName: 'Ctr', field: 'ctr', valueGetter: getCtr},
            
            { headerName: 'AdsetId', field: 'adsetid' },
    ];

    return(
        <div>
            {/* <h1>{params.campaignAndAccount}hi</h1> */}
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
                <div className="ag-theme-alpine ag-container" >
                    <AgGridReact
                        rowData={dailyData}
                        columnDefs={dailyColumns}
                        grandTotalRow = "bottom"
                        // onCellClicked={onCellClicked}
                        // height={520}
                        // pagination={true}
                        // paginationPageSize={30}
                        // paginationPageSizeSelector={[10,20,30]}
                        groupDisplayType='multipleColumns'
                        suppressAggFuncInHeader={true}
                        groupSuppressBlankHeader ={true}
                        groupIncludeTotalFooter ={true}
                        rowGroupPanelShow='always'
                        groupIncludeFooter={true}
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
        </div>
    )
}