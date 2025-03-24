"use client"
import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import React from 'react';
import {  Button, Result } from 'antd';
import { SmileOutlined} from '@ant-design/icons';
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

const AgencyAndBMNameReports = ({startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, campaignComments, Camapignlevelstatus, userdetails, refreshComments, refreshpage}) => {
    const {theme} = useTokenContext();
    const {apiClient} = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

    const [BMNameData, setBMNameData] = useState([]);

    const [apiStatus, setApiStatus] = useState(false);

    

    const [selectedCells, setSelectedCells] = useState([]);

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

    const avgRpcCpl = (params) => {
        const validValues = params.values.filter(value => !isNaN(value) && isFinite(value));
        if (validValues.length === 0) {
            return 0;
        }
        const sum = validValues.reduce((acc, value) => acc + value, 0);
        const average = sum / validValues.length;
        return parseFloat(average);
    };

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

    const BMNameColumnDefs = [
        {
            field: 'BMName',
            headerName: 'BMName',
            minWidth: 150,
            // resizable: true,
            sortable: true,
            // hide: true, // Hide column as it's grouped
            rowGroup: true,
            enableRowGroup: true,
            flex: 9,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class

        },
        {
            field: 'AgencyName',
            headerName: 'AgencyName',
            minWidth: 150,
            // resizable: true,
            sortable: true,
            // hide: true, // Hide column as it's grouped
            // rowGroup: true,
            // enableRowGroup: true,
            flex: 8,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class

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
            filter: true,
            minWidth: 100,
            flex: 4,
            aggFunc: spender,
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
        },
        {
            field: "estimated_revenue",
            headerName: "Revenue",
            resizable: true,
            sortable: true,
            filter: true,
            minWidth: 110,
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
            flex: 4,
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            aggFunc: spender,
            filter: true,
            valueFormatter: currencyFormatter,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
        },
        {
            field: "margin",
            headerName: 'Margin',
            aggFunc: average,
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            minWidth: 105,
            flex: 4,
            valueFormatter: marginFormatter,
            filter: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
        },
        {
            field: 'rpc',
            headerName: 'RPC',
            aggFunc: avgRpcCpl,
            valueFormatter: rpcCplFormatter,
            minWidth: 90,
            flex: 3,
            filter: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu', // Add a custom class
            cellStyle: { fontWeight: 'bold' }
        },
        {
            field: 'cpl',
            headerName: 'CPL',
            aggFunc: avgRpcCpl,
            valueFormatter: rpcCplFormatter,
            minWidth: 90,
            flex: 3,
            filter: true,
            suppressMenu: true,
            menuTabs: [],
            headerClass: 'hide-menu' // Add a custom class
        }
    ];

    const [BMNameFixedFooter, setBMNameFixedFooter] = useState([]);

    const [isLoading, setLoading] = useState(true);

    const oneTimeFetch = useRef(true);

    function groupAndCalculateBMNameAndAgency(data) {
        const groupedData = data.reduce((acc, item) => {
            const key = `${item.BMName}-${item.AgencyName}-${item[`${newtime}Date`]}`;
    
            if (!acc[key]) {
                acc[key] = {
                    BMName: item.BMName,
                    AgencyName: item.AgencyName,
                    [`${newtime}Date`]: item[`${newtime}Date`],
                    estimated_revenue: 0,
                    spend: 0,
                    conversions: 0,
                    fbLeads: 0,
                    adClicks: 0, // Store total ad_clicks
                };
            }
    
            acc[key].estimated_revenue += item.estimated_revenue || 0;
            acc[key].spend += parseFloat(item.spend) || 0;
            acc[key].conversions += item.conversions || 0;
            acc[key].fbLeads += parseInt(item.fbLeads) || 0;
            acc[key].adClicks += item.ad_clicks || 0; // Sum ad_clicks separately
    
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
            };
        });
    }
    // const onRangeSelectionChanged = (params) => {
    //     // Capture all selected cell positions when range is selected
    //     const selected = [];
    //     const rangeSelections = params.api.getCellRanges();
    
    //     if (rangeSelections) {
    //         rangeSelections.forEach((range) => {
    //             const startRow = Math.min(range.startRow.rowIndex, range.endRow.rowIndex);
    //             const endRow = Math.max(range.startRow.rowIndex, range.endRow.rowIndex);
    //             const columns = range.columns.map((col) => col.getColId());
    
    //             for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
    //                 selected.push({ rowIndex, columns });
    //             }
    //         });
    //     }
    
    //     setSelectedCells(selected);
    // };
    
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
                console.log("Copied to clipboard:", copiedText);
            }).catch((err) => {
                console.error("Clipboard copy failed:", err);
            });
    
            // ✅ Trigger AG Grid’s built-in copy effect (blinking dark blue selection)
            params.api.copySelectedRangeToClipboard();
        }
    };

    const memorizedBMNameData = useMemo(()=> BMNameData, [BMNameData]);
    const memorizedBMNameColumnDefs = useMemo(()=>BMNameColumnDefs, [BMNameColumnDefs]);
    console.log(memorizedBMNameData);
    console.log(memorizedBMNameColumnDefs);

    const functionCall1 = async () => {
        try{
            const collectionName = newRevenuePratner === "FB_DomainActive" ? "Facebook_DActive_Names" : newtworkCollections[newRevenuePratner];
            const fetchData = await apiClient.get(`/Live?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=${collectionName}`);
            const mainData1 = fetchData.data;
            const mainData =  mainData1.filter(obj => !("ad_clicks" in obj));
            let campaignComments = [];

            if (fetchData.status === 200 && mainData1.length > 0) {
                const groupAndCalculateBMName1 = groupAndCalculateBMNameAndAgency(mainData1);
                setBMNameData(groupAndCalculateBMName1);
                // setBMNameColumnDefs();
                setBMNameFixedFooter([
                    {
                        // domain:'Totals',
                        [`${newtime}Date`]: 'Totals',
                        spend: parseFloat(groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0).toFixed(2)),
                        estimated_revenue: parseFloat(groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.estimated_revenue), 0).toFixed(2)),
                        profit: parseFloat(groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0).toFixed(2)),
                        margin: parseFloat((groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr.estimated_revenue), 0) * 100).toFixed(2)),
                        rpc: parseFloat((groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.rpc), 0) / groupAndCalculateBMName1?.length).toFixed(2)),
                        cpl: parseFloat((groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.cpl), 0) / groupAndCalculateBMName1?.length).toFixed(2)),
                        conversions: parseFloat(groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.conversions), 0).toFixed(2)),
                        // clicks: parseFloat(groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.clicks), 0).toFixed(2)),
                        // impressions: parseFloat(groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0).toFixed(2)),
                    }
                ]);
                console.log("hihi");
            }
            else{
                setBMNameData([]);
                setBMNameFixedFooter([]);
            }
            setLoading(false);
            fetchData.status === 200 && setApiStatus(false) ;
        }
        catch(error){
            setApiStatus(true);
            setLoading(false);
        }

    }
    const handleReFetchData = () => {
        functionCall1();
        setApiStatus(false);
    }
    useEffect(() => {
        if(oneTimeFetch.current){
            functionCall1();
            oneTimeFetch.current = false;
        }
    }, [oneTimeFetch.current]);

    useEffect(() => {
        if (refreshpage === "Refresh4") {
            handleReFetchData();
        }
    }
    , [refreshpage]);
    console.log(BMNameData);
    return(
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
                ) : BMNameData?.length > 0 ? (

                    <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>


                        <AgGridReact
                            rowData={memorizedBMNameData}
                            columnDefs={memorizedBMNameColumnDefs}
                            // defaultColDef={defaultColDef}
                            gridOptions={{
                                groupDefaultExpanded: -1, // Expands all groups by default
                                ensureDomOrder: false,
                                suppressRowClickSelection: true,
                                suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                            }}
                            suppressAggFuncInHeader={true}
                            pinnedBottomRowData={BMNameFixedFooter}
    
                            // onRangeSelectionChanged={onRangeSelectionChanged} // ✅ Captures range selection
                            onCellKeyDown={onCellKeyDown}
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
                            getCellStyle={(params) => {
                                // Check if the current cell is selected
                                const isSelected = selectedCells.some(
                                    (cell) => cell.rowIndex === params.node.rowIndex && cell.columns.includes(params.column.getId())
                                );
                                return isSelected ? { backgroundColor: "#007bff", color: "#fff" } : {}; // ✅ Highlight only selected cells
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
                                            (filteredData.reduce((acc, curr) => acc + parseFloat(curr?.rpc || 0), 0) / filteredData.length || 0).toFixed(2)
                                        ),
                                        // cpl: parseFloat(
                                        //     (filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpl || 0), 0) / filteredData.length || 0).toFixed(2)
                                        // ),
                                        // impressions: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions || 0), 0).toFixed(2)),
                                    },
                                ];

                                setBMNameFixedFooter(updatedFooter);
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
                        /> :(startDate !== endDate ? <Result
                            className={theme === 'dark' ? 'dark-result' : 'light-result'}
                            icon={<SmileOutlined />}
                            title={`No Agency and BMName Data for ${newaccount} from ${startDate} to ${endDate}`}
                        // extra={<Button type="primary">Next</Button>}
                        /> : <Result
                            className={theme === 'dark' ? 'dark-result' : 'light-result'}
                            icon={<SmileOutlined />}
                            title={`No Agency and BMName Data for ${newaccount} to ${startDate}`}
                        // extra={<Button type="primary">Next</Button>}
                        />)}
                </div>}
            </div>
        </div>
    );
};

export default AgencyAndBMNameReports;
