"use client"
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { redirect } from 'next/navigation';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import { ImHistory } from "react-icons/im";
import debounce from 'lodash.debounce';
import React from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import dayjs from 'dayjs';
// import { Select } from 'antd';
import { Carousel, Input, Button, Pagination, Row, Col, Typography, Result, Modal, message, ConfigProvider, theme  } from 'antd';

// import 'antd/dist/reset.css';
import { CommentOutlined, CustomerServiceOutlined, MenuOutlined, InfoCircleOutlined, DownloadOutlined, SearchOutlined, ArrowLeftOutlined, ArrowRightOutlined, SmileOutlined, ReloadOutlined,CopyOutlined, StarOutlined, StarFilled, EditOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { FloatButton, Tooltip } from 'antd';
import Draggable from 'react-draggable';
// import FormControl from '@mui/material/FormControl';
// import Select from '@mui/material/Select';
import { Select } from 'antd';
import { DatePicker, Space } from 'antd';
const { RangePicker } = DatePicker;
import 'antd/dist/reset.css';
import '../globals.css';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
// import {useTokenContext}  from '..parent.js'
// import { useContext } from 'react';
// import 'antd/dist/antd.css';
import locale from 'antd/es/date-picker/locale/en_US';
import { useTokenContext } from '../components/parent'
import { RiLiveFill } from 'react-icons/ri';
import { FaDailymotion } from 'react-icons/fa';
const { Text } = Typography;
const contentStyle = {
    margin: 0,
    // height: '800px',
    color: '#66fc03',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#fbfcfa',
};

// function debounce(func, wait) {
//     let timeout;
//     return function(...args) {
//         clearTimeout(timeout);
//         timeout = setTimeout(() => func.apply(this, args), wait);
//     };
// }

const CustomHeader = (props) => {
    const { displayName, tooltip, api, column } = props;

    const onFilterClicked = () => {
        api.showColumnMenuAfterButtonClick(column, document.querySelector('.custom-header-icon'));
    };





    return (
        <div>
            <span>{displayName}</span>
            <InfoCircleOutlined title={tooltip} style={{ marginLeft: 5 }} />
            <div
                className="custom-header-icon"
                onClick={onFilterClicked}
                style={{ display: 'inline', marginLeft: 5, cursor: 'pointer' }}
            >
                <i className="ag-icon ag-icon-menu" />
            </div>
        </div>
    );
};





// export default CustomHeader;

// Function to filter menu items and show only filter option


const newtworkCollections = {
    "FB_Mnet": "Facebook_Mnet",
    "FB_MnetBing": "Facebook_MnetBing",
    "FB_Enki": "Facebook_Enki",
    "FB_System1": 'Facebook_System1',
    "FB_Rsoc": 'Facebook_Rsoc',
    "FB_Tonic": 'Facebook_Tonic',
    "FB_DomainActive": "Facebook_DomainActive",
    "FB_Bodies": "Facebook_Bodies",
    "FB_Bodies1": "Facebook_Bodies1"
}

const MyTablePage = () => {
    const { userdetails } = useTokenContext();
    // const router = useRouter();
    
    const { theme } = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
    if (userdetails === null) {
        redirect("/Dashboard");
        // console.log("hi");
    }
    console.log(userdetails, "userDetails");
    const [darkMode, setDarkMode] = useState(false);
    // console.log(userdetails._id, "id");

    const { adAccounts } = userdetails;

    console.log(adAccounts, "addAccounts");

    const networks = Object.keys(adAccounts);

    const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
    console.log('Yesterday\'s date:', yesterday);


    // console.log(networks,"networks");

    // console.log('userdetails:',userdetails);

    // Define your rowData and columnDefs
    const columnStructure = [
        "date",
        "spend",
        "revenue",
        "profit",
        "campaignname",
        "margin",
        "fbleads",
        "conversions",
        "fbclicks",
        "impressions",
        "cpl",
        "ncpl",
        "rpc",
        "cpc",
        "ctr",
        "roi",
        "fmargin",
        "adsetname",
        "fb-hour",
        "mnet-hour",
        "adsetid",
        "campaignid",
        "timezone"
    ];

    const [initialRowData, setInitialRowData] = useState([]);

    const [rowData, setRowData] = useState([]);

    const [campaignData, setCampaignData] = useState([]);

    // const [defaultTimezone] = useState('UTC');

    // const [mainComponent, setMainComponent] = useState(false);

    const [url1, setUrl1] = useState('FbMnetUI');

    const [url2, setUrl2] = useState('FbMnetDailyUI');

    const [url3, setUrl3] = useState('MnetAllCampaigns');

    const [dailyData, setdailyData] = useState([]);

    const [startDate, setStartDate] = useState(yesterday);

    const [endDate, setEndDate] = useState(yesterday);

    const [revenuePratner, setRevenuePartner] = useState([networks[0]]);

    const [isSearching, setIsSearching] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const handleSearchClick = () => {
        setIsSearching(true);
    };

    const handleBlur = () => {
        if (inputValue.trim() === '') {
            setIsSearching(false);
        }
    };

    const handleChangeInput = (e) => {
        setInputValue(e.target.value);
        // console.log(e.target.value);
        // const filteredLiveData = rowData.filter((each)=> each.campaignName.includes(e.target.value));

        // const filteredDailyData = dailyData.filter((each)=> each.campaignName.includes(e.target.value));
        // const filteredAllCampaignsData = campaignData.filter((each)=> each.campaignName.includes(e.target.value));
        // setRowData(filteredLiveData);
        // setdailyData(filteredDailyData);
        // setCampaignData(filteredAllCampaignsData);
    };

    // const [rowStructure, setRowStructure] = useState(); 

    // const [columnOrder, setColumnOrder] = useState(JSON.parse(localStorage.getItem("columnState")));



    const accountsForAccess = adAccounts[revenuePratner];
    console.log(accountsForAccess, "accounts Access");
    console.log(accountsForAccess[0], "accountFor Access");

    const accountsAccess = accountsForAccess === undefined ? [] : accountsForAccess;

    const [networksData, setNetworksData] = useState(accountsAccess);

    const [isLoading, setLoading] = useState(true);

    const [isLoading1, setLoading1] = useState(true);

    const [isLoading2, setLoading2] = useState(true);

    const [isTrue, setTrue] = useState(false);

    const [account, setAccount] = useState(typeof accountsForAccess[0] === 'string' ? accountsForAccess[0] : accountsForAccess[0].accountNumber);

    const [time, setTime] = useState('UTC');

    const [pageSize, setPageSize] = useState(1);

    // const [fetchvalue, setValue] = useState([]);

    const timezone = useRef();

    const cronStatus = useRef();

    const accountStatus = useRef();

    const carouselRef = useRef();

    const maxHour = useRef();

    const maxNetworkHour = useRef();

    // const columnApiRef = useRef(null);

    const gridRef = useRef();

    const gridRef1 = useRef();

    const gridRef2 = useRef();

    const [gridKey, setGridKey] = useState(0);

    const filterRef = useRef(null);

    const totalItems = useRef();


    const newRowData = useRef();

    const newDailyData = useRef();

    const newCampaignData = useRef();
    
    const [fixedFooter, setFixedFooter] = useState([]);

    const isInitialLoad = useRef(true);
    //Modal States
    const [newColumnName, setNewColumnName] = useState('');
    const [formula, setFormula] = useState('');

    const onChange1 = (currentSlide) => {
        console.log(currentSlide);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };

    

    const handleOk = () => {
        if (!newColumnName || !formula) {
            message.error('Please fill in all fields.');
            return;
        }
    
        const lowerCaseFormula = formula.toLowerCase();
    
        try {
            // Define the new column definition
            const newColumnDef = {
                headerName: newColumnName,
                field: newColumnName.toLowerCase(),
                valueGetter: (params) => {
                    if (!params.data) return null;
                    try {
                        const originalKeys = Object.keys(params.data);
                        const sanitizedKeys = originalKeys.map(key => key.replace(/[^a-zA-Z_$0-9]/g, '_'));
                        const values = Object.values(params.data);
    
                        // Log the sanitized keys
                        console.log('Original Keys:', originalKeys);
                        console.log('Sanitized Keys:', sanitizedKeys);
    
                        const keyMapping = {};
                        sanitizedKeys.forEach((key, index) => {
                            keyMapping[key] = originalKeys[index];
                        });
    
                        // Constructing the function safely using sanitized keys
                        const func = new Function(...sanitizedKeys, `return ${lowerCaseFormula}`);
    
                        // Map the values back to their original keys for function execution
                        const mappedValues = sanitizedKeys.map(key => params.data[keyMapping[key]]);
                        return func(...mappedValues);
                    } catch (error) {
                        console.error('Error evaluating formula:', error);
                        return null;
                    }
                },
                sortable: true,
                filter: true,
                aggFunc: (params) => {
                    // Aggregate function to handle grouped rows
                    try {
                        // Extract all the values in the group for this column
                        const values = params.values;
    
                        // Log the values to be aggregated
                        console.log('Values to aggregate:', values);
    
                        // Define how you want to aggregate these values.
                        // Example: You might want to sum them, average them, etc.
                        // Here, we'll sum the values for demonstration purposes.
                        const sum = values.reduce((acc, value) => acc + (value || 0), 0);
    
                        return sum; // Replace with other aggregation logic if needed
                    } catch (error) {
                        console.error('Error in aggregation function:', error);
                        return null;
                    }
                },
                cellStyle: { backgroundColor: 'skyblue' },
                headerCellStyle: { backgroundColor: 'skyblue', color: 'black' }
            };
    
            // Update the column definitions
            setColumnDefs((prevDefs) => [...prevDefs, newColumnDef]);
            columnDefs1.current = [...columnDefs1.current, newColumnDef];
            columnDefs2.current = [...columnDefs2.current, newColumnDef];
    
            // Common function to update data
            const updateData = (prevData) => {
                return prevData.map((row) => {
                    const updatedRow = { ...row };
                    try {
                        const originalKeys = Object.keys(row);
                        const sanitizedKeys = originalKeys.map(key => key.replace(/[^a-zA-Z_$0-9]/g, '_'));
                        const values = Object.values(row);
                        console.log(values, "values1");
    
                        const keyMapping = {};
                        sanitizedKeys.forEach((key, index) => {
                            keyMapping[key] = originalKeys[index];
                        });
    
                        const func = new Function(...sanitizedKeys, `return ${lowerCaseFormula}`);
                        const mappedValues = sanitizedKeys.map(key => row[keyMapping[key]]);
                        updatedRow[newColumnName.toLowerCase()] = func(...mappedValues);
                    } catch (error) {
                        console.error('Error evaluating formula for data update:', error);
                        updatedRow[newColumnName.toLowerCase()] = null;
                    }
                    return updatedRow;
                });
            };
    
            // Update data with the new column
            setRowData((prevData) => updateData(prevData));
            setdailyData((prevData) => updateData(prevData));
            setCampaignData((prevData) => updateData(prevData));
    
        } catch (error) {
            console.error('Error adding column:', error);
        }
        setNewColumnName('');
        setFormula('');
        setIsModalOpen(false);
    };
    
    
    
    
    
    
    
    
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    // const spender = (params) => {
    //     var total = 0;
    //     params.values.forEach((value) => (total += parseFloat(value)));
    //     var total1 = total.toString()
    //     var total2 = total1.split(".")
    //     if (total2[1] !== undefined && total2[1] !== null && total2[1].length > 2) {
    //       var total22 = total2[1].slice(0, 2)
    //       var totalone = total2[0] + '.' + total22
    //     //   console.log(parseFloat(totalone).toFixed(2), "totalone");
    //     return parseFloat(totalone).toFixed(2)

    //     }
    //     console.log(total, "total");
    //     return total
    // };
    const getMainMenuItems = (params) => {
        const defaultItems = params.defaultItems.slice();
        
        // Find and override the "Reset Columns" option
        const resetColumnsItemIndex = defaultItems.findIndex(item => item === 'resetColumns');
        if (resetColumnsItemIndex > -1) {
            defaultItems[resetColumnsItemIndex] = {
                name: 'Reset Columns (Custom)',
                action: () => {
                    // Your custom logic here
                    console.log('Custom Reset Columns logic');
                    updatingColumnsStructure(columnStructure)
                    // setTimeout(() => {
                    //     window.location.reload();
                    // }, 2000);
                    // Example: Reset column order to default
                    // params.columnApi.resetColumnState();
                },
                cssClasses: ['custom-reset-columns-item']
            };
            defaultItems.splice(resetColumnsItemIndex + 1, 0, {
                name: 'Add New Column',
                action: showModal,
                cssClasses: ['custom-new-item'], // Assign a custom class for skyblue background
            });
        }
    
        return defaultItems;
    };

    const liveSpender = (params) => {
        const total = params.values.reduce((acc, value) => acc + parseFloat(value || 0), 0);
        return Math.round(total * 100) / 100; // Round to 2 decimal places
    };
    
    const currencyFormatter = (params) => {
        return `$${parseFloat(params.value || 0).toFixed(2)}`; // Ensure 2 decimal places in currency format
    };


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
                if (CPL === Infinity) {
                    return 0;
                }
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
    };


    // (["campaignName", 
    // "adsetname",
    // "spend", 
    // "revenue", 
    // "date", 
    // "fb-hour", 
    // "mnet-hour",
    // "profit", 
    // "margin",
    // "fbleads",
    // "conversions",
    // "cpc",
    // "fbclicks",
    // "impressions",
    // "ctr",
    // "rpc",
    // "cpl",
    // "ncpl",
    // "fmargin",
    // "roi",
    // "adsetid",
    // "compaignid", 
    // "timezone"]);

    // const CustomHeader = (props) => {
    //     const handleMenuClick = () => {
    //         // Handle menu click action here
    //         console.log('Menu clicked for column:', props.column.getColId());
    //     };

    //     return (
    //         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    //             <div>{props.displayName}</div>
    //             <MenuOutlined onClick={handleMenuClick} />
    //         </div>
    //     );
    // };

    const onFilterChanged = () => {
        if (gridRef.current) {
            const filterModel = gridRef.current.api.getFilterModel();
            const adsetNameFilter = filterModel.adsetName;

            // Determine if the 'Select All' option is unchecked
            const isSelectAllUnchecked = !adsetNameFilter || !adsetNameFilter.values || adsetNameFilter.values.length === 0;

            // Update footer properties based on the 'Select All' option state
            gridRef.current.api.setGridOptions({
                groupIncludeTotalFooter: !isSelectAllUnchecked,
                groupIncludeFooter: !isSelectAllUnchecked
            });

            // Show all data if 'Select All' is unchecked, otherwise show filtered data
            if (isSelectAllUnchecked) {
                setRowData([...initialRowData]);
            } else {
                const filteredData = initialRowData.filter(row =>
                    adsetNameFilter.values.includes(row.adsetName)
                );
                setRowData(filteredData);
            }

            // Refresh the grid to apply the changes
            gridRef.current.api.refreshClientSideRowModel('filter');
        }
    };

    // Call the function when the grid is ready
    useEffect(() => {
        if (gridRef.current && gridRef.current.api) {
            const currentGridApi = gridRef.current.api;

            currentGridApi.addEventListener('filterChanged', onFilterChanged);

            // Cleanup function to remove the event listener when the component unmounts
            return () => {
                currentGridApi.removeEventListener('filterChanged', onFilterChanged);
            };
        }
    }, [gridRef, initialRowData]);


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

    function customTextFilterFunction(filter, value, filterText) {
        if (!filterText) {
            return true;
        }
        return value != null && value.toString().toLowerCase().includes(filterText.toLowerCase());
    }

    const CopyableCell = ({ value }) => {
        const [tooltipText, setTooltipText] = useState("Copy to clipboard");
    
        const copyToClipboard = () => {
            navigator.clipboard.writeText(value).then(() => {
                setTooltipText("Copied!");
                setTimeout(() => setTooltipText("Copy to clipboard"), 2000); // Reset tooltip text after 2 seconds
            }).catch(() => {
                alert('Failed to copy!');
            });
        };
    
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                    {value}
                </span>
                <Tooltip title={tooltipText}>
                    <CopyOutlined
                        onClick={copyToClipboard}
                        style={{ cursor: 'pointer', marginLeft: '8px', color: '#1e1e1f' }}
                    />
                </Tooltip>
            </div>
        );
    };
    
    const campaignNameRenderer = (params) => {
        const cell = document.createElement('div');
        ReactDOM.render(<CopyableCell value={params.value} />, cell);
        return cell;
    };
    

    // const handleAddColumn = () => {
    //     if (newColumnName && formula) {
    //         // Convert the formula to lowercase
    //         const lowerCaseFormula = formula.toLowerCase();
    
    //         // Add new column definition
    //         const newColumnDef = {
    //             headerName: newColumnName,
    //             field: newColumnName.toLowerCase(),
    //             valueGetter: (params) => {
    //                 // Create a new function that uses the formula, where column names are used directly
    //                 if (!params.data) return null;
    //                 try {
    //                     const func = new Function(...Object.keys(params.data), `return ${lowerCaseFormula}`);
    //                     return func(...Object.values(params.data));
    //                 } catch (error) {
    //                     console.error('Error evaluating formula:', error);
    //                     return null;
    //                 }
    //             }
    //         };
    
    //         setColumnDefs((prevDefs) => [...prevDefs, newColumnDef]);
    
    //         // Update row data with new column values
    //         setRowData((prevData) =>
    //             prevData.map((row) => ({
    //                 ...row,
    //                 [newColumnName]: (() => {
    //                     try {
    //                         return new Function(...Object.keys(row), `return ${lowerCaseFormula}`)(...Object.values(row));
    //                     } catch (error) {
    //                         console.error('Error evaluating formula:', error);
    //                         return null;
    //                     }
    //                 })()
    //             }))
    //         );
    
    //         // Clear input fields
    //         setNewColumnName('');
    //         setFormula('');
    //     }
    // };

    // function currencyFormatter(params) {
    //     const value = params.value || 0; // Ensure value is defined and default to 0
    //     return `$${value}`; // Format the value as currency
    // }
    

    const columnDefsObject = {
        campaignname: {
            headerName: 'CampaignName',
            field: 'campaignname',
            resizable: true,
            sortable: true,
            width: 500,
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
            pinned: 'left',
            // cellRenderer: 'agGroupCellRenderer',
            // cellRendererParams: {
            //     innerRendererFramework: GroupCellRenderer // Use a React component to render the cell content
            // }
            // filter: "agTextColumnFilter",
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'CampaignName',
            //     tooltip: 'This is a campaign name tooltip.',
            // },
            // getMainMenuItems
        },
        adsetname: {
            headerName: 'AdsetName',
            field: 'adsetname',
            sortable: true,
            minWidth: 400,
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            },

            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'AdsetName',
            //     tooltip: 'This is an adset name tooltip.',
            // },
            // getMainMenuItems
        },
        date: {
            headerName: 'Date',
            field: 'date',
            width: 120,
            sortable: true,
            filter: "agDateColumnFilter",
            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    const dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    const dateParts = dateAsString.split("/");
                    const cellDate = new Date(
                        Number(dateParts[2]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[0])
                    );

                    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                        return 0;
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                    return 0;
                },
            },
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'Date',
            //     tooltip: 'This is a date tooltip.',
            // },
            // getMainMenuItems
        },
        'fb-hour': {
            headerName: 'F-H',
            field: 'fb-hour',
            width: 85,
            sortable: true,
            filter: "agNumberColumnFilter",
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'F-H',
            //     tooltip: 'This is an FB hour tooltip.',
            // },
            // getMainMenuItems
        },
        'mnet-hour': {
            headerName: 'M-H',
            field: 'mnet-hour',
            width: 85,
            sortable: true,
            filter: "agNumberColumnFilter",
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'M-H',
            //     tooltip: 'This is an Mnet hour tooltip.',
            // },
            // getMainMenuItems
        },
        spend: {
            headerName: 'Spend($)',
            field: 'spend',
            width: 120,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agTextColumnFilter",
            valueFormatter:currencyFormatter
            // filterParams: {
            //     textCustomComparator: customTextFilterFunction,
            // },
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'Spend',
            //     tooltip: 'This is a spend tooltip.',
            // },
            // getMainMenuItems
        },
        revenue: {
            headerName: 'Revenue($)',
            field: 'revenue',
            width: 120,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter:currencyFormatter
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'Revenue',
            //     tooltip: 'This is a revenue tooltip.',
            // },
            // getMainMenuItems
        },
        profit: {
            headerName: 'Profit($)',
            field: 'profit',
            width: 120,
            sortable: true,
            aggFunc: liveSpender,
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            filter: "agNumberColumnFilter",
            valueFormatter:currencyFormatter
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'Profit',
            //     tooltip: 'Revenue - Spend',
            // },
            // getMainMenuItems
        },
        margin: {
            headerName: 'Margin(%)',
            field: 'margin',
            valueGetter: getMargin,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
              },
            valueFormatter: (params) => `${params.value}%`,
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'Margin',
            //     tooltip: 'Profit/Revenue',
            // },
            // getMainMenuItems
        },
        fbleads: {
            headerName: 'FbLeads',
            field: 'fbleads',
            width: 120,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'FbLeads',
            //     tooltip: 'This is an FB leads tooltip.',
            // },
            // getMainMenuItems
        },
        conversions: {
            headerName: 'Conversions',
            field: 'conversions',
            width: 120,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'Conversions',
            //     tooltip: 'This is a conversions tooltip.',
            // },
            // getMainMenuItems
        },
        cpc: {
            headerName: 'cpc',
            field: 'cpc',
            aggFunc: cpcSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'CPC',
            //     tooltip: 'This is a CPC tooltip.',
            // },
            // getMainMenuItems
        },
        fbclicks: {
            headerName: 'FbClicks',
            field: 'fbclicks',
            width: 120,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'FbClicks',
            //     tooltip: 'This is an FB clicks tooltip.',
            // },
            // getMainMenuItems
        },
        impressions: {
            headerName: 'Impressions',
            field: 'impressions',
            width: 120,
            aggFunc: newSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'Impressions',
            //     tooltip: 'This is an impressions tooltip.',
            // },
            // getMainMenuItems
        },
        ctr: {
            headerName: 'Ctr',
            field: 'ctr',
            valueGetter: getCtr,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
              },
            valueFormatter: (params) => `${params.value}%`,
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'CTR',
            //     tooltip: 'This is a CTR tooltip.',
            // },
            // getMainMenuItems
        },
        rpc: {
            headerName: 'Rpc',
            field: 'rpc',
            valueGetter: getRpc,
            sortable: true,
            filter: "agNumberColumnFilter",
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'RPC',
            //     tooltip: 'This is an RPC tooltip.',
            // },
            // getMainMenuItems
        },
        cpl: {
            headerName: 'Cpl',
            field: 'cpl',
            valueGetter: getCpl,
            sortable: true,
            filter: "agNumberColumnFilter",
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'CPL',
            //     tooltip: 'This is a CPL tooltip.',
            // },
            // getMainMenuItems
        },
        ncpl: {
            headerName: 'Ncpl',
            field: 'ncpl',
            valueGetter: getNcpl,
            sortable: true,
            filter: "agNumberColumnFilter",
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'NCPL',
            //     tooltip: 'This is an NCPL tooltip.',
            // },
            // getMainMenuItems
        },
        fmargin: {
            headerName: 'Fmargin(%)',
            field: 'fmargin',
            valueGetter: getFmargin,
            sortable: true,
            filter: "agTextColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
              },
            valueFormatter: (params) => `${params.value}%`,
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'Fmargin',
            //     tooltip: 'This is an Fmargin tooltip.',
            // },
            // getMainMenuItems
        },
        roi: {
            headerName: 'ROI(%)',
            field: 'roi',
            valueGetter: getROI,
            filter: "agNumberColumnFilter",
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
              },
            valueFormatter: (params) => `${params.value}%`,
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'ROI',
            //     tooltip: 'Profit/Spend',
            // },
            // getMainMenuItems
        },
        adsetid: {
            headerName: 'AdsetId',
            field: 'adsetid',
            sortable: true,
            filter: "agTextColumnFilter",
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'AdsetId',
            //     tooltip: 'This is an adset ID tooltip.',
            // },
            // getMainMenuItems
        },
        campaignid: {
            headerName: 'CampaignId',
            field: 'campaignid',
            sortable: true,
            filter: "agTextColumnFilter",
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'CampaignId',
            //     tooltip: 'This is a campaign ID tooltip.',
            // },
            // getMainMenuItems
        },
        timezone: {
            headerName: 'TimeZone',
            field: 'timezone',
            filter: "agTextColumnFilter",
            // headerComponent: CustomHeader,
            // headerComponentParams: {
            //     displayName: 'TimeZone',
            //     tooltip: 'This is a timezone tooltip.',
            // },
            // getMainMenuItems
        },
    };


    const columnDefsObject1 = {
        campaignname: {
            headerName: 'CampaignName', 
            field: 'campaignname',
            resizable: true,
            sortable: true,
            width: 500,
            hide: true,
            rowGroup: true,
            pinned: 'left',
            enableRowGroup: true,
            onClick: (event) => {
                console.log(event, "event");
                console.log('Group row clicked:', event);
                console.log(event);
                const url = `/history/${event}-${account}-${time}`;
                window.open(url, '_blank');
            },
            cellRenderer: campaignNameRenderer,
        },
        
        adsetname: {
            headerName: 'AdsetName', field: 'adsetname',
            // resizeble: true,
            sortable: true,
            width: 350,
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => a.localeCompare(b),
                suppressAndOrCondition: true,
            },
            // hide: true,
            // // resizable:false,
            // rowGroup: true,
            // filter: true,
            // pinned: 'left',
            // enableRowGroup: true,
            // autoHeight: true, 
        },
        date: {
            headerName: 'Date', field: 'date', width: 120, sortable: true,
            filter: "agDateColumnFilter",
            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    const dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    const dateParts = dateAsString.split("/");
                    const cellDate = new Date(
                        Number(dateParts[2]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[0])
                    );

                    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                        return 0;
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                    return 0;
                }
            }
        },
        'fb-hour': { headerName: 'F-H', field: 'fb-hour', width: 85, sortable: true, hide: true, filter: 'agNumberColumnFilter' },
        'mnet-hour': { headerName: 'M-H', field: 'mnet-hour', width: 85, sortable: true, hide: true, filter: 'agNumberColumnFilter' },
        spend: {
            headerName: 'Spend($)', field: 'spend', width: 150,
            aggFunc: spender,
            valueFormatter: params => params.value ? `$${Math.round(params.value * 100) / 100}` : '', sortable: true,
            filter: 'agNumberColumnFilter'
        },
        revenue: {
            headerName: 'Revenue($)', field: 'revenue', width: 150,
            aggFunc: spender,
            valueFormatter: params => params.value ? `$${Math.round(params.value * 100) / 100}` : '', sortable: true, filter: 'agNumberColumnFilter'
        },
        profit: {
            headerName: 'Profit($)', field: 'profit', width: 150, cellClassRules: {
                'font-red': p => p.value < 0
            },
            aggFunc: spender,
            valueFormatter: params => params.value ? `$${Math.round(params.value * 100) / 100}` : '', sortable: true,
            headerTooltip: 'Revenue - Spend', filter: 'agNumberColumnFilter'
        },
        margin: {
            headerName: 'Margin(%)', field: 'margin', valueGetter: getMargin, sortable: true, headerTooltip: 'Profit/Revenue', filter: 'agNumberColumnFilter',
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
              },
            valueFormatter: (params) => `${params.value}%`,

        },
        fbleads: { headerName: 'FbLeads', field: 'fbleads', width: 120, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter' },
        conversions: { headerName: 'Conversions', field: 'conversions', width: 120, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter' },
        cpc: {
            headerName: 'cpc', field: 'cpc',
            aggFunc: (params) => {
                const sum = params.values.reduce((sum, value) => sum + parseFloat(value), 0);
                return sum / params.values.length;
            },
            valueFormatter: params => params.value !== undefined ? Math.round(params.value * 100) / 100 : '',
            sortable: true, filter: 'agNumberColumnFilter'

        },
        fbclicks: { headerName: 'FbClicks', field: 'fbclicks', width: 120, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter' },
        impressions: { headerName: 'Impressions', field: 'impressions', width: 120, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter' },
        ctr: { headerName: 'Ctr', field: 'ctr', valueGetter: getCtr, sortable: true,
        comparator: (valueA, valueB) => {
            // Handle sorting based on the computed margin value
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
          },
        valueFormatter: (params) => `${params.value}%`,
         },
        rpc: { headerName: 'Rpc', field: 'rpc', valueGetter: getRpc, sortable: true, filter: 'agNumberColumnFilter' },
        cpl: { headerName: 'Cpl', field: 'cpl', valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter' },
        ncpl: { headerName: 'Ncpl', field: 'ncpl', valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter' },
        fmargin: { headerName: 'Fmargin(%)', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: true,
        comparator: (valueA, valueB) => {
            // Handle sorting based on the computed margin value
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
          },
        valueFormatter: (params) => `${params.value}%`,
         },
        roi: { headerName: 'ROI(%)', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: 'Profit/Spend', filter: true,
        comparator: (valueA, valueB) => {
            // Handle sorting based on the computed margin value
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
          },
        valueFormatter: (params) => `${params.value}%`,
         },
        adsetid: { headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter",hide: false },
        campaignid: { headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter", },
        timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", },
    };

    const columnDefsObject2 = {
        campaignname: {
            headerName: 'CampaignName', field: 'campaignname', resizeble: true,
            // sortable: true,
            resizeble: true,
            sortable: true,
            width: 500,
            hide: true,
            rowGroup: true,
            pinned: 'left',
            // lockposition: true,
            enableRowGroup: true,
            onClick: (event) => {
                console.log(event, "event");
                console.log('Group row clicked:', event);
                console.log(event);
                // const url = `/history/${event}-${account}-${time}`;
                // window.open(url, '_blank');
            
            },
            width: 450,
            pinned: 'left',// Using the group cell renderer
            // cellRenderer: 'agGroupCellRenderer',
            // cellRendererParams: {
            //     innerRendererFramework: GroupCellRenderer // Use a React component to render the cell content
            // }
            // valueGetter: (params) => {
            //     if (params.node.rowPinned) {
            //         return 'Total';  // Display "Total" for the pinned row
            //     }
            //     return params.data?.campaignName; // Display regular campaign name for normal rows
            // }
        },
        adsetname: {
            headerName: 'AdsetName', field: 'adsetname',
            // resizeble: true,
            sortable: true,
            // flex: 2,
            width: 350,
            // hide: true,
            // // // // resizable:false,
            // rowGroup: true,
            filter: true,
            // cellRendererFramework: AdsetCellRenderer,
            // cellRendererFramework: AdsetCellRenderer,
            // children: [autoGroupColumnDefAdsetName],
            // pinned: 'left',
            // enableRowGroup: true,
            // autoHeight: true,
            // cellRendererFramework: AdsetNameRenderer,

        },
        date: {
            headerName: 'Date', field: 'date', sort: 'asc', sortable: true,
            filter: "agDateColumnFilter",
            filterParams: {
                comparator: (filterLocalDateAtMidnight, cellValue) => {
                    const dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    const dateParts = dateAsString.split("/");
                    const cellDate = new Date(
                        Number(dateParts[2]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[0])
                    );

                    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                        return 0;
                    }

                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    }

                    if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    }
                    return 0;
                },
            },
        },
        spend: { headerName: 'Spend($)', field: 'spend', width: 150, aggFunc: spender, sortable: true, filter: 'agNumberColumnFilter', 
        valueFormatter:currencyFormatter },
        revenue: { headerName: 'Revenue($)', field: 'revenue', width: 150, aggFunc: spender, sortable: true, filter: 'agNumberColumnFilter',
        valueFormatter:currencyFormatter },
        profit: {
            headerName: 'Profit($)', field: 'profit', width: 150, aggFunc: spender, cellClassRules: {
                'font-red': p => p.value < 0
            }, sortable: true, headerTooltip: 'Revenue - Spend', filter: 'agNumberColumnFilter',
            valueFormatter:currencyFormatter
        },
        margin: { headerName: 'Margin(%)', field: 'margin', valueGetter: getMargin, sortable: true, headerTooltip: 'Profit/Revenue', filter: true,
        comparator: (valueA, valueB) => {
            // Handle sorting based on the computed margin value
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
          },
          valueFormatter: (params) => `${params.value}%`,
         },
        fbleads: { headerName: 'FbLeads', field: 'fbleads', width: 120, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter' },
        conversions: { headerName: 'Conversions', field: 'conversions', width: 120, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter' },
        cpc: { headerName: 'cpc', field: 'cpc', aggFunc: cpcSpender, sortable: true, filter: 'agNumberColumnFilter' },
        fbclicks: { headerName: 'FbClicks', field: 'fbclicks', width: 120, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter' },
        impressions: { headerName: 'Impressions', field: 'impressions', width: 120, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter' },
        ctr: { headerName: 'Ctr', field: 'ctr', valueGetter: getCtr, sortable: true, filter: 'agNumberColumnFilter',
        comparator: (valueA, valueB) => {
            // Handle sorting based on the computed margin value
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
          },
        valueFormatter: (params) => `${params.value}%`,
         },
        rpc: { headerName: 'Rpc', field: 'rpc', valueGetter: getRpc, sortable: true, filter: 'agNumberColumnFilter' },
        cpl: { headerName: 'Cpl', field: 'cpl', valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter' },
        ncpl: { headerName: 'Ncpl', field: 'ncpl', valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter' },
        fmargin: { headerName: 'Fmargin(%)', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: true,
        comparator: (valueA, valueB) => {
            // Handle sorting based on the computed margin value
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
          },
        valueFormatter: (params) => `${params.value}%`,
         },
        roi: { headerName: 'ROI(%)', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: 'Profit/Spend', filter: true,
        comparator: (valueA, valueB) => {
            // Handle sorting based on the computed margin value
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
          },
        valueFormatter: (params) => `${params.value}%`,
         },
        campaignid: { headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter", },
        adsetid: { headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter", },
        timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", },
        'fb-hour': { headerName: 'F-H', field: 'fb-hour', width: 85, sortable: true, hide: true, filter: "agTextColumnFilter", },
        'mnet-hour': { headerName: 'M-H', field: 'mnet-hour', width: 85, sortable: true, hide: true, filter: "agTextColumnFilter", },
    };

    const getColumnDefs = (order) => {
        return order?.map(colKey => columnDefsObject[colKey]);
    };

    const getColumnDefs1 = (order) => {
        // console.log(order);
        return order?.map(colKey => columnDefsObject1[colKey]);
    };

    const getColumnDefs2 = (order) => {
        // console.log(order);
        return order?.map(colKey => columnDefsObject2[colKey]);
    };

    const [columnDefs, setColumnDefs] = useState();

    const columnDefs1 = useRef();

    const columnDefs2 = useRef();

    var token = localStorage.getItem("token")


    const updatingColumnsStructure = async (updateDataArray) => {
        // const fetchData = await fetch(`https://prodapis.adsgoat.in/api/singleUserData?id=${userdetails._id}&updateData=${updateData}`);
        const response = await axios.put(`https://prodapis.adsgoat.in/api/updateUserData?email=${userdetails.email}`,
            {
                updateDataArray
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        setColumnDefs(getColumnDefs(updateDataArray));
        columnDefs1.current = (getColumnDefs1(updateDataArray));
        columnDefs2.current = (getColumnDefs2(updateDataArray));
        // const data = await fetchData.json();
        // const mainData = await data;
        // console.log(mainData.rows, "rows");
        // // setRowStructure(mainData.rows); 
        // setColumnDefs(getColumnDefs(mainData.rows));
    }

    function findMaxHour(data) {
        // Use reduce to find the maximum value of the 'hour' key
        const maxHour = data.reduce((max, obj) => {
          // Convert the 'hour' value to a number before comparison
          const hourAsNumber = parseInt(obj.hour, 10);
          return hourAsNumber > max ? hourAsNumber : max;
        }, -Infinity);  // Initialize with -Infinity to ensure proper comparison
      
        console.log("Maximum hour:", String(maxHour).padStart(2, '0'));  // Format it back to string with leading zero if necessary
        return String(maxHour).padStart(2, '0');  // Return the max hour as a string with leading zero
    }

    function getMaxHour(data) {
        // Extract hour from "HH:MM" format if updatedHour exists and convert it to a number
        const hours = data
          .filter(item => item.updatedHour) // Filter out objects without updatedHour
          .map(item => parseInt(item.updatedHour.split(":")[0], 10));
      
        // Return the maximum hour, or null if no valid updatedHour found
        return hours.length > 0 ? Math.max(...hours) : null;
    }


    const functionCallForUserColumnStructure = async () => {
        const fetchData = await axios.get(`https://prodapis.adsgoat.in/api/singleUserData?email=${userdetails.email}`);
        // const data = await fetchData.json();
        const mainData = fetchData.data;
        console.log(mainData.columnStructure, "columnStructure");
        // setRowStructure(mainData.rows); 
        setColumnDefs(getColumnDefs(mainData.columnStructure));
        columnDefs1.current = getColumnDefs2(mainData.columnStructure);
        columnDefs2.current = (getColumnDefs2(mainData.columnStructure))
    }


    const functionCall1 = async () => {
        const fetchData = await axios.get(`https://prodapis.adsgoat.in/Live?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${account}&timezone=${time}&network=${newtworkCollections[revenuePratner]}`, {
            headers: {
                Authorization: token,
            },
        });
        const mainData = fetchData.data;
        console.log(mainData, "maindata of functinCall1");
        const specifiedTimeZone = selectTimezone[time];
        const filteredData = mainData && mainData.length > 0 ?
            mainData.map((eachData) => {
                let revenueData;
                if (eachData.estimated_revenue === 0 || isNaN(eachData.estimated_revenue)) {
                    revenueData = 0;
                }
                else if (eachData.estimated_revenue === undefined) {
                    revenueData = 0;
                }
                else if (eachData.estimated_revenue === null) {
                    revenueData = 0;
                }
                else {
                    revenueData = eachData.estimated_revenue;
                }
                const profit = (revenueData - eachData.spend).toFixed(2);
                let margin;
                if (revenueData === 0) {
                    margin = "0";
                }
                else {
                    margin = `${Math.round((((revenueData - eachData.spend) / revenueData) * 100) * 100) / 100}%`;
                }
                const rpc = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((revenueData / eachData.conversions) * 100) / 100;

                let cpl;
                if (eachData.fbLeads == 0) {
                    cpl = 0;
                } else {
                    cpl = Math.round((eachData.spend / eachData.fbLeads) * 100) / 100;
                }
                const ncpl = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((eachData.spend / eachData.conversions) * 100) / 100;
                // console.log(revenueData, "revenueData");
                return (
                    {
                        campaignname: eachData.campaign_name,
                        adsetname: eachData.adsetName,
                        date: eachData[specifiedTimeZone],
                        'fb-hour': eachData.hour,
                        'mnet-hour': eachData.updatedHour,
                        spend: parseFloat(eachData.spend),
                        revenue: revenueData ? revenueData : 0,
                        profit: parseFloat(profit),
                        margin: margin,
                        fbleads: parseInt(eachData.fbLeads),
                        conversions: eachData.conversions !== null && eachData.conversions !== 0 ? parseInt(eachData.conversions) : 0,
                        cpc: parseFloat(eachData.cpc),
                        fbclicks: parseInt(eachData.fbClicks),
                        impressions: parseInt(eachData.impressions),
                        rpc: parseFloat(rpc),
                        cpl: parseFloat(cpl),
                        ncpl: parseFloat(ncpl),
                        adsetid: eachData.adset_id,
                        campaignid: eachData.campaign_id,
                        timezone: eachData[time],
                    }
                )
            })
            : null;
        // setValue(mainData);
        if (mainData.length > 1) {
            timezone.current = mainData[0].accountTimezone;
            accountStatus.current = mainData[0].accountStatus;
            cronStatus.current = mainData[0].cronStatus;
            maxHour.current = findMaxHour(mainData);
            maxNetworkHour.current = getMaxHour(mainData);
        }
        setRowData(filteredData);
        newRowData.current = filteredData;
        setInitialRowData(filteredData);
        setTrue(false);
        setLoading(false);

    }

    const functionCall2 = async () => {
        try {
            const fetchData = await axios.get(`https://prodapis.adsgoat.in/Daily?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${account}&timezone=${time}&network=${newtworkCollections[revenuePratner]}`, {
                headers: {
                    Authorization: token,
                },
            });
            const mainData = fetchData.data;
            console.log(mainData, "mainData of functionCall2");
            let totalSpend = 0;
            let totalRevenue = 0;
            let totalProfit = 0;
            let totalCpc = 0;
            let totalFbleads = 0;
            let totalFbclicks = 0;
            let totalImpressions = 0;
            let totalConversions = 0;
            const specifiedTimeZone = selectTimezone[time];
            console.log(mainData[0], "one");
            const totalRow = mainData && mainData.length > 0 ?
                mainData.map((eachData) => {
                    const Revenue = eachData.estimated_revenue !== undefined ? (eachData.estimated_revenue) : 0;
                    const profit = (Revenue - eachData.spend);
                    const conversions = eachData.conversions !== undefined ? eachData.conversions : 0;
                    totalRevenue += Revenue;
                    totalSpend += parseFloat(eachData.spend);
                    totalProfit += profit;
                    totalConversions += conversions;
                    totalCpc += eachData.cpc;
                    totalFbclicks += eachData.fbClicks;
                    totalFbleads += eachData.fbLeads;
                    totalImpressions += eachData.impressions;
                }) : null;
            // const totalValue = {
            //     adsetname: "Total",
            //     date: input,
            //     adsetid: '',
            //     compaignid: '',
            //     spend: (Math.round(totalSpend*100)/100).toString(),
            //     revenue: (Math.round(totalRevenue*100)/100).toString(),
            //     profit: (Math.round(totalProfit*100)/100).toString(),
            //     margin: `${(Math.round((((totalRevenue-totalSpend)/totalRevenue)*100)*100)/100)}%`,
            //     rpc: (Math.round((totalRevenue/totalConversions)*100)/100).toString(),
            //     cpl:(Math.round((totalSpend/totalFbleads)*100)/100).toString(),
            //     ncpl:(Math.round((totalSpend/totalConversions)*100)/100).toString(),
            //     roi: `${(Math.round((((totalRevenue-totalSpend)/totalSpend)*100)*100)/100)}%`,
            //     cpc: (Math.round((totalCpc/mainData.length)*100)/100).toString(),
            //     fbleads: totalFbleads.toString(),
            //     fbclicks: totalFbclicks.toString(),
            //     impressions: totalImpressions.toString(),
            //     conversions: totalConversions.toString(),
            //     fmargin: `${(Math.round((((totalProfit)/(totalFbleads*(totalRevenue/totalConversions)))*100)*100)/100)}%`,
            //     ctr: `${(Math.round(((totalFbclicks/totalImpressions)*100)*100)/100)}%`,
            // }
            // console.log(totalValue);
            const filteredData = mainData && mainData.length > 0 ?
                mainData.map((eachData) => {
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
                    const conversions = eachData.conversions !== undefined ? eachData.conversions : '0';
                    rpc = !isNaN(rpc) ? rpc : 0;
                    ncpl = !isNaN(ncpl) ? ncpl : 0;
                    fMargin = !isNaN(fMargin) ? `${fMargin}%` : '0%';

                    console.log(eachData.campaign_name, "campaign_name");
                    return (
                        {
                            campaignname: eachData.campaign_name,
                            adsetname: eachData.adsetName,
                            date: eachData[specifiedTimeZone],
                            'fb-hour': eachData.campaign_id,
                            'mnet-hour': eachData.campaign_id,
                            spend: parseFloat(eachData.spend),
                            revenue: parseFloat(mainRvenue),
                            profit: parseFloat(profit),
                            margin: margin,
                            fbleads: parseInt(eachData.fbLeads),
                            conversions: parseInt(conversions),
                            cpc: parseFloat(eachData.cpc),
                            fbclicks: parseInt(eachData.fbClicks),
                            impressions: parseInt(eachData.impressions),
                            ctr: ctr,
                            rpc: parseFloat(rpc),
                            cpl: parseFloat(cpl),
                            ncpl: parseFloat(cpl),
                            roi: roi,
                            fmargin: fMargin,
                            campaignid: eachData.campaign_id,
                            adsetid: eachData.adset_id,
                            timezone: 'UTC',
                            // compaignid: eachData.campaign_id,
                        }
                    )
                }) : null;
            // console.log(filteredData[0],"one");
            console.log(filteredData, "filter");

            const fullData = filteredData?.length > 0 ? [...filteredData] : [];
            console.log(fullData, "full");

            // setDailyColumn(columnDefs);
            setdailyData(fullData);
            newDailyData.current = fullData;
            setTrue(false);
            setLoading1(false);
        } catch (error) {
            console.log(error);
        }
    }

    const functionCall3 = async () => {
        const fetchData = await axios.get(`https://prodapis.adsgoat.in/AllCampaigns?accountNumber=${account}&timezone=${time}&network=${newtworkCollections[revenuePratner]}&page=${pageSize}&limit=100`, {
            headers: {
                Authorization: token,
            },
        });
        console.log(fetchData, "f1");
        const mainData = fetchData.data.items;

        const url = `https://prodapis.adsgoat.in/AllCampaigns?accountNumber=${account}&timezone=${time}&network=${newtworkCollections[revenuePratner]}&page=${pageSize}&limit=100`;

        const specifiedTimeZone = selectTimezone[time];
        console.log(specifiedTimeZone, "spe");
        console.log(mainData, "maindata of functionCall3");
        const filteredData = mainData && mainData.length > 0 ?
            mainData.map((eachData) => {
                let revenueData;
                if (eachData.estimated_revenue === 0) {
                    revenueData = '0.00';
                }
                else if (eachData.estimated_revenue === undefined) {
                    revenueData = '0.00';
                }
                else {
                    revenueData = eachData.estimated_revenue;
                }
                const profit = (revenueData - eachData.spend).toFixed(2);
                let margin;
                if (revenueData === '0.00') {
                    margin = "0";
                }
                else {
                    margin = `${Math.round((((revenueData - eachData.spend) / revenueData) * 100) * 100) / 100}%`;
                }
                const rpc = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((revenueData / eachData.conversions) * 100) / 100;

                let cpl;
                if (eachData.fbLeads == 0) {
                    cpl = 0;
                } else {
                    cpl = Math.round((eachData.spend / eachData.fbLeads) * 100) / 100;
                }
                const ncpl = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((eachData.spend / eachData.conversions) * 100) / 100;
                // console.log(eachData[specifiedTimeZone],"time");
                return (
                    {
                        campaignname: eachData.campaign_name,
                        adsetname: eachData.adsetName,
                        date: eachData[specifiedTimeZone],
                        spend: eachData.spend,
                        revenue: revenueData,
                        profit: profit,
                        fbleads: eachData.fbLeads,
                        conversions: eachData.conversions,
                        cpc: eachData.cpc,
                        fbclicks: eachData.fbClicks,
                        impressions: eachData.impressions,
                        campaignid: eachData.campaign_id,
                        adsetid: eachData.adset_id,
                    }
                )
            })
            : null;
        totalItems.current = fetchData.data.totalItems;
        console.log(mainData);
        setCampaignData(filteredData);
        setFixedFooter([
            {
                campaignName: 'Total',
                spend: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
                revenue: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
                profit: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
                margin: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
                rpc: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / filteredData?.length).toFixed(2)),
                cpl: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / filteredData?.length).toFixed(2)),
                ncpl: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / filteredData?.length).toFixed(2)),
                fbleads: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
                conversions: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
                fmargin: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                roi: parseFloat(((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                cpc: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / filteredData?.length).toFixed(2)),
                fbclicks: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
                impressions: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
                ctr: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
            }
        ]);
        newCampaignData.current = filteredData;
        setTrue(false);
        setLoading2(false);
    }



    useEffect(() => {
        const functionCall = async () => {
            try {
                // Run these functions only on the initial load
                if (isInitialLoad.current) {
                    await functionCallForUserColumnStructure();
                    await functionCall1();
                    await functionCall2();
                    console.log("Initial functions executed successfully.");
                    isInitialLoad.current = false; // Set to false after initial load
                }

                // Run this function on initial load and whenever pageSize changes
                await functionCall3();
                console.log("functionCall3 executed successfully.");
            } catch (error) {
                console.error("Error in function calls:", error);
                // Optionally, handle the error (e.g., show a notification to the user)
            }
        };

        functionCall();
    }, [pageSize]);

    useEffect(() => {
        if (isTrue) {
            const functionCall = async () => {
                await functionCallForUserColumnStructure();
                await functionCall1();
                await functionCall2();
                await functionCall3();
            }
            functionCall();
        }
    }, [isTrue])

    useEffect(() => {
        // Update the grid key to force a re-render when fixedFooter changes
        setGridKey((prevKey) => prevKey + 1);
    }, [fixedFooter]);

    // useEffect(()=>{
    //     if(isTrue){
    //         const functionCall = async() => {
    //             await functionCall3();
    //         }
    //         functionCall();
    //     }

    // }, [isTrue, pageSize]);

    // useEffect(()=>{

    //         const functionCall = async() =>{
    //            await functionCall2();
    //            await functionCall1();
    //            await functionCall3();
    //         }
    //         functionCall();

    // },[])


    // console.log(fetchvalue);

    const selectRevenuePartner = ["Fb_Mnet", "Fb_Enki"];
    let selectElementAccounts = [];
    const mnetAccounts = ['674038077865381', '665204411821465'];
    const enkiAccounts = ['364991119488050'];

    const onChangeSelectRevenue = (value) => {
        const accountsForAccess = adAccounts[value];
        console.log(accountsForAccess, "accounts Access");
        console.log(accountsForAccess[0], "accountFor Access");

        const accountsAccess = accountsForAccess === undefined ? [] : accountsForAccess;

        // console.log(accountsAccess, "accountsAccess");
        setNetworksData(accountsAccess);
        setRevenuePartner(value);
        value ==="FB_Tonic" ? console.log("PDT") : null;
        value === "FB_Rsoc" || value === "FB_Tonic" || value === "FB_DomainActive" ? setTime('PDT') : setTime('UTC')
    }
    const onChangeSelect = (value) => {
        setAccount(value);
    }

    const onChangeTime = (value) => {
        setTime(value);
    }

    const onClickButton = () => {
        console.log(account, "account");
        console.log(time, "time");
        console.log(url1);
        console.log(url2);
        console.log(startDate, "start");
        console.log(endDate, "end");
        setPageSize(1);
        setTrue(true);
        setRowData([]);
        setTime(time);
        setLoading(true);
        setLoading1(true);
        setLoading2(true);
        // setMainComponent(true);
    }

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

    // const defaultColDef = useMemo(()=>({
    //     filter: true,
    //     floatingFilter: true,
    // }),[]);

    switch (revenuePratner) {
        case "FB_Mnet":
            selectElementAccounts = [...mnetAccounts];
            break;
        case "FB_Enki":
            selectElementAccounts = [...enkiAccounts];
            break;
        default:
            null;
            break
    }

    const handleCustomerServiceClick = () => {
        console.log('Customer Service button clicked');
        carouselRef.current.goTo(1); // Change to the first slide
    };

    const handleCommentClick = () => {
        console.log('Comment button clicked');
        carouselRef.current.goTo(0); // Change to the second slide
    };

    const handleCommentClick1 = () => {
        console.log('Comment button clicked');
        carouselRef.current.goTo(2);
    }

    const handleChange = (dates) => {
        if (dates && dates.length === 2) {
            const [start, end] = dates;
            console.log('Start Date:', start.format('YYYY-MM-DD'));
            console.log('End Date:', end.format('YYYY-MM-DD'));
            setStartDate(start.format('YYYY-MM-DD'));
            setEndDate(end.format('YYYY-MM-DD'));
        }
    };


    const onCellClicked = (event) => {
        // if (params.node.group) {
        //     console.log('Group row clicked:', params.node.key);
        //     console.log(params);
        //     const url = `/history/${params.node.key}-${account}-${time}`;
        //     window.open(url, '_blank');

        // } else {
        //     console.log('Cell clicked:', params.data.adsetname);
        //     const url = `/history/adsetHistory/${params.data.adsetname}-${account}-${time}`;
        //     window.open(url, '_blank');
        // }
        if (event.colDef.field === 'adsetname') {
            const value = event.value;
            if (value !== undefined) {
                const url = `/DailyAndCampaignHistory/AdsetHistory/${value}-${account}-${time}-${newtworkCollections[revenuePratner]}`;
                window.open(url, '_blank');
                console.log(`Price clicked: ${value}`);
            }
        }

    };

    const onCellClickedAllCampaigns = (event) => {
        if (event.colDef.field === 'adsetname') {
            const value = event.value;
            if (value !== undefined) {
                const url = `/AllCampaigns/AdsetHistory/${value}-${account}-${time}-${newtworkCollections[revenuePratner]}`;
                window.open(url, '_blank');
                console.log(`Adset clicked: ${value}`);
            }
        }
    };

    const onCellClickedLive = (event) => {
        if (event.colDef.field === 'adsetname') {
            const value = event.value;
            if (value !== undefined) {
                const url = `/LiveHistory/LiveAdsetHistory/${value}-${account}-${time}-${newtworkCollections[revenuePratner]}`;
                window.open(url, '_blank');
                console.log(`Adset clicked: ${value}`);
            }
        }
    };

    // const onCellClickedLive = (event) => {

    //     if (event.colDef.field === 'adsetname') {
    //         const value = event.value;
    //         if(value !== undefined){
    //             const url = `/LiveHistory/LiveAdsetHistory/${value}-${account}-${time}-${revenuePratner}`;
    //             window.open(url, '_blank');
    //             console.log(`Adset clicked: ${value}`);
    //         }
    //     }

    // };

    const autoGroupColumnDefLive = {
        headerName: 'CampaignName',
        minWidth: 450,
        pinned: 'left',

        cellRendererParams: {
            suppressCount: false, // Allow count to be shown
            innerRenderer: (params) => {
                if (params.node.footer) {
                    return 'Total'; // Custom footer label
                }
                // const count = params.node.allChildrenCount; // Get the count of children
                const firstColumnValue = params.node.key;  // This should give you the campaign name
                const valueWithCount = `${firstColumnValue}`;
    
                const [tooltipText, setTooltipText] = useState("Click to Copy");
    
                const copyToClipboard = () => {
                    navigator.clipboard.writeText(firstColumnValue)
                        .then(() => {
                            setTooltipText("Copied!");
                            setTimeout(() => setTooltipText("Click to Copy"), 2000);
                        })
                        .catch(() => {
                            console.error('Failed to copy to clipboard');
                        });
                };

                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <StarOutlined/>
                        <EditOutlined style={{marginLeft:'10px'}}/>
                        <Tooltip title={tooltipText}>
                            <CopyOutlined
                                onClick={copyToClipboard}
                                style={{ cursor: 'pointer', marginLeft: '8px', color: '#1e1e1f', marginRight:'10px' }}
                            />
                        </Tooltip>
                        <span
                            onClick={() => {
                                console.log(`Grouped Make clicked: ${params.value}`);
                                const url = `/LiveHistory/LiveCampaignHistory/${params.value}-${account}-${time}-${newtworkCollections[revenuePratner]}`;
                                window.open(url, '_blank');
                            }}
                        >
                            {valueWithCount}
                        </span>
                    </div>
                );
            }
        }
    };


    // const autoGroupColumnDefLive = {
    //     headerName: 'CampaignName',
    //     minWidth: 450,
    //     cellRendererParams: {
    //         suppressCount: true,
    //         innerRenderer: (params) => {
    //           return (
    //             <span
    //               onClick={() => {
    //                 console.log(`Grouped Make clicked: ${params.value}`);
    //                 const url = `/LiveHistory/LiveCampaignHistory/${params.value}-${account}-${time}-${revenuePratner}`;
    //                 window.open(url, '_blank');
    //               }}
    //             >
    //               {params.value}
    //             </span>
    //           );
    //         }
    //       }
    // };

    // const autoGroupColumnDef = {
    //     headerName: 'CampaignName',
    //     minWidth: 450,
    //     cellRendererParams: {
    //         suppressCount: true,
    //         innerRenderer: (params) => {
    //           return (
    //             <span
    //               onClick={() => {
    //                 console.log(`Grouped Make clicked: ${params.value}`);
    //                 const url = `/DailyAndCampaignHistory/CampaignHistory/${params.value}-${account}-${time}`;
    //                 window.open(url, '_blank');
    //               }}
    //             >
    //               {params.value}
    //             </span>
    //           );
    //         }
    //       }
    // };

    const autoGroupColumnDef = {
        headerName: 'CampaignName',
        minWidth: 450,
        pinned: 'left',
        cellRendererParams: {
            suppressCount: false, // Allow count to be shown
            innerRenderer: (params) => {
                if (params.node.footer) {
                    return 'Total'; // Custom footer label
                }
    
                // Get the group key or value (campaign name in this case)
                const firstColumnValue = params.node.key;  // This should give you the campaign name
                const valueWithCount = `${firstColumnValue}`;
    
                const [tooltipText, setTooltipText] = useState("Click to Copy");
    
                const copyToClipboard = () => {
                    navigator.clipboard.writeText(firstColumnValue)
                        .then(() => {
                            setTooltipText("Copied!");
                            setTimeout(() => setTooltipText("Click to Copy"), 2000);
                        })
                        .catch(() => {
                            console.error('Failed to copy to clipboard');
                        });
                };
    
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <StarOutlined/>
                        <EditOutlined style={{marginLeft:'10px'}} />
                        <Tooltip title={tooltipText}>
                            <CopyOutlined
                                onClick={copyToClipboard}
                                style={{ cursor: 'pointer', marginLeft: '8px', color: '#1e1e1f', marginRight:'10px' }}
                            />
                        </Tooltip>
                        <span
                            onClick={() => {
                                console.log(`Grouped Make clicked: ${params.value}`);
                                const url = `/DailyAndCampaignHistory/CampaignHistory/${params.value}-${account}-${time}-${newtworkCollections[revenuePratner]}`;
                                window.open(url, '_blank');
                            }}
                        >
                            {valueWithCount}
                        </span>
                        
                    </div>
                );
            }
        }
    };
    
    
    

    const autoGroupColumnDef2 = {
        headerName: 'CampaignName',
        minWidth: 450,
        pinned: 'left',
        cellRendererParams: {
            suppressCount: false, // Allow count to be shown
            innerRenderer: (params) => {
                if (params.node.footer) {
                    return 'Total'; // Custom footer label
                }
                // const count = params.node.allChildrenCount; // Get the count of children
                const firstColumnValue = params.node.key;  // This should give you the campaign name
                const valueWithCount = `${firstColumnValue}`;
    
                const [tooltipText, setTooltipText] = useState("Click to Copy");
    
                const copyToClipboard = () => {
                    navigator.clipboard.writeText(firstColumnValue)
                        .then(() => {
                            setTooltipText("Copied!");
                            setTimeout(() => setTooltipText("Click to Copy"), 2000);
                        })
                        .catch(() => {
                            console.error('Failed to copy to clipboard');
                        });
                };

                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <StarOutlined/>
                        <EditOutlined style={{marginLeft:'10px'}} />
                        <Tooltip title={tooltipText}>
                            <CopyOutlined
                                onClick={copyToClipboard}
                                style={{ cursor: 'pointer', marginLeft: '8px', color: '#1e1e1f', marginRight:'10px' }}
                            />
                        </Tooltip>
                        <span
                            onClick={() => {
                                console.log(`Grouped Make clicked: ${params.value}`);
                                const url = `/AllCampaigns/CampaignHistory/${params.value}-${account}-${time}-${newtworkCollections[revenuePratner]}`;
                                window.open(url, '_blank');
                            }}
                        >
                            {valueWithCount}
                        </span>
                        
                    </div>
                    
                );
            }
        }
    };

    const GroupRowRenderer = (props) => {
        const { node } = props;
        const groupName = node.key;
        const groupCount = node.allLeafChildren.length;
        return (
            <span>
                {groupName} ({groupCount})
            </span>
        );
    };

    const handleColumnMove = (params, gridId) => {
        const columnState = params.api.getColumnState();
        console.log('Column moved in grid:', gridId);
        const fieldOrder = columnState.map(col => col.colId);
        const newFieldOrder = fieldOrder.filter(item => item !== 'ag-Grid-AutoColumn-campaignname' && item !== 'ag-Grid-AutoColumn' && columnStructure.includes(item));
        localStorage.setItem('columnState', JSON.stringify(newFieldOrder));
        updatingColumnsStructure(newFieldOrder);
        console.log(`Updating columns structure for grid: ${gridId}`); 
    };

    const debouncedHandleColumnMove = useCallback(debounce((params, gridId) => handleColumnMove(params, gridId), 600), []);

    const onGridReady = (params, gridId, gridRef) => {
        gridRef.current = params;
        params.api.applyColumnState({ state: columnDefs, applyOrder: true });
        params.api.addEventListener('dragStopped', (e) => debouncedHandleColumnMove(e, gridId));
    };

    const gridOptions = {
        onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid1'),
        defaultColDef: {
            suppressMenu: true
        }
    };

    const gridOptions1 = {
        onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid2'),
    };

    const gridOptions2 = {
        onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid3'),
    };

    console.log(columnDefs);
    console.log(columnDefs1);
    console.log(columnDefs2);


    
    const defaultDates = [dayjs(yesterday), dayjs(yesterday)];

    // const onFilterChanged = (params) => {
    //     const allData = params.api.rowModel.rowsToDisplay.map(node => node.data); // Get all row data from the grid

    //     let filteredData = allData.filter(item => {
    //         const campaignNameFilter = params.api.getFilterInstance('campaignName');
    //         const adsetNameFilter = params.api.getFilterInstance('adsetName');
    //         const dateFilter = params.api.getFilterInstance('date');
    //         const fbHourFilter = params.api.getFilterInstance('fb-hour');
    //         const mnetHourFilter = params.api.getFilterInstance('mnet-hour');
    //         const spendFilter = params.api.getFilterInstance('spend');
    //         const revenueFilter = params.api.getFilterInstance('revenue');
    //         const profitFilter = params.api.getFilterInstance('profit');
    //         const marginFilter = params.api.getFilterInstance('margin');
    //         const fbleadsFilter = params.api.getFilterInstance('fbleads');
    //         const conversionsFilter = params.api.getFilterInstance('conversions');
    //         const cpcFilter = params.api.getFilterInstance('cpc');
    //         const fbclicksFilter = params.api.getFilterInstance('fbclicks');
    //         const impressionsFilter = params.api.getFilterInstance('impressions');
    //         const ctrFilter = params.api.getFilterInstance('ctr');
    //         const rpcFilter = params.api.getFilterInstance('rpc');
    //         const cplFilter = params.api.getFilterInstance('cpl');
    //         const ncplFilter = params.api.getFilterInstance('ncpl');
    //         const fmarginFilter = params.api.getFilterInstance('fmargin');
    //         const roiFilter = params.api.getFilterInstance('roi');
    //         const adsetIdFilter = params.api.getFilterInstance('adsetId');
    //         const campaignIdFilter = params.api.getFilterInstance('campaignId');
    //         const timezoneFilter = params.api.getFilterInstance('timezone');

    //         return (campaignNameFilter ? campaignNameFilter.doesFilterPass({ data: item }) : true)
    //             && (adsetNameFilter ? adsetNameFilter.doesFilterPass({ data: item }) : true)
    //             && (dateFilter ? dateFilter.doesFilterPass({ data: item }) : true)
    //             && (fbHourFilter ? fbHourFilter.doesFilterPass({ data: item }) : true)
    //             && (mnetHourFilter ? mnetHourFilter.doesFilterPass({ data: item }) : true)
    //             && (spendFilter ? spendFilter.doesFilterPass({ data: item }) : true)
    //             && (revenueFilter ? revenueFilter.doesFilterPass({ data: item }) : true)
    //             && (profitFilter ? profitFilter.doesFilterPass({ data: item }) : true)
    //             && (marginFilter ? marginFilter.doesFilterPass({ data: item }) : true)
    //             && (fbleadsFilter ? fbleadsFilter.doesFilterPass({ data: item }) : true)
    //             && (conversionsFilter ? conversionsFilter.doesFilterPass({ data: item }) : true)
    //             && (cpcFilter ? cpcFilter.doesFilterPass({ data: item }) : true)
    //             && (fbclicksFilter ? fbclicksFilter.doesFilterPass({ data: item }) : true)
    //             && (impressionsFilter ? impressionsFilter.doesFilterPass({ data: item }) : true)
    //             && (ctrFilter ? ctrFilter.doesFilterPass({ data: item }) : true)
    //             && (rpcFilter ? rpcFilter.doesFilterPass({ data: item }) : true)
    //             && (cplFilter ? cplFilter.doesFilterPass({ data: item }) : true)
    //             && (ncplFilter ? ncplFilter.doesFilterPass({ data: item }) : true)
    //             && (fmarginFilter ? fmarginFilter.doesFilterPass({ data: item }) : true)
    //             && (roiFilter ? roiFilter.doesFilterPass({ data: item }) : true)
    //             && (adsetIdFilter ? adsetIdFilter.doesFilterPass({ data: item }) : true)
    //             && (campaignIdFilter ? campaignIdFilter.doesFilterPass({ data: item }) : true)
    //             && (timezoneFilter ? timezoneFilter.doesFilterPass({ data: item }) : true);
    //     });

    //     console.log('Filtered Data: ', filteredData);
    // };

    const onBtExport1 = () => {
        // console.log(gridRef.current.api,"in")
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
    };

    const onBtExport = (gridRef) => {
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
    };

    // const SearchToggle = () => {
    //     const [isSearching, setIsSearching] = useState(false);
    //     const [inputValue, setInputValue] = useState('');

    //     const handleSearchClick = () => {
    //         setIsSearching(true);
    //     };

    //     const handleBlur = () => {
    //         if (inputValue.trim() === '') {
    //             setIsSearching(false);
    //         }
    //     };

    //     const handleChange = (e) => {
    //         setInputValue(e.target.value);
    //     };

    //     return (
    //         <div>
    //             {isSearching ? (
    //                 <Input
    //                     type="text"
    //                     autoFocus
    //                     value={inputValue}
    //                     style={{width:'200px', height:'25px', borderRadius:'5px'}}
    //                     onChange={handleChangeInput}
    //                     onBlur={handleBlur}
    //                 />
    //             ) : (
    //                 <Button
    //                     icon={<SearchOutlined style={{fontSize:'15px'}} />}
    //                     onClick={handleSearchClick}
    //                     style={{width:'25px', height:'25px'}}
    //                 />
    //             )}
    //         </div>
    //     );
    // };

    const itemRender = (_, type, originalElement) => {
        if (type === 'prev') {
            return <a><ArrowLeftOutlined /></a>;
        }
        if (type === 'next') {
            return <a><ArrowRightOutlined /></a>;
        }
        return originalElement;
    };

    const handlePageClick = (page, pageSize) => {
        console.log(`Clicked page: ${page}, Page size: ${pageSize}`);
        setLoading2(true);
        setPageSize(page);
        // Add your custom onClick functionality here
    };

    const rangePresets = [
        {
            label: 'ToDay',
            value: [dayjs().add(0, 'd'), dayjs().add(0, 'd')],
        },
        {
            label: 'YesterDay',
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

    console.log(rowData, "rowData");
    console.log(dailyData, "dailyData");
    console.log(campaignData, "campaignData");

    // console.log(rowData, "rowData");
    // console.log(dailyData, "dailyData");
    // console.log(campaignData, "campaignData");

    const refreshGrid = (gridRef) => {
        
        setLoading(true);
        if (gridRef.current) {
            const gridApi = gridRef.current.api;

            // Clear filters
            gridApi.setFilterModel(null);

            // Clear sorting by resetting the row data state
            setRowData([]); // Temporarily clear the data
            setTimeout(() => setRowData(newRowData.current), 0); // Reset the data
            setTimeout(() => setLoading(false), 1500);
            // Force refresh the grid cells and redraw the rows
            gridApi.refreshCells({ force: true });
            gridApi.redrawRows();
        } else {
            console.error('Grid reference is not available.');
        }
    };

    const refreshGrid1 = (gridRef1) => {
        setLoading1(true);
        if (gridRef1.current) {
            const gridApi = gridRef1.current.api;

            // Clear filters
            gridApi.setFilterModel(null);

            // Clear sorting by resetting the row data state
            setdailyData([]); // Temporarily clear the data
            setTimeout(() => setdailyData(newDailyData.current), 0); // Reset the data
            setTimeout(() => setLoading1(false), 1500);
            // Force refresh the grid cells and redraw the rows
            gridApi.refreshCells({ force: true });
            gridApi.redrawRows();
        } else {
            console.error('Grid reference is not available.');
        }
    };

    const refreshGrid2 = (gridRef2) => {
        setLoading2(true);
        if (gridRef2.current) {
            const gridApi = gridRef2.current.api;

            // Clear filters
            gridApi.setFilterModel(null);

            // Clear sorting by resetting the row data state
            setCampaignData([]); // Temporarily clear the data
            setTimeout(() => setCampaignData(newCampaignData.current), 0); // Reset the data
            setTimeout(() => setLoading2(false), 1500);
            
            // Force refresh the grid cells and redraw the rows
            gridApi.refreshCells({ force: true });
            gridApi.redrawRows();
        } else {
            console.error('Grid reference is not available.');
        }
    };

    const onClickRefresh = () => {
        refreshGrid(gridRef);  // Refresh gridRef
        refreshGrid1(gridRef1); // Refresh gridRef1
        refreshGrid2(gridRef2); // Refresh gridRef2
    };

    
    

    const GroupCellRenderer = (props) => {
        const [tooltipText, setTooltipText] = useState("Copy to clipboard");
    
        const copyToClipboard = () => {
            navigator.clipboard.writeText(props.node.key).then(() => {
                setTooltipText("Copied!");
                setTimeout(() => setTooltipText("Copy to clipboard"), 2000);
            }).catch(() => {
                alert('Failed to copy!');
            });
    };

    

    
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                    {props.node.key} {/* Grouped cell value */}
                </span>
                <Tooltip title={tooltipText}>
                    <CopyOutlined
                        onClick={copyToClipboard}
                        style={{ cursor: 'pointer', marginLeft: '8px', color: '#1e1e1f' }}
                    />
                </Tooltip>
            </div>
        );
    };

    const disabledDate = (current) => {
        // Disable dates after today
        return current && current > dayjs().endOf('day');
    };

    console.log(revenuePratner);
    console.log(time);

    const createOption = (account) => {
        
        if (typeof account === 'string') {
            return{
                value: account,
                label: account,
            }
        } else {
            return {
                value: account.accountNumber,
                label: (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{account.accountNumber}</span>
                    <span>{account.status === "Active" ? <CheckCircleFilled style={{ color: 'green', fontSize: '15px' }} /> : <CloseCircleFilled style={{ color: 'red', fontSize: '15px' }} />}</span>
                  </div>
                ),
                text: account.accountNumber, // Adding a text property for sorting and filtering
            };
        }
          
        
    };

    const pinnedBottomRowData1 = [
        {
            campaignName: 'Total',
            spend: parseFloat(rowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
            revenue: parseFloat(rowData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
            profit: parseFloat(rowData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
            margin: parseFloat((rowData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / rowData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
            rpc: parseFloat((rowData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / rowData?.length).toFixed(2)),
            cpl: parseFloat((rowData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / rowData?.length).toFixed(2)),
            ncpl: parseFloat((rowData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / rowData?.length).toFixed(2)),
            fbleads: parseFloat(rowData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
            conversions: parseFloat(rowData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
            fmargin: parseFloat((rowData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / rowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
            roi: parseFloat(((rowData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - rowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / rowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
            cpc: parseFloat((rowData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / rowData?.length).toFixed(2)),
            fbclicks: parseFloat(rowData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
            impressions: parseFloat(rowData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
            ctr: parseFloat((rowData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / rowData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
        }
    ];
    
    const pinnedBottomRowData2 = [
        {
            campaignName: 'Total',
            spend: parseFloat(dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
            revenue: parseFloat(dailyData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
            profit: parseFloat(dailyData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
            margin: parseFloat((dailyData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
            rpc: parseFloat((dailyData.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / dailyData.length).toFixed(2)),
            cpl: parseFloat((dailyData.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / dailyData.length).toFixed(2)),
            ncpl: parseFloat((dailyData.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / dailyData.length).toFixed(2)),
            fbleads: parseFloat(dailyData.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
            conversions: parseFloat(dailyData.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
            fmargin: parseFloat((dailyData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
            roi: parseFloat(((dailyData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
            cpc: parseFloat((dailyData.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / dailyData.length).toFixed(2)),
            fbclicks: parseFloat(dailyData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
            impressions: parseFloat(dailyData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
            ctr: parseFloat((dailyData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / dailyData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
        }
    ];

    // const pinnedBottomRowData3 = (campaignData) =>{
    //     return([
    //         {
    //             campaignName: 'Total',
    //             spend: campaignData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0),
    //             revenue: campaignData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0),
    //             profit: campaignData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0),
    //             margin: `${(campaignData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / campaignData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)}%`,
    //             rpc: campaignData.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / campaignData.length,
    //             cpl: campaignData.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / campaignData.length,
    //             ncpl: campaignData.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / campaignData.length,
    //             fbleads: campaignData.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0),
    //             conversions: campaignData.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0),
    //             fmargin: `${(campaignData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / campaignData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)}%`,
    //             roi: `${(campaignData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - campaignData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / campaignData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100}%`,
    //             cpc: campaignData.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / campaignData.length,
    //             fbclicks: campaignData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0),
    //             impressions: campaignData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0),
    //             ctr: `${(campaignData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / campaignData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)}%`
    //         }
    //     ]);
    // };

    // console.log(fixedFooter, "fixed");

    

    return (
        <div className='reports-container'>
            {/* className='select-container' */}
            <Space direction="vertical" style={{ width: '100%', padding: "1%" }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            showSearch
                            className='select-element'
                            onChange={onChangeSelectRevenue}
                            style={{ width: '100%' }}
                            placeholder="Select Network"
                            
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            optionFilterProp="label"
                            defaultValue={networks[0]}
                            options={networks.map((item) => ({
                                value: item,
                                label: item,
                            }))}
                        />
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                        <Select
                            showSearch
                            onChange={onChangeSelect}
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            style={{ width: '100%' }}
                            placeholder="Select Account"
                            optionFilterProp="value" // Make sure the option has a 'label' property
                            defaultValue={typeof networksData[0] === 'string' ? networksData[0] : networksData[0].accountNumber}
                            options={accountsAccess.map((item) => createOption(item))}
                            // filterOption={(input, option) =>
                            //     option?.text.toLowerCase().includes(input.toLowerCase())  // Custom filter logic for case-insensitive search
                            // }
                        />
                    </Col>

                    <Col xs={24} sm={24} md={15} lg={6}>
                        <ConfigProvider locale={locale}>
                            <RangePicker
                                presets={rangePresets}
                                onChange={handleChange}
                                disabledDate={disabledDate}
                                defaultValue={defaultDates}
                                format="YYYY-MM-DD"
                                style={{
                                    width: '100%',
                                    backgroundColor: theme === 'dark' ? '#333' : undefined,
                                    color: theme === 'dark' ? 'white' : undefined,
                                  }}
                                dropdownClassName={theme === 'dark' ? 'dark-theme-dropdown' : ''}
                            />
                        </ConfigProvider>
                    </Col>

                    <Col xs={24} sm={12} md={3}>
                        <Select
                            showSearch
                            onChange={onChangeTime}
                            style={{ width: '100%' }}
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

                    <Col xs={24} sm={12} md={2}>
                        <Button className='submit-button' type='primary' style={{backgroundColor:'#C7F39A', border:'solid 0px', color:'black', fontWeight:'600'}} onClick={onClickButton} block>
                            Submit
                        </Button>
                    </Col>
                </Row>
            </Space>
            <div >
                <Row style={{ padding: '10px',paddingRight: '30px', display:'flex', justifyContent: 'flex-end', alignItems:'center'}}>
                    <Col style={{marginRight:'15px'}}>
                        {/* {isSearching ? (
                            <Row gutter={8}>
                                <Col>
                                    <Input
                                        placeholder="Search here"
                                        autoFocus
                                        value={inputValue}
                                        onChange={handleChangeInput}
                                        onBlur={handleBlur}
                                        style={{ width: '100%', borderRadius: '5px' }}
                                    />
                                </Col>
                                <Col>
                                    <Button icon={<SearchOutlined />} />
                                </Col>
                                
                            </Row>
                        ) : (
                            <Button
                                icon={<SearchOutlined />}
                                onClick={handleSearchClick}

                            />
                        )} */}
                        <Row gutter={8}>
                                <Col>
                                    <Input
                                        placeholder="Search here"
                                        // autoFocus
                                        value={inputValue}
                                        onChange={handleChangeInput}
                                        onBlur={handleBlur}
                                        style={{ width: '100%', borderRadius: '5px' }}
                                    />
                                </Col>
                                <Col>
                                    <Button style={{backgroundColor:'#C7F39A', border:'solid 0px', color:'black'}} icon={<SearchOutlined />} />
                                </Col>
                                
                        </Row>
                    </Col>
                    <Col>
                        <Tooltip title="Click to Refresh Tables">
                            <Button type="primary" style={{backgroundColor:'#C7F39A', border:'solid 0px', color:'black'}} icon={<ReloadOutlined />}  onClick={onClickRefresh}/>
                        </Tooltip>
                    </Col>
                </Row>

                <Carousel afterChange={onChange1} ref={carouselRef}>
                    <div style={{ height: "100%", marginBottom:'20px' }}>
                        <div style={contentStyle}>
                            {isLoading === true ? (
                                <div className="loader-container ag-container" style={{backgroundColor: theme === "dark" ? "#333" : "white"}}>
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
                            ) : rowData?.filter((each) => each.campaignname.includes(inputValue))?.length > 0 ? (
                               
                                    <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>
                                    
                                    <Row style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                                            <Space align="center">
                                                <div className="blinking-circle-1"></div>
                                                <Text style={{ paddingLeft: '3px', fontSize: '15px', fontWeight: '600' }}>Live</Text>
                                            </Space>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>Acc: {account}</Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>Timezone: {timezone.current}</Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>F/N Hour: {maxHour.current}:00 / {maxNetworkHour.current}:00</Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>
                                                Cron/Acc status: {cronStatus.current} /{' '}
                                                <span style={{ color: accountStatus.current === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
                                                    {accountStatus.current}
                                                </span>
                                            </Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={4} lg={2} style={{ flex: '0.2 0 auto' }}>
                                            <Tooltip title="Export to CSV">
                                                <Button type="primary" style={{backgroundColor:'#C7F39A', border:'solid 0px', color:'black'}} icon={<DownloadOutlined />} onClick={onBtExport1} />
                                            </Tooltip>
                                        </Col>
                                    </Row>


                                    <AgGridReact
                                        ref={gridRef}
                                        rowData={rowData ? rowData?.filter((each) => each.campaignname.includes(inputValue)) : []}
                                        rowSelection='multiple'
                                        columnDefs={columnDefs}
                                        defaultColDef={{ ...defaultColDef, suppressMenu: true }}
                                        onCellClicked={onCellClickedLive}
                                        pagination={true}
                                        paginationPageSize={100}
                                        paginationPageSizeSelector={[20, 40, 60, 80, 100]}
                                        suppressAggFuncInHeader={true}
                                        // groupIncludeTotalFooter={rowData.length > 0 ? true : false}
                                        // groupIncludeFooter={rowData.length > 0 ? true : false}
                                        autoGroupColumnDef={autoGroupColumnDefLive}
                                        onGridReady={(params) => onGridReady(params, 'grid1', gridRef)}
                                        gridOptions={gridOptions}
                                        frameworkComponents={{ GroupCellRenderer }}
                                        groupDisplayType='multipleColumns'
                                        // rowGroupPanelShow='always'
                                        onFilterChanged={onFilterChanged} // Use the custom filter handler
                                        pinnedBottomRowData={rowData.length > 0 ? pinnedBottomRowData1 : []}
                                        getRowStyle={params => {
                                            if (params.node.rowPinned) {
                                                return {
                                                    fontWeight: 'bold',
                                                    backgroundColor: theme === "dark" ? '#000' : '#fff', // Dark mode background should be dark, light mode should be light
                                                    color: theme === "dark" ? '#fff' : '#000',           // Text color should contrast with the background
                                                };
                                            }
                                            
                                            return null;
                                        }}
                                        // const onFirstDataRendered = {(params) => {
                                        //     params.api.forEachNode(node => {
                                        //         if (node.rowPinned === 'bottom') { // Assuming the total footer is pinned to the bottom
                                        //             node.columnApi.getAllDisplayedColumns().forEach(col => {
                                        //                 const cell = params.api.getDisplayedCellForColumn(node, col);
                                        //                 if (cell) {
                                        //                     cell.eGui.style.backgroundColor = 'lightblue';
                                        //                     cell.eGui.style.color = 'white';
                                        //                 }
                                        //             });
                                        //         }
                                        //     });
                                        // }}
                                        
                                       
                                        getMainMenuItems={getMainMenuItems}
                                    />

                                </div>
                            ) : <div>
                                {startDate !== endDate ? <Result
                                    icon={<SmileOutlined  />}
                                    title={`No LiveData for ${account} from ${startDate} to ${endDate}`}
                                    // extra={<Button type="primary">Next</Button>}
                                />: <Result
                                icon={<SmileOutlined  />}
                                title={`No LiveData for ${account} to ${startDate}`}
                                // extra={<Button type="primary">Next</Button>}
                                />}
                            </div>}
                        </div>
                    </div>
                    <div>
                        <div style={contentStyle}>
                            {isLoading1 === true ? (
                                <div className="loader-container ag-container" style={{backgroundColor: theme === "dark" ? "#333" : "white"}}>
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
                            ) : dailyData.filter((each) => each.campaignname.includes(inputValue))?.length > 0 ? (
                                <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>
                                    <Row style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                                            <Space align="center" className='daily-contaier'>
                                                <div className="blinking-circle"></div>
                                                <Text style={{ paddingLeft: '3px', fontSize: '15px', fontWeight: '600' }}>Daily</Text>
                                            </Space>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>Acc: {account}</Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>Timezone: {timezone.current}</Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>
                                                Cron/Acc status: {cronStatus.current} /{' '}
                                                <span style={{ color: accountStatus.current === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
                                                    {accountStatus.current}
                                                </span>
                                            </Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={4} lg={2} style={{ flex: '0.2 0 auto' }}>
                                        <Tooltip title="Export to CSV">
                                            <Button type="primary" style={{backgroundColor:'#C7F39A', border:'solid 0px', color:'black'}} icon={<DownloadOutlined />} onClick={() => onBtExport(gridRef1)} />
                                        </Tooltip>
                                        </Col>
                                    </Row>
                                    <AgGridReact
                                        ref={gridRef1}
                                        rowData={dailyData.filter((each) => each.campaignname.includes(inputValue))}
                                        columnDefs={columnDefs1.current}
                                        onCellClicked={onCellClicked}
                                        pagination={true}
                                        paginationPageSize={100}
                                        paginationPageSizeSelector={[20, 40, 60, 80, 100]}
                                        groupDisplayType='multipleColumns'
                                        suppressAggFuncInHeader={true}
                                        groupSuppressBlankHeader={true}
                                        defaultColDef={defaultColDef}
                                        // groupIncludeFooter={true}
                                        // groupIncludeTotalFooter={true}
                                        autoGroupColumnDef={autoGroupColumnDef}
                                        onGridReady={(params) => onGridReady(params, 'grid2', gridRef1)}
                                        gridOptions={gridOptions1}
                                        getMainMenuItems={getMainMenuItems}
                                        pinnedBottomRowData={dailyData.length > 0 ? pinnedBottomRowData2 : []}
                                        getRowStyle={params => {
                                            if (params.node.rowPinned) {
                                                return {
                                                    fontWeight: 'bold',
                                                    backgroundColor: theme === "dark" ? '#000' : '#fff', // Dark mode background should be dark, light mode should be light
                                                    color: theme === "dark" ? '#fff' : '#000',           // Text color should contrast with the background
                                                };
                                            }
                                            
                                            return null;
                                        }}
                                    />
                                </div>
                            ) : <div>
                                    {startDate !== endDate ? <Result
                                    icon={<SmileOutlined  />}
                                    title={`No DailyData for ${account} from ${startDate} to ${endDate}`}
                                    // extra={<Button type="primary">Next</Button>}
                                    />: <Result
                                    icon={<SmileOutlined  />}
                                    title={`No DailyData for ${account} to ${startDate}`}
                                    // extra={<Button type="primary">Next</Button>}
                                    />}
                                </div>}
                        </div>
                    </div>
                    <div>
                        <div style={contentStyle}>
                            {isLoading2 === true ? (
                                <div className="loader-container ag-container" style={{backgroundColor: theme === "dark" ? "#333" : "white"}}>
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
                            ) : campaignData.filter((each) => each.campaignname.includes(inputValue))?.length > 0 ? (
                                <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>
                                    <Row style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                                            <Space align="center" className='daily-contaier' style={{width:'150px'}}>
                                                <div class="blinking-circle-3"></div>
                                                <Text style={{ paddingLeft: '3px', fontSize: '15px', fontWeight: '600', width:'100px' }}>Campaigns</Text>
                                            </Space>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>Acc: {account}</Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>Timezone: {timezone.current}</Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>
                                                Cron/Acc status: {cronStatus.current} /{' '}
                                                <span style={{ color: accountStatus.current === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
                                                    {accountStatus.current}
                                                </span>
                                            </Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={4} lg={2} style={{ flex: '0.2 0 auto' }}>
                                            <Tooltip title="Export to CSV">
                                                <Button type="primary" style={{backgroundColor:'#C7F39A', border:'solid 0px', color:'black'}} icon={<DownloadOutlined />} onClick={() => onBtExport(gridRef2)} />
                                            </Tooltip>
                                        </Col>
                                    </Row>
                                    

                                    <div style={{height: '90%'}}>
                                        <AgGridReact
                                            key={gridKey}
                                            ref={gridRef2}
                                            rowData={campaignData.filter((each) => each.campaignname.includes(inputValue))}
                                            columnDefs={columnDefs2.current}
                                            onCellClicked={onCellClickedAllCampaigns}
                                            autoGroupColumnDef={autoGroupColumnDef2}
                                            defaultColDef={defaultColDef}
                                            // pagination={true}
                                            // paginationPageSize={50}
                                            // paginationPageSizeSelector={[10,20,30]}
                                            groupDisplayType='multipleColumns'
                                            suppressAggFuncInHeader={true}
                                            // groupIncludeTotalFooter={true}
                                            // // rowGroupPanelShow='always'
                                            // groupIncludeFooter={true}
                                            groupRowRenderer={GroupRowRenderer}
                                            onGridReady={(params) => onGridReady(params, 'grid3', gridRef2)}
                                            // onColumnMoved={debouncedHandleColumnMove2}
                                            gridOptions={gridOptions2}
                                            suppressMenuHide={true}
                                            getMainMenuItems={getMainMenuItems}
                                            pinnedBottomRowData={campaignData.length > 0 ? fixedFooter : []}
                                            getRowStyle={params => {
                                                if (params.node.rowPinned) {
                                                    return {
                                                        fontWeight: 'bold',
                                                        backgroundColor: theme === "dark" ? '#000' : '#fff', // Dark mode background should be dark, light mode should be light
                                                        color: theme === "dark" ? '#fff' : '#000',           // Text color should contrast with the background
                                                    };
                                                }
                                                
                                                return null;
                                            }}
                                        // onFirstDataRendered = {(params) => {
                                        //     params.api.sizeColumnsToFit(100);
                                        //   }}
                                        // groupMultiAutoColumn={true}
                                        // autoGroupColumnDef={autoGroupColumnDef}
                                        // groupDefaultExpanded={-1} // Expand all groups by default
                                        // animateRows={true}
                                        // domLayout="autoHeight"
                                        // autoGroupColumnDef={{
                                        //     headerName: 'Group',
                                        //     cellRendererParams: {
                                        //         suppressCount: true,
                                        //     },
                                        // }}
                                        />
                                    </div>
                                </div>
                            ) : <div>
                            <div>
                                {startDate !== endDate ? <Result
                                    icon={<SmileOutlined  />}
                                    title={`No CampaignData for ${account} from ${startDate} to ${endDate}`}
                                    // extra={<Button type="primary">Next</Button>}
                                />: <Result
                                icon={<SmileOutlined  />}
                                title={`No CampaignData for ${account} to ${startDate}`}
                                // extra={<Button type="primary">Next</Button>}
                                />}
                            </div>
                            </div>}

                        </div>
                        <Pagination
                            style={{ marginBottom: '12px' }}
                            total={totalItems.current}
                            pageSize={100}
                            itemRender={itemRender}
                            showSizeChanger={false}
                            showQuickJumper={false}
                            current={pageSize}
                            onChange={handlePageClick}
                        />
                    </div>

                </Carousel>
            </div>

            <Draggable>
                <FloatButton.Group
                    trigger="hover"
                    type="primary"
                    style={{
                        position: 'fixed',
                        bottom: 20, // Distance from the bottom
                        right: 80,  // Distance from the right
                        opacity: 1,
                    }}
                    icon={<CustomerServiceOutlined />}
                >
                    <FloatButton icon={<ImHistory />} onClick={handleCommentClick1} />
                    <FloatButton icon={<FaDailymotion />} onClick={handleCustomerServiceClick} />
                    <FloatButton icon={<RiLiveFill />} onClick={handleCommentClick} />

                </FloatButton.Group>
            </Draggable>

            <Modal 
                title="Basic Modal" 
                open={isModalOpen} 
                onOk={handleOk} 
                onCancel={handleCancel}
                okText="Add"
                cancelText="Cancel"
            >
                <Input value={newColumnName} placeholder='Enter Column Name' style={{marginBottom:'10px'}} onChange={(e) => setNewColumnName(e.target.value)}/>
                <Input value={formula} placeholder='Enter Formula' style={{marginBottom:'10px'}} onChange={(e) => setFormula(e.target.value)} />
            </Modal>

        </div>
    );
};
export default MyTablePage;