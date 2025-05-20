"use client"
import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import React from 'react';
import moment from 'moment-timezone';
import {  Button, Row, Col, Typography, Result } from 'antd';
import {  DownloadOutlined, SmileOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { Space } from 'antd';
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
const { Text } = Typography;
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
    "FB_Tonic1": "Facebook_Tonic1",
    "FB_Sedo": "Facebook_Sedo"
}


const System1Keywords = ({startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, campaignComments, Camapignlevelstatus, changeRRefrst, userdetails, refreshComments, refreshpage, getMainMenuItems}) => {
    const {theme} = useTokenContext();
    const {apiClient} = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

    const [system1KeywordData, setSystem1KeywordData] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [sFixedFooter, setSFixedFooter] = useState([]);

    const [selectedCells, setSelectedCells] = useState([]); // Store selected cell positions
    const [firstSelectedCell, setFirstSelectedCell] = useState(null); // Store the first selected cell

    const [apiStatus, setApiStatus] = useState(false);

    const [isLoading4, setLoading4] = useState(true);

    const timezone = useRef();

    const cronStatus = useRef();

    const accountStatus = useRef();

    const gridRef4 = useRef();

    const newDailyData = useRef();

    const oneTimeFetch = useRef(true);

    const onBtExport = (gridRef, text) => {
        const Details = {
            network : newRevenuePratner,
            account: newaccount,
            dateRange: `From ${startDate} to ${endDate}`,
            type: text,
            email: userdetails?.email,
            time: moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A")
        }
        if (gridRef.current) {
            gridRef.current.api.exportDataAsCsv({
                processCellCallback: (params) => {
                    const node = params.node;
                    if (node.group) {
                        return null;
                    }
                    return params.value;
                },
                shouldRowBeSkipped: (params) => {
                    return params.node.group;
                },
            });
        } else {
            console.error("Grid reference is null");
        }
        const updateDetails = async()=>{
            await apiClient.post('/UserExportActivities/', { Details });
        }
        updateDetails();
    };

    const autoGroupColumnDefDomain = {
        headerName: 'Domain', // Display name for the grouped column
        minWidth: 300, // Set width for grouped rows
        resizable: true, // Enable resizing
        sortable: true, // Enable sorting
        cellRendererParams: {
            suppressCount: true, // Suppress row count in the grouped column
        },
    };

    const columnDefsObject4 = useMemo(()=> 
        [
            {
                headerName: 'Domain',
                field: 'domain',
                sortable: true,
                filter: 'agTextColumnFilter',
                resizable: false,
                width: 350, // Fixed width for Domain column
                cellStyle: { textAlign: 'left' },
                rowGroup: true, // Grouping by DOMAIN
                hide: true, // Hide this column in the grid, but it will still be used for grouping
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Keyword',
                field: 'keyword',
                sortable: true,
                filter: 'agTextColumnFilter',
                resizable: true,
                minWidth: 250,
                cellStyle: { textAlign: 'left' },
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
                cellStyle: { whiteSpace: "normal", lineHeight: "1.5" }, // Enables text wrapping
                autoHeight: true,
            },
            {
                headerName: 'Date',
                field: 'date',
                minWidth: 120,
                sortable: true,
                filter: 'agDateColumnFilter',
                filterParams: {
                    comparator: (filterLocalDateAtMidnight, cellValue) => {
                        const cellDate = new Date(cellValue); // Convert date string to Date object
                        if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) return 0;
                        if (cellDate < filterLocalDateAtMidnight) return -1;
                        if (cellDate > filterLocalDateAtMidnight) return 1;
                        return 0;
                    },
                },
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Rpc',
                field: 'Rpc',
                sortable: true,
                filter: 'agNumberColumnFilter',
                resizable: true,
                minWidth: 100,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
                cellStyle: { fontWeight: 'bold' },
                aggFunc: (params) => {
                    let sum = 0;
                    let count = 0;
            
                    params.values.forEach(value => {
                        const numValue = parseFloat(value); // Ensure the value is a number
                        if (!isNaN(numValue) && value !== null && value !== undefined) {
                            sum += numValue;
                            count++;
                        }
                    });
            
                    return count > 0 ? (sum / count).toFixed(2) : 0; // Return formatted value, default to 0
                },
                valueFormatter: (params) => params.value ? `$${params.value}` : '$0.00', // Format display
            },
            {
                headerName: 'Revenue',
                field: 'revenue',
                sortable: true,
                filter: 'agNumberColumnFilter',
                resizable: true,
                valueFormatter: (params) => params.value ? `$${params.value.toFixed(2)}` : '$0.00',
                minWidth: 110,
                aggFunc: 'sum',
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Clicks',
                field: 'clicks',
                sortable: true,
                filter: 'agNumberColumnFilter',
                resizable: true,
                minWidth: 95,
                aggFunc: 'sum',
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Searches',
                field: 'searches',
                sortable: true,
                filter: 'agNumberColumnFilter',
                resizable: true,
                minWidth: 115,
                aggFunc: 'sum',
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Vertical',
                field: 'vertical',
                sortable: true,
                filter: 'agTextColumnFilter',
                resizable: true,
                minWidth: 120,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Country',
                field: 'country',
                sortable: true,
                filter: 'agTextColumnFilter',
                resizable: true,
                minWidth: 100,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
            {
                headerName: 'Device Type',
                field: 'deviceType',
                sortable: true,
                filter: 'agTextColumnFilter',
                resizable: true,
                minWidth: 130,
                suppressMenu: true,
                menuTabs: [],
                headerClass: 'hide-menu',
            },
        ], []);
    const functionCall5 = async () => {
        try {
            setLoading4(true);
            const fetchData = await apiClient.get(`https://prodapis.adsgoat.in/System1Keywords?startDate=${startDate}&endDate=${endDate}`);
            const mainData = fetchData.data;
            console.log(mainData, "mainData of functionCall5");

            let totalSpend = 0;
            let totalRevenue = 0;
            let totalClicks = 0;
            let totalSearches = 0;

            // Process the data if it's available
            const filteredData = mainData && mainData.length > 0 ? mainData.map((eachData) => {
                const Revenue = eachData.estimated_revenue || 0; // Make sure ESTIMATED_REVENUE exists
                const clicks = eachData.clicks || 0;  // Default to 0 if undefined
                const searches = eachData.searches || 0; // Default to 0 if undefined
                totalRevenue += Revenue;
                totalSpend += Revenue;
                totalClicks += clicks;
                totalSearches += searches;
                const rpc = (Revenue/clicks).toFixed(2);
                return {
                    date: eachData.DATE,
                    domain: eachData.DOMAIN,
                    vertical: eachData.VERTICAL,
                    keyword: eachData.KEYWORD,
                    country: eachData.COUNTRY,
                    deviceType: eachData.DEVICE_TYPE,
                    searches: searches,
                    clicks: clicks,
                    revenue: Revenue,
                    Rpc: rpc
                };
            }) : [];

            // Log filtered data to check
            console.log(filteredData, "filteredData");

            setSystem1KeywordData(filteredData);

            setSFixedFooter([
                {
                    revenue: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
                }
            ]);
            fetchData.status === 200 && setApiStatus(false);
            newDailyData.current = filteredData;
            setLoading4(false); // Hide loading spinner
        } catch (error) {
            setSystem1KeywordData([]);
            setLoading4(false);
            error.response.status === 500 ? setApiStatus(true) : setApiStatus(false);
        }
    };
    const defaultColDef = {
        comparator: (valueA, valueB) => {
            // Default comparator for handling null or undefined values
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        },
        sortable: true,  // Enable sorting for all columns by default
        // filter: true,    // Enable filtering for all columns by default
        resizable: true,
        flex: 1,
        minWidth: 150,
        filter: true, // Enable default filtering
        suppressHeaderMenuButton: false, // Ensure filter menu button is visible
        suppressHeaderContextMenu: false,
    };
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
    const onCellClicked = (event) => {
        
        if (event.colDef.field === 'adsetname') {
            const value = event.value;
            if (value !== undefined) {
                const url = `/DailyAndCampaignHistory/AdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                window.open(url, '_blank', 'noopener,noreferrer');
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
    const showModal = () => {
        setIsModalOpen(true);
    };
    // const getMainMenuItems = (params) => {
    //     const defaultItems = params.defaultItems.slice();

    //     // Find and override the "Reset Columns" option
    //     const resetColumnsItemIndex = defaultItems.findIndex(item => item === 'resetColumns');
    //     if (resetColumnsItemIndex > -1) {
    //         defaultItems[resetColumnsItemIndex] = {
    //             name: 'Reset Columns (Custom)',
    //             action: () => {
    //                 changeRRefrst();
    //             },
    //             cssClasses: ['custom-reset-columns-item']
    //         };
    //         defaultItems.splice(resetColumnsItemIndex + 1, 0, {
    //             name: 'Add New Column',
    //             action: showModal,
    //             cssClasses: ['custom-new-item'], // Assign a custom class for skyblue background
    //         });
    //     }

    //     return defaultItems;
    // };

    const pinnedBottomRowData4 = [
        {
            Rpc: (parseFloat(system1KeywordData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0), 0) / 
            parseFloat(system1KeywordData.reduce((acc, curr) => acc + parseFloat(curr.clicks), 0))).toFixed(2),
            searches: parseFloat(system1KeywordData.reduce((acc, curr) => acc + parseFloat(curr.searches), 0).toFixed(2)),
            clicks: parseFloat(system1KeywordData.reduce((acc, curr) => acc + parseFloat(curr.clicks), 0).toFixed(2)),
            revenue: parseFloat(system1KeywordData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
        }
    ];

    const handleReFetchData = () => {
        functionCall5();
        setApiStatus(false);
    }

    useEffect(() => {
        if (refreshpage === "Refresh5" && newRevenuePratner === "FB_System1") {
            handleReFetchData();
        }
    }
    , [refreshpage]);

    useEffect(() => {
        if(oneTimeFetch.current){
            functionCall5();
            oneTimeFetch.current = false;
        }
    }, [oneTimeFetch.current]);

    const memorizedSystem1KeywordData = useMemo(()=>system1KeywordData,[system1KeywordData]);

    return(
        <div>
            <div style={contentStyle}>
                {isLoading4 === true ? (
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
                ) : system1KeywordData?.length > 0 ? (
                    <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>
                        <Row style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap', backgroundColor: theme === "dark" && "#4d4d4d" }}>
                            <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                                <Space align="center" className='daily-contaier'>
                                    <Text style={{ paddingLeft: '3px', fontSize: '15px', fontWeight: '600', color: theme === "dark" && "white" }}>Domain</Text>
                                </Space>
                            </Col>
                            <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                <Text style={{ fontWeight: '600', color: theme === "dark" && "white" }}>Acc: {newaccount}</Text>
                            </Col>
                            <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                <Text style={{ fontWeight: '600', color: theme === "dark" && "white" }}>AccName: {newAccountName}</Text>
                            </Col>
                            <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                <Text style={{ fontWeight: '600', color: theme === "dark" && "white" }}>Timezone: {timezone.current}</Text>
                            </Col>
                            {/* <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                <Text style={{ fontWeight: '600' }}>
                                    Cron/Acc status: {cronStatus.current} /{' '}
                                    <span style={{ color: accountStatus.current === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
                                        {accountStatus.current}
                                    </span>
                                </Text>
                            </Col> */}
                            <Col xs={24} sm={24} md={4} lg={2} style={{ flex: '0.2 0 auto' }}>
                                <Tooltip title="Export to CSV">
                                    <Button type="primary" style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined className="black-icon"/>} onClick={() => onBtExport(gridRef4, "Domain")} />
                                </Tooltip>
                            </Col>
                        </Row>

                        <AgGridReact
                            ref={gridRef4}
                            rowData={memorizedSystem1KeywordData}
                            columnDefs={columnDefsObject4}
                            onCellClicked={onCellClicked}
                            pagination={true}
                            paginationPageSize={100}
                            paginationPageSizeSelector={[20, 40, 60, 80, 100]}
                            groupDisplayType="multipleColumns"
                            suppressAggFuncInHeader={true}
                            groupSuppressBlankHeader={true}
                            defaultColDef={defaultColDef}
                            autoGroupColumnDef={autoGroupColumnDefDomain}
                            onCellKeyDown={onCellKeyDown}
                            // onGridReady={(params) => onGridReady(params, 'grid5', gridRef4)}
                            // gridOptions={gridOptions4}
                            gridOptions={{
                                groupUseEntireRow: true,  // Ensures the entire row is used for grouping
                                ensureDomOrder: false,
                                suppressRowClickSelection: true,
                                suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                enableRangeSelection: true,
                            }}
                            getMainMenuItems={getMainMenuItems}
                            pinnedBottomRowData={system1KeywordData.length > 0 ? pinnedBottomRowData4 : []}
                            getRowStyle={params => {
                                if (params.node.rowPinned) {
                                    return {
                                        fontWeight: 'bold',
                                        backgroundColor: theme === "dark" ? '#000' : '#fff',
                                        color: theme === "dark" ? '#fff' : '#000',
                                    };
                                }
                                return null;
                            }}
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
                        />
                    </div>
                ) : (
                    <div style={{ backgroundColor: theme === "dark" ? "#333" : "#fff" }}>
                        {apiStatus === true ? 
                            <Result
                            className={theme === 'dark' ? 'dark-result' : 'light-result'}
                            // icon={<SmileOutlined />}
                            title={`API failed to fetch the data. Please click retry button to fetch the data`}
                            extra={<Button type="primary" onClick={handleReFetchData}>Retry</Button>}
                        /> : 
                        (startDate !== endDate ? (
                            <Result
                                className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                icon={<SmileOutlined />}
                                title={`No DomainData from ${startDate} to ${endDate}`}
                            />
                        ) : (
                            <Result
                                className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                icon={<SmileOutlined />}
                                title={`No DomainData for ${startDate}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>

    );
};

export default System1Keywords;