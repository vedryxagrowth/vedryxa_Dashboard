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
import { useSearchParams } from 'next/navigation';
// import { Select } from 'antd';
import { Carousel, Input, Button, Pagination, Row, Col, Typography, Result, Modal, message, ConfigProvider, Switch, Divider, Flex, Spin, Tabs } from 'antd';

// import 'antd/dist/reset.css';
import { CommentOutlined, CustomerServiceOutlined, MenuOutlined, InfoCircleOutlined, DownloadOutlined, SearchOutlined, ArrowLeftOutlined, ArrowRightOutlined, SmileOutlined, ReloadOutlined, CopyOutlined, StarOutlined, StarFilled, EditOutlined, CheckCircleFilled, CloseCircleFilled, MessageOutlined, SubnodeOutlined, PushpinFilled, PushpinOutlined, UserAddOutlined, PauseCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { FloatButton, Tooltip, Popover } from 'antd';
import Draggable from 'react-draggable';
import StickyBox from 'react-sticky-box';
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
    margin: "10px",
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
    "FB_DomainActive": "Facebook_DActive",
    "FB_Bodies": "Facebook_Bodies",
    "FB_Bodies1": "Facebook_Bodies1",
    "Newsbreak_DA": "Newsbreak_DomainActive",
    "FB_Tonic1": "Facebook_Tonic1"
}



const MyTablePage = () => {
    const { userdetails } = useTokenContext();
    const params = new URLSearchParams(window.location.search);

    const networkFromDashboard = params.get('network');
    const accountNumberFromDashboard = params.get('accountNumber');
    const timeFromDashboard = params.get('time');
    const startDateFromDashboard = params.get('startDate');
    const endDateFromDashboard = params.get('endDate');
    // console.log(networkFromDashboard);
    // console.log(accountNumberFromDashboard);
    // console.log(timeFromDashboard);
    // console.log(startDateFromDashboard);
    // console.log(endDateFromDashboard);

    const { theme } = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
    if (!userdetails?.adAccounts) {
        return <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Flex align="center" gap="middle">
                {/* <Spin size="small" />
                <Spin /> */}
                <Spin size="large" />
            </Flex>
        </div>;
    }
    if (userdetails?.role === "Revenue_Partner") {
        redirect("/Dashboard");
    }
    // console.log(userdetails, "userDetails");
    // const [darkMode, setDarkMode] = useState(false);
    // console.log(userdetails._id, "id");

    const { adAccounts } = userdetails;

    // console.log(adAccounts, "addAccounts");

    const networks = Object.keys(adAccounts);

    const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
    // console.log('Yesterday\'s date:', yesterday);


    // console.log(networks,"networks");

    // console.log('userdetails:',userdetails);

    // Define your rowData and columnDefs
    const columnStructure = [
        "actions",
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

    const [accountNumberToPass, setAccountNumberToPass] = useState(accountNumberFromDashboard);

    const [initialRowData, setInitialRowData] = useState([]);

    const [rowData, setRowData] = useState([]);

    const [campaignData, setCampaignData] = useState([]);

    // const [defaultTimezone] = useState('UTC');

    // const [mainComponent, setMainComponent] = useState(false);

    const [url1, setUrl1] = useState('FbMnetUI');

    const [url2, setUrl2] = useState('FbMnetDailyUI');

    const [url3, setUrl3] = useState('MnetAllCampaigns');

    const [dailyData, setdailyData] = useState([]);

    const [keywordData, setKeywordData] = useState([]);

    const [system1KeywordData, setSystem1KeywordData] = useState([]);

    const [isSubmitted, setIsSubmitted] = useState(false);

    const [isKeywordsTabActive, setIsKeywordsTabActive] = useState(""); // Track if the 'Keywords' tab is selected

    const [isSystem1KeywordsTabActive, setIsSystem1KeywordsTabActive] = useState("");

    const [startDate, setStartDate] = useState(startDateFromDashboard ? startDateFromDashboard : yesterday);

    const [newStartDate, setNewStartDate] = useState(startDateFromDashboard ? startDateFromDashboard : yesterday);

    const [endDate, setEndDate] = useState(endDateFromDashboard ? endDateFromDashboard : yesterday);

    const [newendDate, setNewEndDate] = useState(endDateFromDashboard ? endDateFromDashboard : yesterday);

    const [revenuePratner, setRevenuePartner] = useState(networkFromDashboard ? networkFromDashboard : networks[0]);

    const [newRevenuePratner, setNewRevenuePartner] = useState(networkFromDashboard ? networkFromDashboard : networks[0]);

    const [isSearching, setIsSearching] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isSecondRowVisible, setIsSecondRowVisible] = useState(false);
    const [refrst, setRefrst] = useState(false);
    const [activeTab, setActiveTab] = useState("1");

    // Toggle function

    const handleSearchClick = () => {
        setIsSearching(true);
        setIsSecondRowVisible(prevState => !prevState);
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


    // console.log(revenuePratner);
    const accountsForAccess = adAccounts[revenuePratner];
    console.log(accountsForAccess, "accounts Access");
    // console.log(accountsForAccess[0], "accountFor Access");

    const accountsAccess = accountsForAccess === undefined ? [] : accountsForAccess;

    const [networksData, setNetworksData] = useState(accountsAccess);

    const [isLoading, setLoading] = useState(true);

    const [isLoading1, setLoading1] = useState(true);

    const [isLoading2, setLoading2] = useState(true);

    const [isLoading3, setLoading3] = useState(true);

    const [isLoading4, setLoading4] = useState(true);

    const [tonicKeywordLoading, setTonicKeywordLoading] = useState(true);

    const [tonicKeywordData, setTonicKeywordData] = useState([]);

    const [fixedTonic, setFixedTonic] = useState([]);

    const [isTrue, setTrue] = useState(false);

    const [account, setAccount] = useState(accountNumberFromDashboard ? accountNumberFromDashboard : accountsForAccess[0].accountNumber);

    const [time, setTime] = useState(timeFromDashboard ? timeFromDashboard : 'UTC');

    const [newaccount, setNewAccount] = useState(accountNumberFromDashboard ? accountNumberFromDashboard : accountsForAccess[0].accountNumber);

    const [accountName, setAccountName] = useState(accountsForAccess[0]?.accountName);

    const [newAccountName, setnewAccountName] = useState(accountsForAccess[0]?.accountName);
    const [newtime, setNewTime] = useState(timeFromDashboard ? timeFromDashboard : 'UTC');

    const [pageSize, setPageSize] = useState(1);

    // const [fetchvalue, setValue] = useState([]);

    const timezone = useRef();

    const cronStatus = useRef();

    const accountStatus = useRef();

    const hasFetched = useRef(false);


    /* cronstatus*/
    let fbCron = useRef();

    let revenueCron = useRef();



    const carouselRef = useRef();

    const maxHour = useRef();

    const maxNetworkHour = useRef();

    // const columnApiRef = useRef(null);

    const gridRef = useRef();

    const gridRef1 = useRef();

    const gridRef2 = useRef();

    const gridRef3 = useRef();

    const gridRef4 = useRef();

    const gridRef5 = useRef();

    const [gridKey, setGridKey] = useState(0);

    const filterRef = useRef(null);

    const totalItems = useRef();


    const newRowData = useRef();

    const newDailyData = useRef();

    const newCampaignData = useRef();

    const newTonicKeywordData = useRef();

    const [tonicFixedFooter, setTonicFixedFooter] = useState([]);

    const [fixedFooter, setFixedFooter] = useState([]);

    const [sFixedFooter, setSFixedFooter] = useState([]);

    const isInitialLoad = useRef(true);
    //Modal States
    const [newColumnName, setNewColumnName] = useState('');
    const [formula, setFormula] = useState('');

    // const onChange1 = (currentSlide) => {
    //     console.log(currentSlide);
    // };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [domainData, setDomainData] = useState([]);

    const [domainColumnDefs, setDomainColumnDefs] = useState([]);

    const [domainFixedFooter, setDomainFixedFooter] = useState([]);

    const [BMNameData, setBMNameData] = useState([]);

    const [BMNameColumnDefs, setBMNameColumnDefs] = useState([]);

    const [BMNameFixedFooter, setBMNameFixedFooter] = useState([]);
    const showModal = () => {
        setIsModalOpen(true);
    };

    const changeRRefrst = () => {
        setRefrst((prev) => !prev);
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
                        // console.log('Original Keys:', originalKeys);
                        // console.log('Sanitized Keys:', sanitizedKeys);

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
                        console.error('Error evaluatings formula:', error);
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
                        // console.log('Values to aggregate:', values);

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
            columnDefs3.current = [...columnDefs3.current, newColumnDef];

            // Common function to update data
            const updateData = (prevData) => {
                return prevData.map((row) => {
                    const updatedRow = { ...row };
                    try {
                        const originalKeys = Object.keys(row);
                        const sanitizedKeys = originalKeys.map(key => key.replace(/[^a-zA-Z_$0-9]/g, '_'));
                        const values = Object.values(row);
                        // console.log(values, "values1");

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
            setKeywordData((prevData) => updateData(prevData));
            setSystem1KeywordData((prevData) => updateData(prevData));

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
                    // console.log('Custom Reset Columns logic');
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

    const average = (params) => {
        const total = params.values.reduce((acc, value) => acc + parseFloat(value || 0), 0);
        const count = params.values.filter(value => value !== null && value !== undefined).length;  // Count non-null/undefined values
        return count > 0 ? Math.round((total / count) * 100) / 100 : 0;  // Avoid division by zero
    };

    const liveSpender = (params) => {
        const total = params.values.reduce((acc, value) => acc + parseFloat(value || 0), 0);
        return Math.round(total * 100) / 100; // Round to 2 decimal places
    };

    const currencyFormatter = (params) => {
        return `$${parseFloat(params.value || 0).toFixed(2)}`; // Ensure 2 decimal places in currency format
    };

    const numberComparator = (valueA, valueB) => {
        const numA = parseFloat(valueA) || 0;
        const numB = parseFloat(valueB) || 0;
        return numA - numB;
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

    const marginFormatter = (params) => {
        return `${parseFloat(params.value || 0).toFixed(2)}%`; // Ensure 2 decimal places in currency format
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




    const isYesterday = () => {
        const startDate1 = moment(startDate); // Convert to moment object
        const endDate1 = moment(endDate);     // Convert to moment object

        // Define "yesterday" as a reference
        const yesterday1 = moment().subtract(1, 'days');
        return startDate1.isSame(yesterday1, 'day') && endDate1.isSame(yesterday1, 'day');
    };

    const customNumberComparator = (valueA, valueB) => {
        const a = parseFloat(valueA);
        const b = parseFloat(valueB);

        // Handle null/undefined values first (nulls should appear last in the sort order)
        if (isNaN(a)) return 1;
        if (isNaN(b)) return -1;

        // Standard comparison for non-null values
        return a - b;
    };

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
        actions: {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 90,
            // sortable: true,
            // filter: true,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            suppressMenu: true,    // Suppress the column menu
            menuTabs: [],
            hide: !isYesterday(),
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [groupedData, setGroupedData] = useState([]);
                const [newgroupedData, setNewGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignStatus, setCampaignStatus] = useState(true);

                const onChangeSpendAndStatus = async () => {
                    // Check if it's a group footer row (for groupIncludeFooter)
                    if (params?.node?.footer) {
                        // console.log("This is a groupIncludeFooter row. Modal will not open.");
                        return; // Prevent modal from opening for group footer rows
                    }

                    // Ensure allLeafChildren exists and is an array before proceeding
                    const allLeafChildren = params.node?.allLeafChildren || [];

                    // Fetch all the rows under the current group
                    const groupedData = allLeafChildren.map(node => node.data) || [];
                    setNewGroupedData(groupedData);

                    // Only show the modal if there is data (groupedData length is greater than 0)
                    if (groupedData.length > 0) {
                        const getCampaignResponse = await axios.get(`https://prodapis.adsgoat.in/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`, {
                            headers: {
                                Authorization: token,
                            },
                        });
                        if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
                            setGroupedData(getCampaignResponse.data);
                            setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
                            onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
                        }
                        else {
                            setGroupedData(groupedData);
                        }
                        // Set the grouped data for the modal
                        setIsModalVisible(true); // Show the modal for non-footer rows
                    }
                };

                const handleOk = async () => {
                    setIsModalVisible(false); // Close the modal
                    const object = {
                        campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
                        adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
                        campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
                        usercommit: userdetails?.email,
                        accountNumber: newaccount,
                        budget: changeBudget * 100,
                        status: campaignStatus
                    };
                    // console.log(object);
                    const requestResponse = await axios.post('https://prodapis.adsgoat.in/Comments/accountNumber/campaign', { formattedData: object }, {
                        headers: {
                            Authorization: token,
                        },
                    });
                    const responseData = requestResponse.data;
                    // console.log(responseData, "response");
                    message.success("Budget and Status Updated");
                    changeRRefrst();
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                    // console.log(changeBudget); // Close the modal
                };

                const getTotalSpend = (data) => {
                    if (!data || data.length === 0) return 0;
                    const total = data.reduce((total, item) => {
                        return total + (item?.spend || 0);
                    }, 0);
                    return Math.round(total * 100) / 100; // Round to 2 decimal places
                };

                const onChangeBudgetValue = event => {
                    onChangeBudget(event.target.value)
                }

                const onChangeCampaignStatus = () => {
                    setCampaignStatus((prev) => !prev);
                }

                // console.log(groupedData);

                return (
                    <div>
                        {/* Click action for status cell */}
                        <div onClick={onChangeSpendAndStatus}>
                            <span>{params.value || "..."}</span> {/* Fallback to '...' if status is not available */}
                        </div>
                        {/* Modal should only be shown for non-footer rows and when groupedData length is greater than 0 */}
                        {isModalVisible && (
                            <Modal
                                title={groupedData?.length > 0 && groupedData?.length !== 1 ? groupedData[0]?.campaignname : groupedData?.campaignname}
                                visible={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                width={600}  // Set a custom width for the modal
                                style={{ padding: '20px' }}  // Adjust body padding
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Campaign Name and Switch */}
                                    {/* <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography.Text strong>Campaign Name:</Typography.Text>
                                        <Typography.Text strong style={{ paddingLeft: '5px' }}>
                                            {`${groupedData[0]?.campaignname || "N/A"}`}
                                        </Typography.Text>
                                    </div> */}
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} onChange={onChangeCampaignStatus} />
                                    </div>

                                    {/* Input Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget:</Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData)} onChange={onChangeBudgetValue} />
                                    </div>

                                    {/* Campaign ID */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong>Campaign ID:</Typography.Text>
                                        <p>{groupedData?.length > 0 && groupedData?.length !== 1 ? groupedData[0]?.campaignid : groupedData.campaignid}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
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
            headerName: 'N-H',
            field: 'mnet-hour',
            minWidth: 95,
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
            valueFormatter: currencyFormatter
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
            valueFormatter: currencyFormatter
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
            valueFormatter: currencyFormatter
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
                // console.log(event, "event");
                // console.log('Group row clicked:', event);
                // console.log(event);
                const url = `/history/${event}-${account}-${time}`;
                window.open(url, '_blank');
            },
            cellRenderer: campaignNameRenderer,
        },
        actions: {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 90,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            hide: false,
            suppressMenu: true,
            hide: !isYesterday(),
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [newgroupedData, setNewGroupedData] = useState([]);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignStatus, setCampaignStatus] = useState(true);

                const onChangeSpendAndStatus = async () => {
                    // Check if it's a group footer row (for groupIncludeFooter)
                    if (params?.node?.footer) {
                        // console.log("This is a groupIncludeFooter row. Modal will not open.");
                        return; // Prevent modal from opening for group footer rows
                    }

                    // Ensure allLeafChildren exists and is an array before proceeding
                    const allLeafChildren = params.node?.allLeafChildren || [];
                    setNewGroupedData(groupedData);

                    // Fetch all the rows under the current group
                    const groupedData = allLeafChildren.map(node => node.data) || [];

                    // Only show the modal if there is data (groupedData length is greater than 0)
                    if (groupedData.length > 0) {
                        const getCampaignResponse = await axios.get(`https://prodapis.adsgoat.in/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`, {
                            headers: {
                                Authorization: token,
                            },
                        });
                        if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
                            setGroupedData(getCampaignResponse.data);
                            setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
                            onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
                        }
                        else {
                            setGroupedData(groupedData);
                            // console.log("dailyadd");
                        }
                        // Set the grouped data for the modal
                        setIsModalVisible(true); // Show the modal for non-footer rows
                    }
                };

                const handleOk = async () => {
                    setIsModalVisible(false); // Close the modal
                    const object = {
                        campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
                        adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
                        campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
                        usercommit: userdetails?.email,
                        accountNumber: newaccount,
                        budget: changeBudget * 100,
                        status: campaignStatus
                    };
                    console.log(object);
                    const requestResponse = await axios.post('https://prodapis.adsgoat.in/Comments/accountNumber/campaign', { formattedData: object }, {
                        headers: {
                            Authorization: token,
                        },
                    });
                    const responseData = requestResponse.data;
                    // console.log(responseData, "response");
                    message.success("Budget and Status Updated");
                    changeRRefrst();
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                    // console.log(changeBudget); // Close the modal
                };

                const getTotalSpend = (data) => {
                    if (!data || data.length === 0) return 0;
                    const total = data.reduce((total, item) => {
                        return total + (item?.spend || 0);
                    }, 0);
                    return Math.round(total * 100) / 100; // Round to 2 decimal places
                };

                const onChangeBudgetValue = event => {
                    onChangeBudget(event.target.value)
                }

                const onChangeCampaignStatus = () => {
                    setCampaignStatus((prev) => !prev);
                }


                // console.log(groupedData);

                return (
                    <div>
                        {/* Click action for status cell */}
                        <div onClick={onChangeSpendAndStatus}>
                            <span>{params.value || "..."}</span> {/* Fallback to '...' if status is not available */}
                        </div>
                        {/* Modal should only be shown for non-footer rows and when groupedData length is greater than 0 */}
                        {isModalVisible && (
                            <Modal
                                title={groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignname : groupedData?.campaignname}
                                visible={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                width={600}  // Set a custom width for the modal
                                style={{ padding: '20px' }}  // Adjust body padding
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Campaign Name and Switch */}
                                    {/* <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography.Text strong>Campaign Name:</Typography.Text>
                                        <Typography.Text strong style={{ paddingLeft: '5px' }}>
                                            {`${groupedData[0]?.campaignname || "N/A"}`}
                                        </Typography.Text>
                                    </div> */}
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} onChange={onChangeCampaignStatus} />
                                    </div>

                                    {/* Input Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget:</Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData)} onChange={onChangeBudgetValue} />
                                    </div>

                                    {/* Campaign ID */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong>Campaign ID:</Typography.Text>
                                        <p>{groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignid : groupedData.campaignid}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
            filterParams: { filterEnabled: false },

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
            headerName: 'Spend($)',
            field: 'spend',
            width: 240,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter, // Format display as currency
            comparator: numberComparator,
        },
        revenue: {
            headerName: 'Revenue($)',
            field: 'revenue',
            width: 240,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
        },
        profit: {
            headerName: 'Profit($)',
            field: 'profit',
            width: 240,
            aggFunc: liveSpender,
            sortable: true,
            cellClassRules: {
                'font-red': p => p.value < 0 // Conditional formatting for negative profit
            },
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
        },
        margin: {
            headerName: 'Margin(%)', field: 'margin', valueGetter: getMargin, sortable: true, headerTooltip: 'Profit/Revenue', filter: 'agNumberColumnFilter',
            width: 240,
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
            width: 240,
            aggFunc: (params) => {
                const sum = params.values.reduce((sum, value) => sum + parseFloat(value), 0);
                return sum / params.values.length;
            },
            valueFormatter: params => params.value !== undefined ? Math.round(params.value * 100) / 100 : '',
            sortable: true, filter: 'agNumberColumnFilter'

        },
        fbclicks: { headerName: 'FbClicks', field: 'fbclicks', width: 120, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter' },
        impressions: { headerName: 'Impressions', field: 'impressions', width: 120, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter' },
        ctr: {
            headerName: 'Ctr', field: 'ctr', valueGetter: getCtr, sortable: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
        },
        rpc: {
            headerName: 'Rpc', field: 'rpc', valueGetter: getRpc, sortable: true, filter: 'agNumberColumnFilter',
            width: 240,
        },
        cpl: { headerName: 'Cpl', field: 'cpl', valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter' },
        ncpl: { headerName: 'Ncpl', field: 'ncpl', valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter' },
        fmargin: {
            headerName: 'Fmargin(%)', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
        },
        roi: {
            headerName: 'ROI(%)', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: 'Profit/Spend', filter: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
        },
        adsetid: { headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter", hide: false },
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
                // console.log(event, "event");
                // console.log('Group row clicked:', event);
                // console.log(event);
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
        actions: {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 90,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            hide: false,
            suppressMenu: true,
            hide: !isYesterday(),
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [newgroupedData, setNewGroupedData] = useState([]);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignStatus, setCampaignStatus] = useState(true);

                const onChangeSpendAndStatus = async () => {
                    // Check if it's a group footer row (for groupIncludeFooter)
                    if (params?.node?.footer) {
                        // console.log("This is a groupIncludeFooter row. Modal will not open.");
                        return; // Prevent modal from opening for group footer rows
                    }

                    // Ensure allLeafChildren exists and is an array before proceeding
                    const allLeafChildren = params.node?.allLeafChildren || [];

                    // Fetch all the rows under the current group
                    const groupedData = allLeafChildren.map(node => node.data) || [];
                    setNewGroupedData(groupedData);

                    // Only show the modal if there is data (groupedData length is greater than 0)
                    if (groupedData.length > 0) {
                        const getCampaignResponse = await axios.get(`https://prodapis.adsgoat.in/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`, {
                            headers: {
                                Authorization: token,
                            },
                        });
                        if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
                            setGroupedData(getCampaignResponse.data);
                            setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
                            onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
                        }
                        else {
                            setGroupedData(groupedData);
                        }
                        // Set the grouped data for the modal
                        setIsModalVisible(true); // Show the modal for non-footer rows
                    }
                };

                const handleOk = async () => {
                    setIsModalVisible(false); // Close the modal
                    const object = {
                        campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
                        adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
                        campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
                        usercommit: userdetails?.email,
                        accountNumber: newaccount,
                        budget: changeBudget * 100,
                        status: campaignStatus
                    };
                    // console.log(object);
                    const requestResponse = await axios.post('https://prodapis.adsgoat.in/Comments/accountNumber/campaign', { formattedData: object }, {
                        headers: {
                            Authorization: token,
                        },
                    });
                    const responseData = requestResponse.data;
                    // console.log(responseData, "response");
                    message.success("Budget and Status Updated");
                    changeRRefrst();
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                    // console.log(changeBudget); // Close the modal
                };

                const getTotalSpend = (data) => {
                    if (!data || data.length === 0) return 0;
                    const total = data.reduce((total, item) => {
                        return total + (item?.spend || 0);
                    }, 0);
                    return Math.round(total * 100) / 100; // Round to 2 decimal places
                };

                const onChangeBudgetValue = event => {
                    onChangeBudget(event.target.value)
                }

                const onChangeCampaignStatus = () => {
                    setCampaignStatus((prev) => !prev);
                }

                // console.log(groupedData);

                return (
                    <div>
                        {/* Click action for status cell */}
                        <div onClick={onChangeSpendAndStatus}>
                            <span>{params.value || "..."}</span> {/* Fallback to '...' if status is not available */}
                        </div>
                        {/* Modal should only be shown for non-footer rows and when groupedData length is greater than 0 */}
                        {isModalVisible && (
                            <Modal
                                title={groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignname : groupedData?.campaignname}
                                visible={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                width={600}  // Set a custom width for the modal
                                style={{ padding: '20px' }}  // Adjust body padding
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Campaign Name and Switch */}
                                    {/* <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography.Text strong>Campaign Name:</Typography.Text>
                                        <Typography.Text strong style={{ paddingLeft: '5px' }}>
                                            {`${groupedData[0]?.campaignname || "N/A"}`}
                                        </Typography.Text>
                                    </div> */}
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} onChange={onChangeCampaignStatus} />
                                    </div>

                                    {/* Input Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget:</Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData)} onChange={onChangeBudgetValue} />
                                    </div>

                                    {/* Campaign ID */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong>Campaign ID:</Typography.Text>
                                        <p>{groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignid : groupedData.campaignid}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
            filterParams: { filterEnabled: false },

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
        spend: {
            headerName: 'Spend($)', field: 'spend', width: 240, aggFunc: spender, sortable: true, filter: 'agNumberColumnFilter',
            valueFormatter: currencyFormatter, comparator: numberComparator
        },
        revenue: {
            headerName: 'Revenue($)', field: 'revenue', width: 240, aggFunc: spender, sortable: true, filter: 'agNumberColumnFilter',
            valueFormatter: currencyFormatter, comparator: numberComparator
        },
        profit: {
            headerName: 'Profit($)', field: 'profit', width: 240, aggFunc: spender, cellClassRules: {
                'font-red': p => p.value < 0
            }, sortable: true, headerTooltip: 'Revenue - Spend', filter: 'agNumberColumnFilter',
            valueFormatter: currencyFormatter, comparator: numberComparator
        },
        margin: {
            headerName: 'Margin(%)', field: 'margin', valueGetter: getMargin, sortable: true, headerTooltip: 'Profit/Revenue', filter: true,
            width: 240,
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
            headerName: 'cpc', field: 'cpc', aggFunc: cpcSpender, sortable: true, filter: 'agNumberColumnFilter',
            width: 150,
        },
        fbclicks: { headerName: 'FbClicks', field: 'fbclicks', width: 120, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter' },
        impressions: { headerName: 'Impressions', field: 'impressions', width: 120, aggFunc: newSpender, sortable: true, filter: 'agNumberColumnFilter' },
        ctr: {
            headerName: 'Ctr', field: 'ctr', valueGetter: getCtr, sortable: true, filter: 'agNumberColumnFilter',
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
        },
        rpc: {
            headerName: 'Rpc', field: 'rpc', valueGetter: getRpc, sortable: true, filter: 'agNumberColumnFilter',
            width: 150,
        },
        cpl: { headerName: 'Cpl', field: 'cpl', valueGetter: getCpl, sortable: true, filter: 'agNumberColumnFilter' },
        ncpl: { headerName: 'Ncpl', field: 'ncpl', valueGetter: getNcpl, sortable: true, filter: 'agNumberColumnFilter' },
        fmargin: {
            headerName: 'Fmargin(%)', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
        },
        roi: {
            headerName: 'ROI(%)', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: 'Profit/Spend', filter: true,
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

    const KeywordCellRenderer = ({ params }) => {
        const [tooltipText, setTooltipText] = useState("Copy to clipboard");

        const keyword = params.value;
        const adId = params.data?.adId;

        const handleCopy = () => {
            navigator.clipboard.writeText(adId).then(() => {
                setTooltipText("Copied!");
                setTimeout(() => setTooltipText("Copy to clipboard"), 2000);
            }).catch(() => {
                alert('Failed to copy!');
            });
        };

        const popoverContent = (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{adId}</span>
                <Tooltip title={tooltipText}>
                    <CopyOutlined
                        onClick={handleCopy}
                        style={{
                            cursor: 'pointer',
                            fontSize: '16px',
                            // color: '#007BFF'
                        }}
                    />
                </Tooltip>
            </div>
        );

        
        return (
            <Popover
                content={popoverContent}
                trigger="hover"
                placement="topLeft"
            // title="Ad ID"
            >
                <span style={{ cursor: 'pointer' }}>
                    {keyword}
                </span>
            </Popover>
        );
    };

    const columnDefsObject3 = {
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
                // console.log(event, "event");
                // console.log('Group row clicked:', event);
                // console.log(event);
                const url = `/history/${event}-${account}-${time}`;
                window.open(url, '_blank');
            },
            cellRenderer: campaignNameRenderer,
        },
        keyword: {
            headerName: 'Keywords',
            field: 'keyword',
            sortable: true,
            filter: 'agTextColumnFilter',
            resizable: true,
            minWidth: 350,
            cellStyle: { textAlign: 'left' },
            cellRenderer: (params) =>
                <KeywordCellRenderer params={params} /> , 
        },
        searchKeyword: {
            headerName: 'S_Keywords',
            field: 'searchKeyword',
            sortable: true,
            filter: 'agTextColumnFilter',
            minWidth: 350,
            resizable: true,
            cellStyle: { textAlign: 'left' },
            cellRenderer: (params) => {
                return params.value;
            },
            // Include this column only in expanded rows
        },
        // adId: {
        //     headerName: 'Ad ID',
        //     field: 'adId',
        //     sortable: true,
        //     filter: 'agTextColumnFilter',
        //     hide: true, // Hide since we handle this in the keyword tooltip
        // },
        // keyword: {
        //     headerName: 'Keywords',
        //     field: 'keyword',
        //     sortable: true,
        //     filter: 'agTextColumnFilter',
        //     width: 300,
        //     resizable: true,
        //     cellRenderer: (params) => {
        //         return params.value;
        //     },
        //     // Include this column only in expanded rows
        // },
        adId: {
            headerName: 'adId',
            field: 'adId',
            sortable: true,
            filter: "agTextColumnFilter",
            hide: false
        },
        actions: {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 90,
            sortable: false,    // Ensure sorting is disabled
            filter: false,      // Ensure filtering is disabled
            enableSorting: false,  // Disable sorting at the column level
            enableFilter: false,
            hide: false,
            suppressMenu: true,
            hide: !isYesterday(),
            cellRenderer: (params) => {
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [newgroupedData, setNewGroupedData] = useState([]);
                const [groupedData, setGroupedData] = useState([]);
                const [changeBudget, onChangeBudget] = useState();
                const [campaignStatus, setCampaignStatus] = useState(true);

                const onChangeSpendAndStatus = async () => {
                    // Check if it's a group footer row (for groupIncludeFooter)
                    if (params?.node?.footer) {
                        // console.log("This is a groupIncludeFooter row. Modal will not open.");
                        return; // Prevent modal from opening for group footer rows
                    }

                    // Ensure allLeafChildren exists and is an array before proceeding
                    const allLeafChildren = params.node?.allLeafChildren || [];
                    setNewGroupedData(groupedData);

                    // Fetch all the rows under the current group
                    const groupedData = allLeafChildren.map(node => node.data) || [];

                    // Only show the modal if there is data (groupedData length is greater than 0)
                    if (groupedData.length > 0) {
                        const getCampaignResponse = await axios.get(`https://prodapis.adsgoat.in/Comments/accountNumber/campaign/data?accountNumber=${newaccount}&campaignname=${groupedData[0]?.campaignname}`, {
                            headers: {
                                Authorization: token,
                            },
                        });
                        if (getCampaignResponse.status === 200 && getCampaignResponse.data.length !== 0) {
                            setGroupedData(getCampaignResponse.data);
                            setCampaignStatus(getCampaignResponse.data.status === null ? false : getCampaignResponse.data.status);
                            onChangeBudget(getCampaignResponse.data.budget === null ? null : getCampaignResponse.data.budget / 100)
                        }
                        else {
                            setGroupedData(groupedData);
                            // console.log("dailyadd");
                        }
                        // Set the grouped data for the modal
                        setIsModalVisible(true); // Show the modal for non-footer rows
                    }
                };

                const handleOk = async () => {
                    setIsModalVisible(false); // Close the modal
                    const object = {
                        campaignname: !Array.isArray(groupedData) ? groupedData?.campaignname : groupedData[0]?.campaignname,
                        adsetid: !Array.isArray(groupedData) ? groupedData?.adsetid : groupedData[0]?.adsetid,
                        campaignid: !Array.isArray(groupedData) ? groupedData?.campaignid : groupedData[0]?.campaignid,
                        usercommit: userdetails?.email,
                        accountNumber: newaccount,
                        budget: changeBudget * 100,
                        status: campaignStatus
                    };
                    // console.log(object);
                    const requestResponse = await axios.post('https://prodapis.adsgoat.in/Comments/accountNumber/campaign', { formattedData: object }, {
                        headers: {
                            Authorization: token,
                        },
                    });
                    const responseData = requestResponse.data;
                    // console.log(responseData, "response");
                    message.success("Budget and Status Updated");
                    changeRRefrst();
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                    // console.log(changeBudget); // Close the modal
                };

                const getTotalSpend = (data) => {
                    if (!data || data.length === 0) return 0;
                    const total = data.reduce((total, item) => {
                        return total + (item?.spend || 0);
                    }, 0);
                    return Math.round(total * 100) / 100; // Round to 2 decimal places
                };

                const onChangeBudgetValue = event => {
                    onChangeBudget(event.target.value)
                }

                const onChangeCampaignStatus = () => {
                    setCampaignStatus((prev) => !prev);
                }


                // console.log(groupedData);

                return (
                    <div>
                        {/* Click action for status cell */}
                        <div onClick={onChangeSpendAndStatus}>
                            <span>{params.value || "..."}</span> {/* Fallback to '...' if status is not available */}
                        </div>
                        {/* Modal should only be shown for non-footer rows and when groupedData length is greater than 0 */}
                        {isModalVisible && (
                            <Modal
                                title={groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignname : groupedData?.campaignname}
                                visible={isModalVisible}
                                onOk={handleOk}
                                onCancel={handleCancel}
                                width={600}  // Set a custom width for the modal
                                style={{ padding: '20px' }}  // Adjust body padding
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Campaign Name and Switch */}
                                    {/* <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography.Text strong>Campaign Name:</Typography.Text>
                                        <Typography.Text strong style={{ paddingLeft: '5px' }}>
                                            {`${groupedData[0]?.campaignname || "N/A"}`}
                                        </Typography.Text>
                                    </div> */}
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Typography.Text strong style={{ paddingRight: '20px' }}>Campaign Status: Activate/Pause</Typography.Text>
                                        <Switch checked={campaignStatus} onChange={onChangeCampaignStatus} />
                                    </div>

                                    {/* Input Field */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong style={{ marginBottom: '10px' }}>Budget:</Typography.Text>
                                        <Input placeholder="Enter your value here" defaultValue={groupedData?.length > 0 && groupedData?.length !== 1 ? getTotalSpend(groupedData) : groupedData?.budget ? (groupedData?.budget) / 100 : getTotalSpend(newgroupedData)} onChange={onChangeBudgetValue} />
                                    </div>

                                    {/* Campaign ID */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography.Text strong>Campaign ID:</Typography.Text>
                                        <p>{groupedData?.length > 0 && groupedData?.length !== 0 ? groupedData[0]?.campaignid : groupedData.campaignid}</p>
                                    </div>
                                </div>
                            </Modal>
                        )}
                    </div>
                );
            },
            filterParams: { filterEnabled: false },

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
            headerName: 'Spend($)',
            field: 'spend',
            width: 240,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter, // Format display as currency
            comparator: numberComparator,
        },
        revenue: {
            headerName: 'Revenue($)',
            field: 'revenue',
            width: 240,
            aggFunc: liveSpender,
            sortable: true,
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
        },
        profit: {
            headerName: 'Profit($)',
            field: 'profit',
            width: 240,
            aggFunc: liveSpender,
            sortable: true,
            cellClassRules: {
                'font-red': p => p.value < 0 // Conditional formatting for negative profit
            },
            filter: "agNumberColumnFilter",
            valueFormatter: currencyFormatter,
            comparator: numberComparator,
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
        ctr: {
            headerName: 'Ctr', field: 'ctr', valueGetter: getCtr, sortable: true,
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
        fmargin: {
            headerName: 'Fmargin(%)', field: 'fmargin', valueGetter: getFmargin, sortable: true, filter: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
        },
        roi: {
            headerName: 'ROI(%)', field: 'roi', valueGetter: getROI, sortable: true, headerTooltip: 'Profit/Spend', filter: true,
            comparator: (valueA, valueB) => {
                // Handle sorting based on the computed margin value
                if (valueA == null) return -1;
                if (valueB == null) return 1;
                return valueA - valueB;
            },
            valueFormatter: (params) => `${params.value}%`,
        },
        adsetid: { headerName: 'AdsetId', field: 'adsetid', sortable: true, filter: "agTextColumnFilter", hide: false },
        campaignid: { headerName: 'CampaignId', field: 'campaignid', sortable: true, filter: "agTextColumnFilter", },
        timezone: { headerName: 'TimeZone', field: 'timezone', sortable: true, hide: true, filter: "agTextColumnFilter", },
    };

    const columnDefsObject4 = [
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
        },
        {
            headerName: 'Keyword',
            field: 'keyword',
            sortable: true,
            filter: 'agTextColumnFilter',
            resizable: true,
            minWidth: 350,
            cellStyle: { textAlign: 'left' },
        },
        {
            headerName: 'Date',
            field: 'date',
            width: 120,
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
        },
        {
            headerName: 'Revenue',
            field: 'revenue',
            sortable: true,
            filter: 'agNumberColumnFilter',
            resizable: true,
            valueFormatter: (params) => params.value ? `$${params.value.toFixed(2)}` : '$0.00',
            width: 200,
            aggFunc: 'sum',
        },
        {
            headerName: 'Vertical',
            field: 'vertical',
            sortable: true,
            filter: 'agTextColumnFilter',
            resizable: true,
            minWidth: 250,
        },
        {
            headerName: 'Country',
            field: 'country',
            sortable: true,
            filter: 'agTextColumnFilter',
            resizable: true,
            minWidth: 150,
        },
        {
            headerName: 'Device Type',
            field: 'deviceType',
            sortable: true,
            filter: 'agTextColumnFilter',
            resizable: true,
            minWidth: 200,
        },
        {
            headerName: 'Searches',
            field: 'searches',
            sortable: true,
            filter: 'agNumberColumnFilter',
            resizable: true,
            width: 150,
            aggFunc: 'sum',
        },
        {
            headerName: 'Clicks',
            field: 'clicks',
            sortable: true,
            filter: 'agNumberColumnFilter',
            resizable: true,
            width: 150,
            aggFunc: 'sum',
        },
    ];

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

    const getColumnDefs3 = (order) => {
        // console.log(order);
        const orderItems = order?.map(colKey => columnDefsObject3[colKey]);
        const newOrderItems = [columnDefsObject3["keyword"], columnDefsObject3["searchKeyword"], ...orderItems, columnDefsObject3["adId"]];
        return newOrderItems;
    };

    const getColumnDefs4 = (order) => {
        // console.log(order);
        const orderItems = order?.map(colKey => columnDefsObject3[colKey]);
        const newOrderItems = [columnDefsObject3["keyword"],   ...orderItems];
        return newOrderItems;
    };

    const [columnDefs, setColumnDefs] = useState();

    const columnDefs1 = useRef();

    const columnDefs2 = useRef();

    const columnDefs3 = useRef();

    const columnDefs4 = useRef();

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
        columnDefs3.current = (getColumnDefs3(updateDataArray));
        columnDefs4.current = (getColumnDefs4(updateDataArray));
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

        // console.log("Maximum hour:", String(maxHour).padStart(2, '0'));  // Format it back to string with leading zero if necessary
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
        // console.log(mainData.columnStructure, "columnStructure");
        // setRowStructure(mainData.rows); 
        setColumnDefs(getColumnDefs(mainData.columnStructure));
        columnDefs1.current = getColumnDefs2(mainData.columnStructure);
        columnDefs2.current = (getColumnDefs2(mainData.columnStructure));
        columnDefs3.current = (getColumnDefs3(mainData.columnStructure));
        columnDefs4.current = (getColumnDefs4(mainData.columnStructure));
    }

    function groupAndCalculateProfit(data) {
        const groupedData = data.reduce((acc, item) => {
            const key = `${item.domain}-${item[`${newtime}Date`]}`;

            if (!acc[key]) {
                acc[key] = {
                    domain: item.domain,
                    [`${newtime}Date`]: item[`${newtime}Date`],
                    estimated_revenue: 0,
                    spend: 0,
                    conversions: 0,
                    fbLeads: 0,
                };
            }

            acc[key].estimated_revenue += item.estimated_revenue;
            acc[key].spend += parseFloat(item.spend);
            acc[key].conversions += item.conversions || 0;  // Default to 0 if undefined
            acc[key].fbLeads += parseInt(item.fbLeads) || 0;        // Default to 0 if undefined

            return acc;
        }, {});

        return Object.values(groupedData).map(item => ({
            ...item,
            profit: item.estimated_revenue - item.spend,
            margin: item.estimated_revenue > 0 ? ((item.estimated_revenue - item.spend) / item.estimated_revenue) * 100 : 0,
            rpc: item.conversions > 0 ? (item.estimated_revenue / item.conversions) : 0, // Revenue per Conversion
            cpl: item.fbLeads > 0 ? (item.spend / item.fbLeads) : 0,  // Cost per Lead
        }));
    }

    function groupAndCalculateBMName(data) {
        const groupedData = data.reduce((acc, item) => {
            const key = `${item.BMName}-${item[`${newtime}Date`]}`;

            if (!acc[key]) {
                acc[key] = {
                    BMName: item.BMName,
                    [`${newtime}Date`]: item[`${newtime}Date`],
                    estimated_revenue: 0,
                    spend: 0,
                    conversions: 0,
                    fbLeads: 0,
                };
            }

            acc[key].estimated_revenue += item.estimated_revenue;
            acc[key].spend += parseFloat(item.spend);
            acc[key].conversions += item.conversions || 0;  // Default to 0 if undefined
            acc[key].fbLeads += parseInt(item.fbLeads) || 0;        // Default to 0 if undefined

            return acc;
        }, {});

        return Object.values(groupedData).map(item => ({
            ...item,
            profit: item.estimated_revenue - item.spend,
            margin: item.estimated_revenue > 0 ? ((item.estimated_revenue - item.spend) / item.estimated_revenue) * 100 : 0,
            rpc: item.conversions > 0 ? (item.estimated_revenue / item.conversions) : 0, // Revenue per Conversion
            cpl: item.fbLeads > 0 ? (item.spend / item.fbLeads) : 0,  // Cost per Lead
        }));
    }


    const functionCall1 = async () => {
        if (!token) {
            console.error("Token not available. Please log in.");
            return;  // Stop execution if token is missing
        }
        // console.log(newRevenuePratner);
        const fetchData = await axios.get(`https://prodapis.adsgoat.in/Live?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=${newtworkCollections[newRevenuePratner]}`, {
            headers: {
                Authorization: token,
            },
        });
        const mainData = fetchData.data;
        let campaignComments = [];

        if (fetchData.status === 200 && mainData.length > 0 && newRevenuePratner === "FB_Mnet") {
            const groupAndCalculateProfit1 = groupAndCalculateProfit(mainData);

            setDomainData(groupAndCalculateProfit1);

            setDomainColumnDefs([
                {
                    field: 'domain',
                    headerName: 'Domain',
                    minWidth: 400,
                    // resizable: true,
                    sortable: true,
                    hide: true, // Hide column as it's grouped
                    rowGroup: true,
                    enableRowGroup: true,
                    flex: 8

                },
                {
                    field: `${newtime}Date`,
                    headerName: 'Date',
                    flex: 6,
                    minWidth: 200,
                    filter: true,
                },
                {
                    field: "spend",
                    resizable: true,
                    sortable: true,
                    filter: true,
                    minWidth: 150,
                    aggFunc: spender,
                    valueFormatter: currencyFormatter
                },
                {
                    field: "estimated_revenue",
                    headerName: "Revenue",
                    resizable: true,
                    sortable: true,
                    filter: true,
                    minWidth: 150,
                    aggFunc: spender,
                    valueFormatter: currencyFormatter
                },
                {
                    field: 'profit',
                    resizable: true,
                    sortable: true,
                    minWidth: 150,
                    cellClassRules: {
                        'font-red': p => p.value < 0
                    },
                    aggFunc: spender,
                    filter: true,
                    valueFormatter: currencyFormatter
                },
                {
                    field: "margin",
                    headerName: 'Margin(%)',
                    aggFunc: average,
                    cellClassRules: {
                        'font-red': p => p.value < 0
                    },
                    minWidth: 150,
                    valueFormatter: marginFormatter,
                    filter: true,
                },
                {
                    field: 'rpc',
                    headerName: 'RPC',
                    aggFunc: avgRpcCpl,
                    valueFormatter: rpcCplFormatter,
                    minWidth: 100,
                    flex: 3,
                    filter: true,
                },
                {
                    field: 'cpl',
                    headerName: 'CPL',
                    aggFunc: avgRpcCpl,
                    valueFormatter: rpcCplFormatter,
                    minWidth: 100,
                    flex: 3,
                    filter: true,
                }
            ]);
            setDomainFixedFooter([
                {
                    // domain:'Totals',
                    [`${newtime}Date`]: 'Totals',
                    spend: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0).toFixed(2)),
                    estimated_revenue: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.estimated_revenue), 0).toFixed(2)),
                    profit: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0).toFixed(2)),
                    margin: parseFloat((groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr.estimated_revenue), 0) * 100).toFixed(2)),
                    rpc: parseFloat((groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.rpc), 0) / groupAndCalculateProfit1?.length).toFixed(2)),
                    cpl: parseFloat((groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.cpl), 0) / groupAndCalculateProfit1?.length).toFixed(2)),
                    conversions: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.conversions), 0).toFixed(2)),
                    // clicks: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.clicks), 0).toFixed(2)),
                    // impressions: parseFloat(groupAndCalculateProfit1?.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0).toFixed(2)),
                }
            ]);
            // console.log(groupAndCalculateProfit1);
        }

        if (fetchData.status === 200 && mainData.length > 0) {
            const groupAndCalculateBMName1 = groupAndCalculateBMName(mainData);
            setBMNameData(groupAndCalculateBMName1);
            setBMNameColumnDefs([
                {
                    field: 'BMName',
                    headerName: 'BMName',
                    minWidth: 400,
                    // resizable: true,
                    sortable: true,
                    hide: true, // Hide column as it's grouped
                    rowGroup: true,
                    enableRowGroup: true,
                    flex: 9

                },
                {
                    field: `${newtime}Date`,
                    headerName: 'Date',
                    flex: 6,
                    minWidth: 200,
                    filter: true,
                },
                {
                    field: "spend",
                    resizable: true,
                    sortable: true,
                    filter: true,
                    minWidth: 150,
                    aggFunc: spender,
                    valueFormatter: currencyFormatter
                },
                {
                    field: "estimated_revenue",
                    headerName: "Revenue",
                    resizable: true,
                    sortable: true,
                    filter: true,
                    minWidth: 150,
                    aggFunc: spender,
                    valueFormatter: currencyFormatter
                },
                {
                    field: 'profit',
                    resizable: true,
                    sortable: true,
                    minWidth: 150,
                    cellClassRules: {
                        'font-red': p => p.value < 0
                    },
                    aggFunc: spender,
                    filter: true,
                    valueFormatter: currencyFormatter
                },
                {
                    field: "margin",
                    headerName: 'Margin(%)',
                    aggFunc: average,
                    cellClassRules: {
                        'font-red': p => p.value < 0
                    },
                    minWidth: 150,
                    valueFormatter: marginFormatter,
                    filter: true,
                },
                {
                    field: 'rpc',
                    headerName: 'RPC',
                    aggFunc: avgRpcCpl,
                    valueFormatter: rpcCplFormatter,
                    minWidth: 100,
                    flex: 3,
                    filter: true,
                },
                {
                    field: 'cpl',
                    headerName: 'CPL',
                    aggFunc: avgRpcCpl,
                    valueFormatter: rpcCplFormatter,
                    minWidth: 100,
                    flex: 3,
                    filter: true,
                }
            ]);
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
        }
        // if (fetchData.status === 200 && mainData.length > 0) {
        //     try {
        //         const commentFetch = await axios.get(`https://prodapis.adsgoat.in/Comments/${account}`, {
        //             headers: {
        //                 Authorization: token,
        //             },
        //         });
        //         campaignComments = commentFetch.data; // Set comments only if fetched successfully
        //     } catch (error) {
        //         console.error('Error fetching comments:', error); // Log any errors fetching comments
        //     }
        // }
        // setCampaignComments(campaignComments);
       


        
        // console.log(mainData, "maindata of functinCall1");
        
        if (fetchData.status === 200 && mainData.length > 0) {
            try {
                // Fetch comments
                const commentFetch = await axios.get(`https://prodapis.adsgoat.in/Comments/${account}`, {
                    headers: {
                        Authorization: token,
                    },
                });
                const campaignComments = commentFetch.data; // Set comments only if fetched successfully
                setCampaignComments(campaignComments);
        
                // Fetch campaign status after successfully fetching comments
                const campaignStatusFetch = await axios.get(`https://prodapis.adsgoat.in/Campaignstatusfb/${account}`, {
                    headers: {
                        Authorization: token,
                    },
                });
        
                if (campaignStatusFetch.status === 200) {
                    setCamapignlevelstatus(campaignStatusFetch.data); // Update state with fetched campaign status
                }
            } catch (error) {
                console.error('Error during API calls:', error); // Log any errors
            }
        }
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
                const relatedComment = campaignComments.find(comment => comment.campaignname === eachData.campaign_name);
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
                        comment: relatedComment ? relatedComment.comment : null,
                        actions: '...'
                    }
                )
            })
            : null;
        // setValue(mainData);
        // console.log(mainData[0])

        const getFbValue = mainData.filter(item => item.fbCron !== null && item.fbCron !== 'Failed');
        const getRevenueValue = mainData.filter(item => item.revenueCron !== null && item.revenueCron !== 'Failed');

        if (mainData.length > 1) {
            timezone.current = mainData[0].accountTimezone;
            accountStatus.current = mainData[0].accountStatus;
            cronStatus.current = mainData[0].cronStatus;

            // fbCron.current = getFbValue[0].fbCron;
            // revenueCron.current = getRevenueValue[0]?.revenueCron;

            fbCron.current = getFbValue[0]?.fbCron ? getFbValue[0].fbCron : 'Failed';
            revenueCron.current = getRevenueValue[0]?.revenueCron ? getRevenueValue[0].revenueCron : 'Failed';

            maxHour.current = findMaxHour(mainData);
            maxNetworkHour.current = getMaxHour(mainData);
        }


        // const getValidValue = mainData.filter(item => item.fbCron !== null && item.revenueCron !== null)

        // // console.log(getValidValue[0])


        // if (mainData.length > 1) {
        //     timezone.current = mainData[0].accountTimezone;
        //     accountStatus.current = mainData[0].accountStatus;
        //     cronStatus.current = mainData[0].cronStatus;
        //     fbCron.current = getValidValue[0].fbCron;
        //     revenueCron.current = getValidValue[0].revenueCron;
        //     maxHour.current = findMaxHour(mainData);
        //     maxNetworkHour.current = getMaxHour(mainData);
        // }
        setRowData(filteredData);
        newRowData.current = filteredData;
        setInitialRowData(filteredData);
        setTrue(false);
        setLoading(false);

    }



    const functionCall2 = async () => {
        try {
            const fetchData = await axios.get(`https://prodapis.adsgoat.in/Daily?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=${newtworkCollections[newRevenuePratner]}`, {
                headers: {
                    Authorization: token,
                },
            });
            const mainData = fetchData.data;
            // console.log(mainData, "mainData of functionCall2");
            let totalSpend = 0;
            let totalRevenue = 0;
            let totalProfit = 0;
            let totalCpc = 0;
            let totalFbleads = 0;
            let totalFbclicks = 0;
            let totalImpressions = 0;
            let totalConversions = 0;
            const specifiedTimeZone = selectTimezone[time];
            // console.log(mainData[0], "one");
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

                    // console.log(eachData.campaign_name, "campaign_name");
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
                            actions: '...'
                            // compaignid: eachData.campaign_id,
                        }
                    )
                }) : null;
            // console.log(filteredData[0],"one");
            // console.log(filteredData, "filter");

            const fullData = filteredData?.length > 0 ? [...filteredData] : [];
            // console.log(fullData, "full");

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
        const fetchData = await axios.get(`https://prodapis.adsgoat.in/AllCampaigns?accountNumber=${newaccount}&timezone=${newtime}&network=${newtworkCollections[newRevenuePratner]}&page=${pageSize}&limit=100`, {
            headers: {
                Authorization: token,
            },
        });
        // console.log(fetchData, "f1");
        const mainData = fetchData.data.items;

        const url = `https://prodapis.adsgoat.in/AllCampaigns?accountNumber=${newaccount}&timezone=${newtime}&network=${newtworkCollections[newRevenuePratner]}&page=${pageSize}&limit=100`;

        const specifiedTimeZone = selectTimezone[time];
        // console.log(specifiedTimeZone, "spe");
        // console.log(mainData, "maindata of functionCall3");
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
                        actions: '...'
                    }
                )
            })
            : null;
        totalItems.current = fetchData.data.totalItems;
        // console.log(mainData);
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


    const functionCall4 = async () => {
        try {
            const fetchData = await axios.get(`https://prodapis.adsgoat.in/DAKeywords?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=${newtworkCollections[newRevenuePratner]}`, {
                headers: {
                    Authorization: token,
                },
            });
            const mainData = fetchData.data;
            // console.log(mainData, "mainData of functionCall4");
            let totalSpend = 0;
            let totalRevenue = 0;
            let totalProfit = 0;
            let totalCpc = 0;
            let totalFbleads = 0;
            let totalFbclicks = 0;
            let totalImpressions = 0;
            let totalConversions = 0;
            const specifiedTimeZone = selectTimezone[time];
            // console.log(mainData[0], "one");
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

                    // console.log(eachData.campaign_name, "campaign_name");
                    // console.log(eachData.landerKeyword, "Keyword");
                    // console.log((eachData.tg7, "adid"));
                    return (
                        {
                            campaignname: eachData.campaign_name,
                            keyword: eachData.landerKeyword,
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
                            actions: '...',
                            adId: eachData.tg7,
                            searchKeyword: eachData.searchKeyword
                            // compaignid: eachData.campaign_id,
                        }
                    )
                }) : null;
            // console.log(filteredData[0],"one");
            // console.log(filteredData, "filter");

            const fullData = filteredData?.length > 0 ? [...filteredData] : [];
            // console.log(fullData, "full");

            // setDailyColumn(columnDefs);
            setKeywordData(fullData);
            // if (gridRef3.current && gridRef3.current.api) {
            //     gridRef3.current.api.refreshCells();  // Refresh AgGrid after setting new data
            // }
            newDailyData.current = fullData;
            // setTrue(false);
            setLoading3(false);
        } catch (error) {
            console.log(error);
        }
    }

    const functionCall5 = async () => {
        try {
            const fetchData = await axios.get(`https://prodapis.adsgoat.in/System1Keywords?startDate=${startDate}&endDate=${endDate}`, {
                headers: {
                    Authorization: token,
                },
            });
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
                };
            }) : [];

            // Log filtered data to check
            console.log(filteredData, "filteredData");

            // Update state with new data
            setSystem1KeywordData(filteredData);

            // // Refresh grid after setting new data
            // if (gridRef4.current && gridRef4.current.api) {
            //     gridRef4.current.api.refreshCells();  // Refresh AgGrid after setting new data
            // }

            setSFixedFooter([
                {
                    revenue: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
                }
            ]);

            newDailyData.current = filteredData;
            // setTrue(false);
            setLoading4(false); // Hide loading spinner
        } catch (error) {
            setSystem1KeywordData([]);
            setLoading4(false);
            console.log(error);
            // setLoading4(false); // Hide loading spinner in case of error
        }
    };

    const functionCall6 = async () => {
        try { 
            
            const fetchData = await axios.get(`https://prodapis.adsgoat.in/TonicKeywords?startDate=${startDate}&endDate=${endDate}&timezone=${newtime}&accountNumber=${newaccount}`, {
                headers: {
                    Authorization: token,
                },
            });
            const mainData = fetchData.data;
            console.log(mainData, "mainData of functionCall6");
            const specifiedTimeZone = selectTimezone[time];

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

                    // console.log(eachData.campaign_name, "campaign_name");
                    // console.log(eachData.landerKeyword, "Keyword");
                    // console.log((eachData.tg7, "adid"));
                    return (
                        {
                            campaignname: eachData.campaign_name,
                            keyword: eachData.landerKeyword,
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
                            actions: '...',
                            keyword: eachData.keyword
                            // compaignid: eachData.campaign_id,
                        }
                    )
                }) : null;
            // console.log(filteredData[0],"one");
            // console.log(filteredData, "filter");

            console.log(filteredData);

            const fullData = filteredData?.length > 0 ? [...filteredData] : [];
            // console.log(fullData, "full");

            // setDailyColumn(columnDefs);
            console.log(fullData);
            setTonicKeywordData(fullData);
            setTonicKeywordLoading(false);
            newTonicKeywordData.current = fullData;
            setTonicFixedFooter([
                {
                    campaignName: 'Total',
                    spend: fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0),
                    revenue: fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0),
                    profit: fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0),
                    margin: `${(fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)}%`,
                    rpc: fullData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / fullData?.length,
                    cpl: fullData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / fullData?.length,
                    ncpl: fullData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / fullData?.length,
                    fbleads: fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0),
                    conversions: fullData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0),
                    fmargin: `${(fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)}%`,
                    roi: `${(fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100}%`,
                    cpc: fullData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / fullData?.length,
                    fbclicks: fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0),
                    impressions: fullData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0),
                    ctr: `${(fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)}%`
                }
            ]);
            console.log([
                {
                    campaignName: 'Total',
                    spend: fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0),
                    revenue: fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0),
                    profit: fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0),
                    margin: `${(fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)}%`,
                    rpc: fullData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / fullData?.length,
                    cpl: fullData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / fullData?.length,
                    ncpl: fullData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / fullData?.length,
                    fbleads: fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0),
                    conversions: fullData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0),
                    fmargin: `${(fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)}%`,
                    roi: `${(fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100}%`,
                    cpc: fullData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / fullData?.length,
                    fbclicks: fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0),
                    impressions: fullData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0),
                    ctr: `${(fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)}%`
                }
            ]);
            
        } catch (error) {
            setTonicKeywordData([]);
            setTonicKeywordLoading(false); 
            console.log(error);
            // setLoading4(false); // Hide loading spinner in case of error
        }
    };

    useEffect(() => {
        const functionCall = async () => {
            try {
                // Run these functions only on the initial load
                if (isInitialLoad.current) {
                    await functionCallForUserColumnStructure();
                    await functionCall1();
                    await functionCall2();
                    // await functionCall4();
                    // console.log("Initial functions executed successfully.");
                    isInitialLoad.current = false; // Set to false after initial load
                }

                // Run this function on initial load and whenever pageSize changes
                await functionCall3();
                if (newRevenuePratner === "FB_DomainActive") {
                    await functionCall4();
                } else if (newRevenuePratner === "FB_System1") {
                    await functionCall5();
                }else if(newRevenuePratner === "FB_Tonic1"){
                    await functionCall6();
                }

                // console.log("functionCall3 executed successfully.");
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
                // await functionCall4();   
                // await functionCall5(); 
                if (newRevenuePratner === "FB_DomainActive") {
                    await functionCall4();
                } else if (newRevenuePratner === "FB_System1") {
                    await functionCall5();
                }else if(newRevenuePratner === "FB_Tonic1"){
                    await functionCall6();
                }
            }
            functionCall();
        }
    }, [isTrue])

    useEffect(() => {
        // Update the grid key to force a re-render when fixedFooter changes
        setGridKey((prevKey) => prevKey + 1);
    }, [fixedFooter, sFixedFooter]);



    const selectRevenuePartner = ["Fb_Mnet", "Fb_Enki"];
    let selectElementAccounts = [];
    const mnetAccounts = ['674038077865381', '665204411821465'];
    const enkiAccounts = ['364991119488050'];

    const onChangeSelectRevenue = (value) => {
        const accountsForAccess = adAccounts[value];
        // console.log(accountsForAccess, "accounts Access");
        // console.log(accountsForAccess[0], "accountFor Access");

        const accountsAccess = accountsForAccess === undefined ? [] : accountsForAccess;

        // console.log(accountsAccess, "accountsAccess");
        setNetworksData(accountsAccess);
        setRevenuePartner(value);
        // value === "FB_Tonic" ? console.log("PDT") : null;
        value === "FB_Rsoc" || value === "FB_Tonic" || value === "FB_DomainActive" || value === "FB_Tonic1" ? setTime('PDT') : setTime('UTC')
    }
    const onChangeSelect = (value) => {
        setAccount(value);
    }

    const onChangeTime = (value) => {
        setTime(value);
    }

    const onClickButton = () => {
        // console.log(account, "account");
        // console.log(time, "time");
        // console.log(url1);
        // console.log(url2);
        // console.log(startDate, "start");
        // console.log(endDate, "end");
        setNewEndDate(endDate);
        setNewStartDate(startDate);
        setPageSize(1);
        setTrue(true);
        setRowData([]);
        setTime(time);
        setLoading(true);
        setLoading1(true);
        setLoading2(true);
        newRevenuePratner === "FB_DomainActive" && setLoading3(true);
        newRevenuePratner === "FB_System1" && setLoading4(true);
        newRevenuePratner === "FB_Tonic1" && setTonicKeywordLoading(true);
        setNewAccount(account);
        setnewAccountName(accountName)
        setNewTime(time);
        setNewRevenuePartner(revenuePratner);
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
        // console.log('Customer Service button clicked');
        setActiveTab('2');
        carouselRef.current.goTo(1); // Change to the first slide
    };

    const handleCommentClick = () => {
        // console.log('Comment button clicked');
        setActiveTab('1');
        carouselRef.current.goTo(0); // Change to the second slide
    };

    const handleCommentClick1 = () => {
        // console.log('Comment button clicked');
        setActiveTab('3');
        carouselRef.current.goTo(2);
    }

    const handleChange = (dates) => {
        if (dates && dates.length === 2) {
            const [start, end] = dates;
            // console.log('Start Date:', start.format('YYYY-MM-DD'));
            // console.log('End Date:', end.format('YYYY-MM-DD'));
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
                const url = `/DailyAndCampaignHistory/AdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                window.open(url, '_blank');
                // console.log(`Price clicked: ${value}`);
            }
        }

    };

    const onCellClickedAllCampaigns = (event) => {
        if (event.colDef.field === 'adsetname') {
            const value = event.value;
            if (value !== undefined) {
                const url = `/AllCampaigns/AdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                window.open(url, '_blank');
                // console.log(`Adset clicked: ${value}`);
            }
        }
    };

    const onCellClickedLive = (event) => {
        if (event.colDef.field === 'adsetname') {
            const value = event.value;
            if (value !== undefined) {
                const url = `/LiveHistory/LiveAdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                window.open(url, '_blank');
                // console.log(`Adset clicked: ${value}`);
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
//setCampaignCommentssetCampaignCommentssetCampaignComments
const [campaignComments, setCampaignComments] = useState([]);
const [Camapignlevelstatus, setCamapignlevelstatus] = useState([]);
    const fetchCampaignComments = async () => {
        try {

            const response = await axios.get(`https://prodapis.adsgoat.in/Comments/${account}`, {
                headers: {
                    Authorization: token, // Your token for authorization
                },
            });
            setCampaignComments(response.data); // Update the state with the fetched comments
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };


    useEffect( () => {
        // Ensure it only runs if `refrst` changes after the first render
        if (hasFetched.current) {
            fetchCampaignComments();
        } else {
            hasFetched.current = true; // Set it to true after first render
        }
    }, [refrst]); // Run this effect when refrst changes

    // useEffect(() => {
    //     fetchCampaignComments(); // Fetch comments on initial load
    // }, []); // Run this effect on component mount



    // const autoGroupColumnDefLive = {
    //     headerName: 'CampaignName',
    //     minWidth: 450,
    //     pinned: 'left',
    //     sortable: true, // Enable sorting

    //     comparator: (campaignA, campaignB) => {
    //         if (!campaignA) return 1;
    //         if (!campaignB) return -1;

    //         // Function to get the 'pinned' status of a campaign
    //         const getPinStatusForCampaign = (campaignName) => {
    //             const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //             return relatedComment ? relatedComment.pinned : false;
    //         };

    //         // Prioritize pinned campaigns first (pinned campaigns should come to the top)
    //         const isPinnedA = getPinStatusForCampaign(campaignA);
    //         const isPinnedB = getPinStatusForCampaign(campaignB);

    //         if (isPinnedA !== isPinnedB) {
    //             return isPinnedA ? -1 : 1;  // Pinned campaigns should come first
    //         }

    //         // If both campaigns have the same pinned status, fall back to other sorting logic

    //         // For example: Prioritize by starred status
    //         const getStarredForCampaign = (campaignName) => {
    //             const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //             return relatedComment ? relatedComment.starred : false;
    //         };

    //         const isStarredA = getStarredForCampaign(campaignA);
    //         const isStarredB = getStarredForCampaign(campaignB);

    //         if (isStarredA !== isStarredB) {
    //             return isStarredA ? -1 : 1;  // Starred campaigns should come first
    //         }

    //         // Finally, fallback to alphabetical sorting if no pinned or starred criteria
    //         return campaignA.localeCompare(campaignB);
    //     },


    //     cellRendererParams: {
    //         suppressCount: false,
    //         innerRenderer: (params) => {
    //             if (params.node.footer) {
    //                 return 'Total';
    //             }

    //             const firstColumnValue = params.node.key;  // campaign name
    //             const campaignName = params.node.key;

    //             // Check if this is a grouped row and has children
    //             let campaignid, adsetid;

    //             if (params.node.group && params.node.childrenAfterGroup && params.node.childrenAfterGroup.length > 0) {
    //                 // Get the first child row data to extract campaignid and adsetid
    //                 const firstChild = params.node.childrenAfterGroup[0].data;
    //                 campaignid = firstChild.campaignid;
    //                 adsetid = firstChild.adsetid;
    //             } else if (params.data) {
    //                 // Fallback to individual row data if not grouped
    //                 campaignid = params.data.campaignid;
    //                 adsetid = params.data.adsetid;
    //             } else {
    //                 console.error('Missing campaignid or adsetid for campaign:', campaignName);
    //                 return (
    //                     <div style={{ color: 'red' }}>
    //                         Error: campaignid or adsetid missing for {campaignName}
    //                     </div>
    //                 );
    //             }

    //             const getEditedUserAndTime = (campaignName, newaccount) => {
    //                 const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
    //                 // console.log(relatedStatus, "relatedStatus");
    //                 const relatedStatusEditedTime = relatedStatus ? relatedStatus : null;
    //                 // console.log(relatedStatusTrue);
    //                 return relatedStatusEditedTime;
    //             }

    //             const getStatusForCampaign = (campaignName, newaccount) => {
    //                 const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
    //                 // console.log(relatedStatus, "relatedStatus");
    //                 const relatedStatusTrue = relatedStatus !== undefined && relatedStatus.status === true ? true : relatedStatus !== undefined ? false : null;
    //                 // console.log(relatedStatusTrue);
    //                 return relatedStatusTrue;
    //             }

    //             const getCommentForCampaign = (campaignName) => {
    //                 const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //                 return relatedComment ? relatedComment.comment : null;
    //             };

    //             const getStarredForCampaign = (campaignName) => {
    //                 const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //                 return relatedComment ? relatedComment.starred : false;
    //             };

    //             const getPinStatusForCampaign = (campaignName) => {
    //                 const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //                 return relatedComment ? relatedComment.pinned : false;
    //             };

    //             const editUserANdTime = getEditedUserAndTime(campaignName, newaccount);
    //             const relatedStatus = getStatusForCampaign(campaignName, newaccount);
    //             const relatedComment = getCommentForCampaign(campaignName);
    //             const isStarred = getStarredForCampaign(campaignName);
    //             const valueWithCount = `${firstColumnValue}`;

    //             const [tooltipText, setTooltipText] = useState("Click to Copy");
    //             const [isModalVisibles, setIsModalVisibles] = useState(false);
    //             const [comment, setComment] = useState(relatedComment || '');
    //             const [starred, setStarred] = useState(isStarred);
    //             const [pinned, setPinned] = useState(getPinStatusForCampaign(campaignName));

    //             const copyToClipboard = () => {
    //                 navigator.clipboard.writeText(firstColumnValue)
    //                     .then(() => {
    //                         setTooltipText("Copied!");
    //                         setTimeout(() => setTooltipText("Click to Copy"), 2000);
    //                     })
    //                     .catch(() => {
    //                         console.error('Failed to copy to clipboard');
    //                     });
    //             };

    //             const handleEditClick = () => {
    //                 setIsModalVisibles(true);
    //             };

    //             const sendNewCommentToAPI = async (logData) => {
    //                 try {
    //                     const response = await axios.post('https://prodapis.adsgoat.in/Comments', {
    //                         commentsdatas: logData,
    //                     }, {
    //                         headers: {
    //                             Authorization: token,
    //                         }
    //                     });

    //                     // console.log('Response from server:', response.data);
    //                 } catch (error) {
    //                     console.error('Error sending data to server:', error);
    //                 }
    //                 // console.log(logData);
    //             };

    //             const sendEditedCommentToAPI = async (logData) => {
    //                 try {
    //                     const response = await axios.post('https://prodapis.adsgoat.in/Comments/edit', {
    //                         campaignname: logData.campaignname,
    //                         comment: logData.comment,
    //                         Account: logData.Account,
    //                         adsetid: logData.adsetid,
    //                         campaignid: logData.campaignid,
    //                         status: true

    //                     }, {
    //                         headers: {
    //                             Authorization: token,
    //                         }
    //                     });
    //                     // console.log('Response from server (edited comment):', response.data);
    //                     return response.data;
    //                 } catch (error) {
    //                     console.error('Error sending edited comment to server:', error);
    //                     throw error;
    //                 }
    //                 // console.log(logData);
    //             };

    //             const sendStarStatusToAPI = async (campaignname, isStarred) => {
    //                 // console.log(campaignid);
    //                 // console.log(adsetid);
    //                 try {
    //                     const endpoint = isStarred ? 'https://prodapis.adsgoat.in/Star' : 'https://prodapis.adsgoat.in/Unstar';
    //                     const response = await axios.post(endpoint, {
    //                         campaignname: campaignname,
    //                         Account: account,
    //                         usercommit: userdetails?.email,
    //                         campaignid: campaignid, // Pass campaignid from grouped data
    //                         adsetid: adsetid // Pass adsetid from grouped data
    //                     }, {
    //                         headers: {
    //                             Authorization: token,
    //                         }
    //                     });
    //                     // console.log('Response from server (starred status):', response.data);
    //                 } catch (error) {
    //                     console.error('Error updating star status:', error);
    //                 }
    //             };

    //             const handleStarClick = async () => {
    //                 const updatedStarred = !starred;
    //                 setStarred(updatedStarred);
    //                 await sendStarStatusToAPI(firstColumnValue, updatedStarred);
    //                 message.success(updatedStarred ? "Campaign starred!" : "Campaign unstarred!");

    //                 const updatedComments = campaignComments.map(cmt =>
    //                     cmt.campaignname === firstColumnValue ? { ...cmt, starred: updatedStarred } : cmt
    //                 );
    //                 setCampaignComments(updatedComments);
    //                 changeRRefrst();
    //             };

    //             const handleOks = async () => {
    //                 try {
    //                     const logData = {
    //                         Account: newaccount,
    //                         usercommit: userdetails?.email,
    //                         campaignname: firstColumnValue,
    //                         comment: comment,
    //                         campaignid: campaignid, // Pass campaignid
    //                         adsetid: adsetid // Pass adsetid
    //                     };

    //                     if (relatedComment) {
    //                         await sendEditedCommentToAPI(logData);
    //                         message.success("Comment updated successfully!");
    //                     } else {
    //                         await sendNewCommentToAPI(logData);
    //                         message.success("New comment added successfully!");
    //                     }

    //                     const updatedComments = relatedComment
    //                         ? campaignComments.map(cmt => (cmt.campaignname === firstColumnValue ? { ...cmt, comment } : cmt))
    //                         : [...campaignComments, logData];
    //                     setCampaignComments(updatedComments);

    //                     changeRRefrst();
    //                     setIsModalVisibles(false);
    //                 } catch (error) {
    //                     console.error('Error while submitting comment:', error);
    //                     message.error("Error while submitting the comment.");
    //                 }
    //             };

    //             const handleCancels = () => {
    //                 setIsModalVisibles(false);
    //             };

    //             const CustomTooltipContent = ({ editedTime, usercommit }) => (
    //                 <div style={{ padding: '5px', borderRadius: '5px' }}>
    //                     <p style={{ margin: 0, color: "#ffffff" }}>{usercommit}</p>
    //                     <p style={{ margin: 0, color: "#ffffff" }}>{editedTime}</p>
    //                 </div>
    //             );

    //             const handlePinClick = async (campaignName, campaignid, adsetid, currentPinStatus) => {
    //                 const updatedPinStatus = !currentPinStatus;

    //                 try {
    //                     let response;
    //                     if (updatedPinStatus) {
    //                         response = await axios.post('https://prodapis.adsgoat.in/Pin', {
    //                             campaignname: campaignName,
    //                             Account: account,
    //                             campaignid: campaignid,
    //                             adsetid: adsetid,
    //                             usercommit: userdetails?.email,
    //                             comment: comment || ''
    //                         }, { headers: { Authorization: token } });

    //                         message.success("Campaign pinned!");
    //                     } else {
    //                         response = await axios.post('https://prodapis.adsgoat.in/Unpin', {
    //                             campaignname: campaignName,
    //                             Account: account,
    //                             campaignid: campaignid,
    //                             adsetid: adsetid
    //                         }, { headers: { Authorization: token } });

    //                         message.success("Campaign unpinned!");
    //                     }

    //                     const updatedComments = campaignComments.some(cmt => cmt.campaignname === campaignName)
    //                         ? campaignComments.map(cmt =>
    //                             cmt.campaignname === campaignName ? { ...cmt, pinned: updatedPinStatus } : cmt
    //                         )
    //                         : [...campaignComments, { campaignname: campaignName, pinned: updatedPinStatus }];

    //                     // Update pinned campaigns to stay at the top
    //                     const sortedComments = updatedComments.sort((a, b) => b.pinned - a.pinned);
    //                     setCampaignComments(sortedComments);
    //                     setPinned(updatedPinStatus);
    //                 } catch (error) {
    //                     console.error('Error toggling pin status:', error);
    //                     message.error('Error while updating pin status.');
    //                 }
    //             };

    //             const PinIcon = ({ campaignName, campaignid, adsetid, pinned }) => {
    //                 return (
    //                     <div onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}>
    //                         {pinned ? (
    //                             <PushpinFilled style={{ color: 'blue' }} />  // Blue for pinned
    //                         ) : (
    //                             <PushpinOutlined style={{ color: 'gray' }} />  // Gray for unpinned
    //                         )}
    //                     </div>
    //                 );
    //             };

    //             return (
    //                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
    //                     <PinIcon
    //                         campaignName={campaignName}
    //                         campaignid={campaignid}
    //                         adsetid={adsetid}
    //                         // pinned={getPinStatusForCampaign(campaignName)}
    //                         pinned={pinned}
    //                     />
    //                     {relatedStatus === true &&
    //                         <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
    //                             <CheckCircleFilled style={{ color: 'green', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
    //                         </Tooltip>
    //                     }
    //                     {relatedStatus === false &&
    //                         <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
    //                             <CloseCircleFilled style={{ color: 'red', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
    //                         </Tooltip>
    //                     }
    //                     {relatedComment && (
    //                         starred ? (
    //                             <StarFilled className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px', color: "gold" }} />
    //                         ) : (
    //                             <StarOutlined className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px' }} />
    //                         )
    //                     )}
    //                     {relatedComment ? (
    //                         <Tooltip title={(
    //                             <div style={{ display: 'flex', alignItems: 'center' }}>
    //                                 <span>{relatedComment || 'No comment available'}</span>
    //                                 <EditOutlined onClick={handleEditClick} style={{ marginLeft: '10px', color: 'blue', cursor: 'pointer' }} />
    //                             </div>
    //                         )}>
    //                             <MessageOutlined className='Message' style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px', color: 'blue' }} />
    //                             <Tooltip title={tooltipText}></Tooltip>
    //                         </Tooltip>
    //                     ) : (
    //                         <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }} />
    //                     )}
    //                     <Tooltip title={tooltipText}>
    //                         <CopyOutlined
    //                             onClick={copyToClipboard}
    //                             style={{ cursor: 'pointer', marginLeft: '8px', color: "#1e1e1f", marginRight: '10px' }}
    //                         />
    //                     </Tooltip>
    //                     <span
    //                         onClick={() => {
    //                             const url = `/LiveHistory/LiveCampaignHistory/${params.value}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
    //                             window.open(url, '_blank');
    //                         }}
    //                     >
    //                         {valueWithCount}
    //                     </span>
    //                     <Modal
    //                         title={firstColumnValue}
    //                         visible={isModalVisibles}
    //                         onOk={handleOks}
    //                         onCancel={handleCancels}
    //                     >
    //                         <Input.TextArea
    //                             placeholder="Enter your comments here"
    //                             value={comment}
    //                             onChange={(e) => setComment(e.target.value)}
    //                         />
    //                     </Modal>
    //                 </div>
    //             );
    //         }
    //     }
    // }; tech modified 
    
    const autoGroupColumnDefLive = {
        headerName: 'CampaignName',
        minWidth: 450,
        pinned: 'left',
        sortable: true, // Enable sorting

        comparator: (campaignA, campaignB) => {
            if (!campaignA) return 1;
            if (!campaignB) return -1;

            // Function to get the 'pinned' status of a campaign
            const getPinStatusForCampaign = (campaignName) => {
                const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                return relatedComment ? relatedComment.pinned : false;
            };

            // Prioritize pinned campaigns first (pinned campaigns should come to the top)
            const isPinnedA = getPinStatusForCampaign(campaignA);
            const isPinnedB = getPinStatusForCampaign(campaignB);

            if (isPinnedA !== isPinnedB) {
                return isPinnedA ? -1 : 1;  // Pinned campaigns should come first
            }

            // If both campaigns have the same pinned status, fallback to alphabetical sorting
            return campaignA.localeCompare(campaignB);
        },
        cellRendererParams: {
            suppressCount: false,
            innerRenderer: (params) => {
                if (params.node.footer) {
                    return 'Total';
                }
                // console.log(params.value, "value");

                const firstColumnValue = params.node.key;  // campaign name
                const campaignName = params.node.key;

                let campaignid, adsetid;

                if (params.node.group && params.node.childrenAfterGroup && params.node.childrenAfterGroup.length > 0) {
                    const firstChild = params.node.childrenAfterGroup[0].data;
                    campaignid = firstChild.campaignid;
                    adsetid = firstChild.adsetid;
                } else if (params.data) {
                    campaignid = params.data.campaignid;
                    adsetid = params.data.adsetid;
                } else {
                    console.error('Missing campaignid or adsetid for campaign:', campaignName);
                    return (
                        <div style={{ color: 'red' }}>
                            Error: campaignid or adsetid missing for {campaignName}
                        </div>
                    );
                }

                const getEditedUserAndTime = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    return relatedStatus ? relatedStatus : null;
                };

                const getPinEditedUserAndTime = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    return relatedStatus ? relatedStatus : null;
                };

                const getStatusForCampaign = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    return relatedStatus !== undefined && relatedStatus.status === true ? true : relatedStatus !== undefined ? false : null;
                };

                const getCommentForCampaign = (campaignName) => {
                    const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                    return relatedComment ? relatedComment.comment : null;
                };

                const getPinStatusForCampaign = (campaignName) => {
                    const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                    return relatedComment ? relatedComment.pinned : false;
                };

                const editUserANdTime = getEditedUserAndTime(campaignName, newaccount);
                const editPinUserANdTime = getPinEditedUserAndTime(campaignName, newaccount);
                const relatedStatus = getStatusForCampaign(campaignName, newaccount);
                const relatedComment = getCommentForCampaign(campaignName);
                const valueWithCount = `${firstColumnValue}`;

                const [tooltipText, setTooltipText] = useState("Click to Copy");
                const [isModalVisibles, setIsModalVisibles] = useState(false);
                const [comment, setComment] = useState(relatedComment || '');
                const [pinned, setPinned] = useState(getPinStatusForCampaign(campaignName));

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

                const handleEditClick = () => {
                    setIsModalVisibles(true);
                };

                const sendNewCommentToAPI = async (logData) => {
                    try {
                        const response = await axios.post('https://prodapis.adsgoat.in/Comments', {
                            commentsdatas: logData,
                        }, {
                            headers: {
                                Authorization: token,
                            }
                        });
                    } catch (error) {
                        console.error('Error sending data to server:', error);
                    }
                };

                const sendEditedCommentToAPI = async (logData) => {
                    try {
                        const response = await axios.post('https://prodapis.adsgoat.in/Comments/edit', {
                            campaignname: logData.campaignname,
                            comment: logData.comment,
                            Account: logData.Account,
                            adsetid: logData.adsetid,
                            campaignid: logData.campaignid,
                            status: true

                        }, {
                            headers: {
                                Authorization: token,
                            }
                        });
                        return response.data;
                    } catch (error) {
                        console.error('Error sending edited comment to server:', error);
                        throw error;
                    }
                };

                const handleOks = async () => {
                    try {
                        const logData = {
                            Account: newaccount,
                            usercommit: userdetails?.email,
                            campaignname: firstColumnValue,
                            comment: comment,
                            campaignid: campaignid,
                            adsetid: adsetid
                        };

                        if (relatedComment) {
                            await sendEditedCommentToAPI(logData);
                            message.success("Comment updated successfully!");
                        } else {
                            await sendNewCommentToAPI(logData);
                            message.success("New comment added successfully!");
                        }

                        const updatedComments = relatedComment
                            ? campaignComments.map(cmt => (cmt.campaignname === firstColumnValue ? { ...cmt, comment } : cmt))
                            : [...campaignComments, logData];
                        setCampaignComments(updatedComments);

                        changeRRefrst();
                        setIsModalVisibles(false);
                    } catch (error) {
                        console.error('Error while submitting comment:', error);
                        message.error("Error while submitting the comment.");
                    }
                };

                const handleCancels = () => {
                    setIsModalVisibles(false);
                };

                const CustomTooltipContent = ({ editedTime, usercommit }) => (
                    <div style={{ padding: '5px', borderRadius: '5px' }}>
                        <p style={{ margin: 0, color: "#ffffff" }}>{usercommit}</p>
                        <p style={{ margin: 0, color: "#ffffff" }}>{editedTime}</p>
                    </div>
                );

                const handlePinClick = async (campaignName, campaignid, adsetid, currentPinStatus) => {
                    const updatedPinStatus = !currentPinStatus;

                    try {
                        let response;
                        if (updatedPinStatus) {
                            response = await axios.post('https://prodapis.adsgoat.in/Pin', {
                                campaignname: campaignName,
                                Account: account,
                                campaignid: campaignid,
                                adsetid: adsetid,
                                userPin: userdetails?.email,
                                comment: comment || ''
                            }, { headers: { Authorization: token } });
                            changeRRefrst();

                            message.success("Campaign pinned!");
                        } else {
                            response = await axios.post('https://prodapis.adsgoat.in/Unpin', {
                                campaignname: campaignName,
                                Account: account,
                                campaignid: campaignid,
                                adsetid: adsetid
                            }, { headers: { Authorization: token } });
                            changeRRefrst();

                            message.success("Campaign unpinned!");
                        }

                        // Update campaignComments with the new pinned status and edited user/time
                        const updatedComments = campaignComments.map(cmt =>
                            cmt.campaignname === campaignName
                                ? {
                                    ...cmt,
                                    pinned: updatedPinStatus,
                                    editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                                    userPin: userdetails?.email
                                }
                                : cmt
                        );

                        if (!campaignComments.some(cmt => cmt.campaignname === campaignName)) {
                            updatedComments.push({
                                campaignname: campaignName,
                                pinned: updatedPinStatus,
                                editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                                userPin: userdetails?.email
                            });
                        }

                        // const updatedComments = campaignComments.some(cmt => cmt.campaignname === campaignName)
                        //     ? campaignComments.map(cmt =>
                        //         cmt.campaignname === campaignName ? { ...cmt, pinned: updatedPinStatus } : cmt
                        //     )
                        //     : [...campaignComments, { campaignname: campaignName, pinned: updatedPinStatus }];

                        const sortedComments = updatedComments.sort((a, b) => b.pinned - a.pinned);
                        setCampaignComments(sortedComments);
                        setPinned(updatedPinStatus);
                    } catch (error) {
                        console.error('Error toggling pin status:', error);
                        message.error('Error while updating pin status.');
                    }
                };

                const PinIcon = ({ campaignName, campaignid, adsetid, pinned }) => {
                    return (
                        <Tooltip title={pinned ? <CustomTooltipContent editedTime={editPinUserANdTime?.editedPinTime} usercommit={editPinUserANdTime?.userPin} /> : null}>
                            <button
                                onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                }}
                            >
                                {pinned ? "📌" : "📍"}
                            </button>
                        </Tooltip>
                    );
                };

                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <PinIcon
                            campaignName={campaignName}
                            campaignid={campaignid}
                            adsetid={adsetid}
                            pinned={pinned}
                        />
                        <div style={{ marginLeft: '10px' }}>
                            {(() => {
                                // Find the matching campaign in the Camapignlevelstatus array
                                const campaignStatus = Camapignlevelstatus.find(statusObj => statusObj.name === campaignName);

                                if (campaignStatus) {
                                    const { status, start, end } = campaignStatus;

                                    // Tooltip content with start and end dates
                                    const tooltipContent = (
                                        <div>
                                            <p style={{ margin: 0 }}>Start: {start || 'N/A'}</p>
                                            <p style={{ margin: 0 }}>End: {end || 'N/A'}</p>
                                        </div>
                                    );

                                    if (status === 'PAUSED') {
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <PauseCircleOutlined style={{ color: 'orange', fontSize: '18px' }} />
                                            </Tooltip>
                                        );
                                    } else if (status === 'ACTIVE') {
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <CheckCircleOutlined style={{ color: 'green', fontSize: '18px' }} />
                                            </Tooltip>
                                        );
                                    } else {
                                        // Default for unknown status
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
                                            </Tooltip>
                                        );
                                    }
                                } else {
                                    // Fallback if no matching campaign is found
                                    return (
                                        <Tooltip title="No campaign data available">
                                            <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
                                        </Tooltip>
                                    );
                                }
                            })()}
                        </div>

                        {/* {relatedStatus === true &&
                            <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
                                <CheckCircleFilled style={{ color: 'green', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
                            </Tooltip>
                        }
                        {relatedStatus === false &&
                            <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
                                <CloseCircleFilled style={{ color: 'red', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
                            </Tooltip>
                        } */}
                        {relatedComment && (
                            <Tooltip title={(
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span>{relatedComment || 'No comment available'}</span>
                                    <EditOutlined onClick={handleEditClick} style={{ marginLeft: '10px', color: 'blue', cursor: 'pointer' }} />
                                </div>
                            )}>
                                <MessageOutlined className='Message' style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px', color: 'blue' }} />
                                <Tooltip title={tooltipText}></Tooltip>
                            </Tooltip>
                        )}
                        {!relatedComment && (
                            <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }} />
                        )}
                        <Tooltip title={tooltipText}>
                            <CopyOutlined
                                onClick={copyToClipboard}
                                style={{ cursor: 'pointer', marginLeft: '8px', color: "#1e1e1f", marginRight: '10px' }}
                            />
                        </Tooltip>
                        <span
                            onClick={() => {
                                const url = `/LiveHistory/LiveCampaignHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                                window.open(url, '_blank');
                            }}
                        >
                            {valueWithCount}
                        </span>
                        <Modal
                            title={firstColumnValue}
                            visible={isModalVisibles}
                            onOk={handleOks}
                            onCancel={handleCancels}
                        >
                            <Input.TextArea
                                placeholder="Enter your comments here"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </Modal>
                    </div>
                );
            }
        }
    };

    const autoGroupColumnDef = {
        headerName: 'CampaignName',
        minWidth: 450,
        pinned: 'left',
        sortable: true, // Enable sorting

        comparator: (campaignA, campaignB) => {
            if (!campaignA) return 1;
            if (!campaignB) return -1;

            // Function to get the 'pinned' status of a campaign
            const getPinStatusForCampaign = (campaignName) => {
                const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                return relatedComment ? relatedComment.pinned : false;
            };

            // Prioritize pinned campaigns first (pinned campaigns should come to the top)
            const isPinnedA = getPinStatusForCampaign(campaignA);
            const isPinnedB = getPinStatusForCampaign(campaignB);

            if (isPinnedA !== isPinnedB) {
                return isPinnedA ? -1 : 1;  // Pinned campaigns should come first
            }

            // If both campaigns have the same pinned status, fallback to alphabetical sorting
            return campaignA.localeCompare(campaignB);
        },

        // comparator: (campaignA, campaignB) => {
        //     if (!campaignA) return 1;
        //     if (!campaignB) return -1;

        //     const getStarredForCampaign = (campaignName) => {
        //         const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
        //         return relatedComment ? relatedComment.starred : false;
        //     };

        //     const isStarredA = getStarredForCampaign(campaignA);
        //     const isStarredB = getStarredForCampaign(campaignB);

        //     if (isStarredA === isStarredB) {
        //         return campaignA.localeCompare(campaignB);
        //     }
        //     return isStarredA ? -1 : 1;
        // },

        cellRendererParams: {
            suppressCount: false,
            innerRenderer: (params) => {
                if (params.node.footer) {
                    return 'Total';
                }

                const firstColumnValue = params.node.key;  // campaign name
                const campaignName = params.node.key;

                let campaignid, adsetid;

                if (params.node.group && params.node.childrenAfterGroup && params.node.childrenAfterGroup.length > 0) {
                    const firstChild = params.node.childrenAfterGroup[0].data;
                    campaignid = firstChild.campaignid;
                    adsetid = firstChild.adsetid;
                } else if (params.data) {
                    campaignid = params.data.campaignid;
                    adsetid = params.data.adsetid;
                } else {
                    console.error('Missing campaignid or adsetid for campaign:', campaignName);
                    return (
                        <div style={{ color: 'red' }}>
                            Error: campaignid or adsetid missing for {campaignName}
                        </div>
                    );
                }
                const getEditedUserAndTime = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    // console.log(relatedStatus, "relatedStatus");
                    const relatedStatusEditedTime = relatedStatus ? relatedStatus : null;
                    // console.log(relatedStatusTrue);
                    return relatedStatusEditedTime;
                }

                const getPinEditedUserAndTime = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    return relatedStatus ? relatedStatus : null;
                };

                const getStatusForCampaign = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    // console.log(relatedStatus, "relatedStatus");
                    const relatedStatusTrue = relatedStatus !== undefined && relatedStatus.status === true ? true : relatedStatus !== undefined ? false : null;
                    // console.log(relatedStatusTrue);
                    return relatedStatusTrue;
                }

                const getCommentForCampaign = (campaignName) => {
                    const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                    return relatedComment ? relatedComment.comment : null;
                };

                // const getStarredForCampaign = (campaignName) => {
                //     const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                //     return relatedComment ? relatedComment.starred : false;
                // };

                const getPinStatusForCampaign = (campaignName) => {
                    const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                    return relatedComment ? relatedComment.pinned : false;
                };

                const editUserANdTime = getEditedUserAndTime(campaignName, newaccount);
                const editPinUserANdTime = getPinEditedUserAndTime(campaignName, newaccount);
                const relatedStatus = getStatusForCampaign(campaignName, newaccount);
                const relatedComment = getCommentForCampaign(campaignName);
                // const isStarred = getStarredForCampaign(campaignName);
                const valueWithCount = `${firstColumnValue}`;

                const [tooltipText, setTooltipText] = useState("Click to Copy");
                const [isModalVisibles, setIsModalVisibles] = useState(false);
                const [comment, setComment] = useState(relatedComment || '');
                // const [starred, setStarred] = useState(isStarred);
                const [pinned, setPinned] = useState(getPinStatusForCampaign(campaignName));

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

                const handleEditClick = () => {
                    setIsModalVisibles(true);
                };

                const sendNewCommentToAPI = async (logData) => {
                    try {
                        const response = await axios.post('https://prodapis.adsgoat.in/Comments', {
                            commentsdatas: logData,
                        }, {
                            headers: {
                                Authorization: token,
                            }
                        });
                        // console.log('Response from server:', response.data);
                    } catch (error) {
                        console.error('Error sending data to server:', error);
                    }
                };

                const sendEditedCommentToAPI = async (logData) => {
                    try {
                        const response = await axios.post('https://prodapis.adsgoat.in/Comments/edit', {
                            campaignname: logData.campaignname,
                            comment: logData.comment,
                            Account: logData.Account,
                            adsetid: logData.adsetid,
                            campaignid: logData.campaignid,
                            status: true
                        }, {
                            headers: {
                                Authorization: token,
                            }
                        });
                        // console.log('Response from server (edited comment):', response.data);
                        return response.data;
                    } catch (error) {
                        console.error('Error sending edited comment to server:', error);
                        throw error;
                    }
                };

                // const sendStarStatusToAPI = async (campaignname, isStarred) => {
                //     try {
                //         const endpoint = isStarred ? 'https://prodapis.adsgoat.in/Star' : 'https://prodapis.adsgoat.in/Unstar';
                //         const response = await axios.post(endpoint, {
                //             campaignname: campaignname,
                //             Account: account,
                //             usercommit: userdetails?.email,
                //             campaignid: campaignid,
                //             adsetid: adsetid
                //         }, {
                //             headers: {
                //                 Authorization: token,
                //             }
                //         });
                //         // console.log('Response from server (starred status):', response.data);
                //     } catch (error) {
                //         console.error('Error updating star status:', error);
                //     }
                // };

                // const handleStarClick = async () => {
                //     const updatedStarred = !starred;
                //     setStarred(updatedStarred);
                //     await sendStarStatusToAPI(firstColumnValue, updatedStarred);
                //     message.success(updatedStarred ? "Campaign starred!" : "Campaign unstarred!");

                //     const updatedComments = campaignComments.map(cmt =>
                //         cmt.campaignname === firstColumnValue ? { ...cmt, starred: updatedStarred } : cmt
                //     );
                //     setCampaignComments(updatedComments);
                //     changeRRefrst();
                // };

                const handleOks = async () => {
                    try {
                        const logData = {
                            Account: newaccount,
                            usercommit: userdetails?.email,
                            campaignname: firstColumnValue,
                            comment: comment,
                            campaignid: campaignid,
                            adsetid: adsetid
                        };

                        if (relatedComment) {
                            await sendEditedCommentToAPI(logData);
                            message.success("Comment updated successfully!");
                        } else {
                            await sendNewCommentToAPI(logData);
                            message.success("New comment added successfully!");
                        }

                        const updatedComments = relatedComment
                            ? campaignComments.map(cmt => (cmt.campaignname === firstColumnValue ? { ...cmt, comment } : cmt))
                            : [...campaignComments, logData];
                        setCampaignComments(updatedComments);

                        changeRRefrst();
                        setIsModalVisibles(false);
                    } catch (error) {
                        console.error('Error while submitting comment:', error);
                        message.error("Error while submitting the comment.");
                    }
                };

                const handleCancels = () => {
                    setIsModalVisibles(false);
                };

                const CustomTooltipContent = ({ editedTime, usercommit }) => (
                    <div style={{ padding: '5px', borderRadius: '5px' }}>
                        <p style={{ margin: 0, color: "#ffffff" }}>{usercommit}</p>
                        <p style={{ margin: 0, color: "#ffffff" }}>{editedTime}</p>
                    </div>
                );

                const handlePinClick = async (campaignName, campaignid, adsetid, currentPinStatus) => {
                    const updatedPinStatus = !currentPinStatus;

                    try {
                        let response;
                        if (updatedPinStatus) {
                            response = await axios.post('https://prodapis.adsgoat.in/Pin', {
                                campaignname: campaignName,
                                Account: account,
                                campaignid: campaignid,
                                adsetid: adsetid,
                                userPin: userdetails?.email,
                                comment: comment || ''
                            }, { headers: { Authorization: token } });
                            changeRRefrst();

                            message.success("Campaign pinned!");
                        } else {
                            response = await axios.post('https://prodapis.adsgoat.in/Unpin', {
                                campaignname: campaignName,
                                Account: account,
                                campaignid: campaignid,
                                adsetid: adsetid
                            }, { headers: { Authorization: token } });
                            changeRRefrst();

                            message.success("Campaign unpinned!");
                        }

                        // Update campaignComments with the new pinned status and edited user/time
                        const updatedComments = campaignComments.map(cmt =>
                            cmt.campaignname === campaignName
                                ? {
                                    ...cmt,
                                    pinned: updatedPinStatus,
                                    editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                                    userPin: userdetails?.email
                                }
                                : cmt
                        );

                        if (!campaignComments.some(cmt => cmt.campaignname === campaignName)) {
                            updatedComments.push({
                                campaignname: campaignName,
                                pinned: updatedPinStatus,
                                editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                                userPin: userdetails?.email
                            });
                        }

                        // const updatedComments = campaignComments.some(cmt => cmt.campaignname === campaignName)
                        //     ? campaignComments.map(cmt =>
                        //         cmt.campaignname === campaignName ? { ...cmt, pinned: updatedPinStatus } : cmt
                        //     )
                        //     : [...campaignComments, { campaignname: campaignName, pinned: updatedPinStatus }];

                        const sortedComments = updatedComments.sort((a, b) => b.pinned - a.pinned);
                        setCampaignComments(sortedComments);
                        setPinned(updatedPinStatus);
                    } catch (error) {
                        console.error('Error toggling pin status:', error);
                        message.error('Error while updating pin status.');
                    }
                };

                const PinIcon = ({ campaignName, campaignid, adsetid, pinned }) => {
                    return (
                        <Tooltip title={pinned ? <CustomTooltipContent editedTime={editPinUserANdTime?.editedPinTime} usercommit={editPinUserANdTime?.userPin} /> : null}>
                            <button
                                onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                }}
                            >
                                {pinned ? "📌" : "📍"}
                            </button>
                        </Tooltip>
                    );
                };

                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <PinIcon
                            campaignName={campaignName}
                            campaignid={campaignid}
                            adsetid={adsetid}
                            // pinned={getPinStatusForCampaign(campaignName)}
                            pinned={pinned}
                        />
                        <div style={{ marginLeft: '10px' }}>
                            {(() => {
                                // Find the matching campaign in the Camapignlevelstatus array
                                const campaignStatus = Camapignlevelstatus.find(statusObj => statusObj.name === campaignName);

                                if (campaignStatus) {
                                    const { status, start, end } = campaignStatus;

                                    // Tooltip content with start and end dates
                                    const tooltipContent = (
                                        <div>
                                            <p style={{ margin: 0 }}>Start: {start || 'N/A'}</p>
                                            <p style={{ margin: 0 }}>End: {end || 'N/A'}</p>
                                        </div>
                                    );

                                    if (status === 'PAUSED') {
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <PauseCircleOutlined style={{ color: 'orange', fontSize: '18px' }} />
                                            </Tooltip>
                                        );
                                    } else if (status === 'ACTIVE') {
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <CheckCircleOutlined style={{ color: 'green', fontSize: '18px' }} />
                                            </Tooltip>
                                        );
                                    } else {
                                        // Default for unknown status
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
                                            </Tooltip>
                                        );
                                    }
                                } else {
                                    // Fallback if no matching campaign is found
                                    return (
                                        <Tooltip title="No campaign data available">
                                            <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
                                        </Tooltip>
                                    );
                                }
                            })()}
                        </div>
                        {/* {relatedStatus === true &&
                            <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
                                <CheckCircleFilled style={{ color: 'green', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
                            </Tooltip>
                        }
                        {relatedStatus === false &&
                            <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
                                <CloseCircleFilled style={{ color: 'red', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
                            </Tooltip>
                        } */}
                        {/* {relatedComment && (
                            starred ? (
                                <StarFilled className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px', color: "gold" }} />
                            ) : (
                                <StarOutlined className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px' }} />
                            )
                        )} */}
                        {relatedComment ? (
                            <Tooltip title={(
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span>{relatedComment || 'No comment available'}</span>
                                    <EditOutlined onClick={handleEditClick} style={{ marginLeft: '10px', color: 'blue', cursor: 'pointer' }} />
                                </div>
                            )}>
                                <MessageOutlined className='Message' style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px', color: 'blue' }} />
                                <Tooltip title={tooltipText}></Tooltip>
                            </Tooltip>
                        ) : (
                            <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }} />
                        )}
                        <Tooltip title={tooltipText}>
                            <CopyOutlined
                                onClick={copyToClipboard}
                                style={{ cursor: 'pointer', marginLeft: '8px', color: "#1e1e1f", marginRight: '10px' }}
                            />
                        </Tooltip>
                        <span
                            onClick={() => {
                                const url = `/DailyAndCampaignHistory/CampaignHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                                window.open(url, '_blank');
                            }}
                        >
                            {valueWithCount}
                        </span>
                        <Modal
                            title={firstColumnValue}
                            visible={isModalVisibles}
                            onOk={handleOks}
                            onCancel={handleCancels}
                        >
                            <Input.TextArea
                                placeholder="Enter your comments here"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </Modal>
                    </div>
                );
            }
        }
    };

    const autoGroupColumnDef2 = {
        headerName: 'CampaignName',
        minWidth: 450,
        pinned: 'left',

        comparator: (campaignA, campaignB) => {
            if (!campaignA) return 1;
            if (!campaignB) return -1;

            // Function to get the 'pinned' status of a campaign
            const getPinStatusForCampaign = (campaignName) => {
                const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                return relatedComment ? relatedComment.pinned : false;
            };

            // Prioritize pinned campaigns first (pinned campaigns should come to the top)
            const isPinnedA = getPinStatusForCampaign(campaignA);
            const isPinnedB = getPinStatusForCampaign(campaignB);

            if (isPinnedA !== isPinnedB) {
                return isPinnedA ? -1 : 1;  // Pinned campaigns should come first
            }

            // If both campaigns have the same pinned status, fallback to alphabetical sorting
            return campaignA.localeCompare(campaignB);
        },

        // comparator: (campaignA, campaignB) => {
        //     if (!campaignA) return 1;
        //     if (!campaignB) return -1;

        //     // Function to get the 'pinned' status of a campaign
        //     const getPinStatusForCampaign = (campaignName) => {
        //         const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
        //         return relatedComment ? relatedComment.pinned : false;
        //     };

        //     // Prioritize pinned campaigns first (pinned campaigns should come to the top)
        //     const isPinnedA = getPinStatusForCampaign(campaignA);
        //     const isPinnedB = getPinStatusForCampaign(campaignB);

        //     if (isPinnedA !== isPinnedB) {
        //         return isPinnedA ? -1 : 1;  // Pinned campaigns should come first
        //     }

        //     // If both campaigns have the same pinned status, fall back to other sorting logic

        //     // For example: Prioritize by starred status
        //     const getStarredForCampaign = (campaignName) => {
        //         const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
        //         return relatedComment ? relatedComment.starred : false;
        //     };

        //     const isStarredA = getStarredForCampaign(campaignA);
        //     const isStarredB = getStarredForCampaign(campaignB);

        //     if (isStarredA !== isStarredB) {
        //         return isStarredA ? -1 : 1;  // Starred campaigns should come first
        //     }

        //     // Finally, fallback to alphabetical sorting if no pinned or starred criteria
        //     return campaignA.localeCompare(campaignB);
        // },

        cellRendererParams: {
            suppressCount: false, // Allow count to be shown
            innerRenderer: (params) => {
                if (params.node.footer) {
                    return 'Total'; // Custom footer label
                }

                const firstColumnValue = params.node.key; // This should give you the campaign name
                const campaignName = params.node.key;

                let campaignid, adsetid;

                if (params.node.group && params.node.childrenAfterGroup && params.node.childrenAfterGroup.length > 0) {
                    const firstChild = params.node.childrenAfterGroup[0].data;
                    campaignid = firstChild.campaignid;
                    adsetid = firstChild.adsetid;
                } else if (params.data) {
                    campaignid = params.data.campaignid;
                    adsetid = params.data.adsetid;
                } else {
                    console.error('Missing campaignid or adsetid for campaign:', campaignName);
                    return (
                        <div style={{ color: 'red' }}>
                            Error: campaignid or adsetid missing for {campaignName}
                        </div>
                    );
                } const getEditedUserAndTime = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    // console.log(relatedStatus, "relatedStatus");
                    const relatedStatusEditedTime = relatedStatus ? relatedStatus : null;
                    // console.log(relatedStatusTrue);
                    return relatedStatusEditedTime;
                }

                const getPinEditedUserAndTime = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    return relatedStatus ? relatedStatus : null;
                };

                const getStatusForCampaign = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    // console.log(relatedStatus, "relatedStatus");
                    const relatedStatusTrue = relatedStatus !== undefined && relatedStatus.status === true ? true : relatedStatus !== undefined ? false : null;
                    // console.log(relatedStatusTrue);
                    return relatedStatusTrue;
                }

                const getCommentForCampaign = (campaignName) => {
                    const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                    return relatedComment ? relatedComment.comment : null;
                };

                // const getStarredForCampaign = (campaignName) => {
                //     const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                //     return relatedComment ? relatedComment.starred : false;
                // };

                const getPinStatusForCampaign = (campaignName) => {
                    const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                    return relatedComment ? relatedComment.pinned : false;
                };

                const editUserANdTime = getEditedUserAndTime(campaignName, newaccount);
                const editPinUserANdTime = getPinEditedUserAndTime(campaignName, newaccount);
                const relatedStatus = getStatusForCampaign(campaignName, newaccount);
                const relatedComment = getCommentForCampaign(campaignName);
                // const isStarred = getStarredForCampaign(campaignName);
                const valueWithCount = `${firstColumnValue}`;

                const [tooltipText, setTooltipText] = useState("Click to Copy");
                const [isModalVisible, setIsModalVisible] = useState(false);
                const [comment, setComment] = useState(relatedComment || '');
                // const [starred, setStarred] = useState(isStarred);
                const [pinned, setPinned] = useState(getPinStatusForCampaign(campaignName));

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

                const handleEditClick = () => {
                    setIsModalVisible(true);
                };

                const sendNewCommentToAPI = async (logData) => {
                    try {
                        const response = await axios.post('https://prodapis.adsgoat.in/Comments', {
                            commentsdatas: logData,
                        }, {
                            headers: {
                                Authorization: token,
                            }
                        });
                        console.log('Response from server:', response.data);
                    } catch (error) {
                        console.error('Error sending data to server:', error);
                    }
                };

                const sendEditedCommentToAPI = async (logData) => {
                    try {
                        const response = await axios.post('https://prodapis.adsgoat.in/Comments/edit', {
                            campaignname: logData.campaignname,
                            comment: logData.comment,
                            Account: logData.Account,
                            adsetid: logData.adsetid,
                            campaignid: logData.campaignid,
                            status: true
                        }, {
                            headers: {
                                Authorization: token,
                            }
                        });
                        console.log('Response from server (edited comment):', response.data);
                        return response.data;
                    } catch (error) {
                        console.error('Error sending edited comment to server:', error);
                        throw error;
                    }
                };

                // const sendStarStatusToAPI = async (campaignname, isStarred) => {
                //     try {
                //         const endpoint = isStarred ? 'https://prodapis.adsgoat.in/Star' : 'https://prodapis.adsgoat.in/Unstar';
                //         const response = await axios.post(endpoint, {
                //             campaignname: campaignname,
                //             Account: account,
                //             usercommit: userdetails?.email,
                //             campaignid: campaignid,
                //             adsetid: adsetid
                //         }, {
                //             headers: {
                //                 Authorization: token,
                //             }
                //         });
                //         console.log('Response from server (starred status):', response.data);
                //     } catch (error) {
                //         console.error('Error updating star status:', error);
                //     }
                // };

                // const handleStarClick = async () => {
                //     const updatedStarred = !starred;
                //     setStarred(updatedStarred);
                //     await sendStarStatusToAPI(firstColumnValue, updatedStarred);
                //     message.success(updatedStarred ? "Campaign starred!" : "Campaign unstarred!");

                //     const updatedComments = campaignComments.map(cmt =>
                //         cmt.campaignname === firstColumnValue ? { ...cmt, starred: updatedStarred } : cmt
                //     );
                //     setCampaignComments(updatedComments);
                //     changeRRefrst();
                // };

                const handleOk = async () => {
                    const logData = {
                        Account: account,
                        usercommit: userdetails?.email,
                        campaignname: firstColumnValue,
                        comment: comment,
                        campaignid: campaignid,
                        adsetid: adsetid
                    };

                    if (relatedComment) {
                        await sendEditedCommentToAPI(logData);
                        message.success("Comment updated successfully!");
                    } else {
                        await sendNewCommentToAPI(logData);
                        message.success("New comment added successfully!");
                    }

                    const updatedComments = relatedComment
                        ? campaignComments.map(cmt => (cmt.campaignname === firstColumnValue ? { ...cmt, comment } : cmt))
                        : [...campaignComments, logData];
                    setCampaignComments(updatedComments);

                    changeRRefrst();
                    setIsModalVisible(false);
                };

                const handleCancel = () => {
                    setIsModalVisible(false);
                };

                const CustomTooltipContent = ({ editedTime, usercommit }) => (
                    <div style={{ padding: '5px', borderRadius: '5px' }}>
                        <p style={{ margin: 0, color: "#ffffff" }}>{usercommit}</p>
                        <p style={{ margin: 0, color: "#ffffff" }}>{editedTime}</p>
                    </div>
                );

                const handlePinClick = async (campaignName, campaignid, adsetid, currentPinStatus) => {
                    const updatedPinStatus = !currentPinStatus;

                    try {
                        let response;
                        if (updatedPinStatus) {
                            response = await axios.post('https://prodapis.adsgoat.in/Pin', {
                                campaignname: campaignName,
                                Account: account,
                                campaignid: campaignid,
                                adsetid: adsetid,
                                userPin: userdetails?.email,
                                comment: comment || ''
                            }, { headers: { Authorization: token } });
                            changeRRefrst();

                            message.success("Campaign pinned!");
                        } else {
                            response = await axios.post('https://prodapis.adsgoat.in/Unpin', {
                                campaignname: campaignName,
                                Account: account,
                                campaignid: campaignid,
                                adsetid: adsetid
                            }, { headers: { Authorization: token } });
                            changeRRefrst();

                            message.success("Campaign unpinned!");
                        }

                        // Update campaignComments with the new pinned status and edited user/time
                        const updatedComments = campaignComments.map(cmt =>
                            cmt.campaignname === campaignName
                                ? {
                                    ...cmt,
                                    pinned: updatedPinStatus,
                                    editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                                    userPin: userdetails?.email
                                }
                                : cmt
                        );

                        if (!campaignComments.some(cmt => cmt.campaignname === campaignName)) {
                            updatedComments.push({
                                campaignname: campaignName,
                                pinned: updatedPinStatus,
                                editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                                userPin: userdetails?.email
                            });
                        }

                        // const updatedComments = campaignComments.some(cmt => cmt.campaignname === campaignName)
                        //     ? campaignComments.map(cmt =>
                        //         cmt.campaignname === campaignName ? { ...cmt, pinned: updatedPinStatus } : cmt
                        //     )
                        //     : [...campaignComments, { campaignname: campaignName, pinned: updatedPinStatus }];

                        const sortedComments = updatedComments.sort((a, b) => b.pinned - a.pinned);
                        setCampaignComments(sortedComments);
                        setPinned(updatedPinStatus);
                    } catch (error) {
                        console.error('Error toggling pin status:', error);
                        message.error('Error while updating pin status.');
                    }
                };

                const PinIcon = ({ campaignName, campaignid, adsetid, pinned }) => {
                    return (
                        <Tooltip title={pinned ? <CustomTooltipContent editedTime={editPinUserANdTime?.editedPinTime} usercommit={editPinUserANdTime?.userPin} /> : null}>
                            <button
                                onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                }}
                            >
                                {pinned ? "📌" : "📍"}
                            </button>
                        </Tooltip>
                    );
                };

                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <PinIcon
                            campaignName={campaignName}
                            campaignid={campaignid}
                            adsetid={adsetid}
                            // pinned={getPinStatusForCampaign(campaignName)}
                            pinned={pinned}
                        />
                        <div style={{ marginLeft: '10px' }}>
                            {(() => {
                                // Find the matching campaign in the Camapignlevelstatus array
                                const campaignStatus = Camapignlevelstatus.find(statusObj => statusObj.name === campaignName);

                                if (campaignStatus) {
                                    const { status, start, end } = campaignStatus;

                                    // Tooltip content with start and end dates
                                    const tooltipContent = (
                                        <div>
                                            <p style={{ margin: 0 }}>Start: {start || 'N/A'}</p>
                                            <p style={{ margin: 0 }}>End: {end || 'N/A'}</p>
                                        </div>
                                    );

                                    if (status === 'PAUSED') {
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <PauseCircleOutlined style={{ color: 'orange', fontSize: '18px' }} />
                                            </Tooltip>
                                        );
                                    } else if (status === 'ACTIVE') {
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <CheckCircleOutlined style={{ color: 'green', fontSize: '18px' }} />
                                            </Tooltip>
                                        );
                                    } else {
                                        // Default for unknown status
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
                                            </Tooltip>
                                        );
                                    }
                                } else {
                                    // Fallback if no matching campaign is found
                                    return (
                                        <Tooltip title="No campaign data available">
                                            <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
                                        </Tooltip>
                                    );
                                }
                            })()}
                        </div>
                        {/* {relatedStatus === true &&
                            <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
                                <CheckCircleFilled style={{ color: 'green', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
                            </Tooltip>
                        }
                        {relatedStatus === false &&
                            <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
                                <CloseCircleFilled style={{ color: 'red', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
                            </Tooltip>
                        } */}
                        {/* {relatedComment && (
                            starred ? (
                                <StarFilled className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px', color: 'gold' }} />
                            ) : (
                                <StarOutlined className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px' }} />
                            )
                        )} */}
                        {relatedComment ? (
                            <Tooltip title={(
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span>{relatedComment || 'No comment available'}</span>
                                    <EditOutlined onClick={handleEditClick} style={{ marginLeft: '10px', color: 'blue', cursor: 'pointer' }} />
                                </div>
                            )}>
                                <MessageOutlined className='Message' style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px', color: 'blue' }} />
                                <Tooltip title={tooltipText}></Tooltip>
                            </Tooltip>
                        ) : (
                            <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }} />
                        )}
                        <Tooltip title={tooltipText}>
                            <CopyOutlined
                                onClick={copyToClipboard}
                                style={{ cursor: 'pointer', marginLeft: '8px', color: "#1e1e1f", marginRight: '10px' }}
                            />
                        </Tooltip>
                        <span
                            onClick={() => {
                                const url = `/AllCampaigns/CampaignHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                                window.open(url, '_blank');
                            }}
                        >
                            {valueWithCount}
                        </span>
                        <Modal
                            title={firstColumnValue}
                            visible={isModalVisible}
                            onOk={handleOk}
                            onCancel={handleCancel}
                        >
                            <Input.TextArea
                                placeholder="Enter your comments here"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </Modal>
                    </div>
                );
            }
        }
    };


    const autoGroupColumnDef3 = {
        headerName: 'CampaignName',
        minWidth: 450,
        pinned: 'left',
        sortable: true, // Enable sorting

        comparator: (campaignA, campaignB) => {
            if (!campaignA) return 1;
            if (!campaignB) return -1;

            const getStarredForCampaign = (campaignName) => {
                const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                return relatedComment ? relatedComment.starred : false;
            };

            const isStarredA = getStarredForCampaign(campaignA);
            const isStarredB = getStarredForCampaign(campaignB);

            if (isStarredA === isStarredB) {
                return campaignA.localeCompare(campaignB);
            }
            return isStarredA ? -1 : 1;
        },

        cellRendererParams: {
            suppressCount: false,
            innerRenderer: (params) => {
                if (params.node.footer) {
                    return 'Total';
                }

                const firstColumnValue = params.node.key;  // campaign name
                const campaignName = params.node.key;

                let campaignid, adsetid;

                if (params.node.group && params.node.childrenAfterGroup && params.node.childrenAfterGroup.length > 0) {
                    const firstChild = params.node.childrenAfterGroup[0].data;
                    campaignid = firstChild.campaignid;
                    adsetid = firstChild.adsetid;
                } else if (params.data) {
                    campaignid = params.data.campaignid;
                    adsetid = params.data.adsetid;
                } else {
                    console.error('Missing campaignid or adsetid for campaign:', campaignName);
                    return (
                        <div style={{ color: 'red' }}>
                            Error: campaignid or adsetid missing for {campaignName}
                        </div>
                    );
                }
                const getEditedUserAndTime = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    // console.log(relatedStatus, "relatedStatus");
                    const relatedStatusEditedTime = relatedStatus ? relatedStatus : null;
                    // console.log(relatedStatusTrue);
                    return relatedStatusEditedTime;
                }
                const getStatusForCampaign = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
                    // console.log(relatedStatus, "relatedStatus");
                    const relatedStatusTrue = relatedStatus !== undefined && relatedStatus.status === true ? true : relatedStatus !== undefined ? false : null;
                    // console.log(relatedStatusTrue);
                    return relatedStatusTrue;
                }

                const getCommentForCampaign = (campaignName) => {
                    const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                    return relatedComment ? relatedComment.comment : null;
                };

                const getStarredForCampaign = (campaignName) => {
                    const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                    return relatedComment ? relatedComment.starred : false;
                };
                const editUserANdTime = getEditedUserAndTime(campaignName, newaccount);
                const relatedStatus = getStatusForCampaign(campaignName, newaccount);
                const relatedComment = getCommentForCampaign(campaignName);
                const isStarred = getStarredForCampaign(campaignName);
                const valueWithCount = `${firstColumnValue}`;

                const [tooltipText, setTooltipText] = useState("Click to Copy");
                const [isModalVisibles, setIsModalVisibles] = useState(false);
                const [comment, setComment] = useState(relatedComment || '');
                const [starred, setStarred] = useState(isStarred);

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

                const handleEditClick = () => {
                    setIsModalVisibles(true);
                };

                const sendNewCommentToAPI = async (logData) => {
                    try {
                        const response = await axios.post('https://prodapis.adsgoat.in/Comments', {
                            commentsdatas: logData,
                        }, {
                            headers: {
                                Authorization: token,
                            }
                        });
                        console.log('Response from server:', response.data);
                    } catch (error) {
                        console.error('Error sending data to server:', error);
                    }
                };

                const sendEditedCommentToAPI = async (logData) => {
                    try {
                        const response = await axios.post('https://prodapis.adsgoat.in/Comments/edit', {
                            campaignname: logData.campaignname,
                            comment: logData.comment,
                            Account: logData.Account,
                            adsetid: logData.adsetid,
                            campaignid: logData.campaignid,
                            status: true
                        }, {
                            headers: {
                                Authorization: token,
                            }
                        });
                        console.log('Response from server (edited comment):', response.data);
                        return response.data;
                    } catch (error) {
                        console.error('Error sending edited comment to server:', error);
                        throw error;
                    }
                };

                const sendStarStatusToAPI = async (campaignname, isStarred) => {
                    try {
                        const endpoint = isStarred ? 'https://prodapis.adsgoat.in/Star' : 'https://prodapis.adsgoat.in/Unstar';
                        const response = await axios.post(endpoint, {
                            campaignname: campaignname,
                            Account: account,
                            usercommit: userdetails?.email,
                            campaignid: campaignid,
                            adsetid: adsetid
                        }, {
                            headers: {
                                Authorization: token,
                            }
                        });
                        console.log('Response from server (starred status):', response.data);
                    } catch (error) {
                        console.error('Error updating star status:', error);
                    }
                };

                const handleStarClick = async () => {
                    const updatedStarred = !starred;
                    setStarred(updatedStarred);
                    await sendStarStatusToAPI(firstColumnValue, updatedStarred);
                    message.success(updatedStarred ? "Campaign starred!" : "Campaign unstarred!");

                    const updatedComments = campaignComments.map(cmt =>
                        cmt.campaignname === firstColumnValue ? { ...cmt, starred: updatedStarred } : cmt
                    );
                    setCampaignComments(updatedComments);
                    changeRRefrst();
                };

                const handleOks = async () => {
                    try {
                        const logData = {
                            Account: newaccount,
                            usercommit: userdetails?.email,
                            campaignname: firstColumnValue,
                            comment: comment,
                            campaignid: campaignid,
                            adsetid: adsetid
                        };

                        if (relatedComment) {
                            await sendEditedCommentToAPI(logData);
                            message.success("Comment updated successfully!");
                        } else {
                            await sendNewCommentToAPI(logData);
                            message.success("New comment added successfully!");
                        }

                        const updatedComments = relatedComment
                            ? campaignComments.map(cmt => (cmt.campaignname === firstColumnValue ? { ...cmt, comment } : cmt))
                            : [...campaignComments, logData];
                        setCampaignComments(updatedComments);

                        changeRRefrst();
                        setIsModalVisibles(false);
                    } catch (error) {
                        console.error('Error while submitting comment:', error);
                        message.error("Error while submitting the comment.");
                    }
                };

                const handleCancels = () => {
                    setIsModalVisibles(false);
                };

                const CustomTooltipContent = ({ editedTime, usercommit }) => (
                    <div style={{ padding: '5px', borderRadius: '5px' }}>
                        <p style={{ margin: 0, color: "#ffffff" }}>{usercommit}</p>
                        <p style={{ margin: 0, color: "#ffffff" }}>{editedTime}</p>
                    </div>
                );

                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ marginLeft: '10px' }}>
                            {(() => {
                                // Find the matching campaign in the Camapignlevelstatus array
                                const campaignStatus = Camapignlevelstatus.find(statusObj => statusObj.name === campaignName);

                                if (campaignStatus) {
                                    const { status, start, end } = campaignStatus;

                                    // Tooltip content with start and end dates
                                    const tooltipContent = (
                                        <div>
                                            <p style={{ margin: 0 }}>Start: {start || 'N/A'}</p>
                                            <p style={{ margin: 0 }}>End: {end || 'N/A'}</p>
                                        </div>
                                    );

                                    if (status === 'PAUSED') {
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <PauseCircleOutlined style={{ color: 'orange', fontSize: '18px' }} />
                                            </Tooltip>
                                        );
                                    } else if (status === 'ACTIVE') {
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <CheckCircleOutlined style={{ color: 'green', fontSize: '18px' }} />
                                            </Tooltip>
                                        );
                                    } else {
                                        // Default for unknown status
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
                                            </Tooltip>
                                        );
                                    }
                                } else {
                                    // Fallback if no matching campaign is found
                                    return (
                                        <Tooltip title="No campaign data available">
                                            <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
                                        </Tooltip>
                                    );
                                }
                            })()}
                        </div>
                        {/* {relatedStatus === true &&
                            <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
                                <CheckCircleFilled style={{ color: 'green', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
                            </Tooltip>
                        }
                        {relatedStatus === false &&
                            <Tooltip title={<CustomTooltipContent editedTime={editUserANdTime.editedTime} usercommit={editUserANdTime.usercommit} />}>
                                <CloseCircleFilled style={{ color: 'red', fontSize: '15px', marginRight: relatedComment ? "10px" : '0px' }} />
                            </Tooltip>
                        } */}
                        {relatedComment && (
                            starred ? (
                                <StarFilled className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px', color: "gold" }} />
                            ) : (
                                <StarOutlined className='startview' onClick={handleStarClick} style={{ cursor: 'pointer', marginRight: '10px' }} />
                            )
                        )}
                        {relatedComment ? (
                            <Tooltip title={(
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span>{relatedComment || 'No comment available'}</span>
                                    <EditOutlined onClick={handleEditClick} style={{ marginLeft: '10px', color: 'blue', cursor: 'pointer' }} />
                                </div>
                            )}>
                                <MessageOutlined className='Message' style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px', color: 'blue' }} />
                                <Tooltip title={tooltipText}></Tooltip>
                            </Tooltip>
                        ) : (
                            <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }} />
                        )}
                        <Tooltip title={tooltipText}>
                            <CopyOutlined
                                onClick={copyToClipboard}
                                style={{ cursor: 'pointer', marginLeft: '8px', color: "#1e1e1f", marginRight: '10px' }}
                            />
                        </Tooltip>
                        <span
                            onClick={() => {
                                const url = `/DailyAndCampaignHistory/CampaignHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                                window.open(url, '_blank');
                            }}
                        >
                            {valueWithCount}
                        </span>
                        <Modal
                            title={firstColumnValue}
                            visible={isModalVisibles}
                            onOk={handleOks}
                            onCancel={handleCancels}
                        >
                            <Input.TextArea
                                placeholder="Enter your comments here"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </Modal>
                    </div>
                );
            }
        }
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
        // console.log('Column moved in grid:', gridId);
        const fieldOrder = columnState.map(col => col.colId);
        const newFieldOrder = fieldOrder.filter(item => item !== 'ag-Grid-AutoColumn-campaignname' && item !== 'ag-Grid-AutoColumn' && columnStructure.includes(item));
        localStorage.setItem('columnState', JSON.stringify(newFieldOrder));
        updatingColumnsStructure(newFieldOrder);
        // console.log(`Updating columns structure for grid: ${gridId}`);
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
            suppressMenu: true,
            headerClass: "custom-header" // Apply to all columns by default

        }
    };

    const gridOptions1 = {
        onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid2'),
        defaultColDef: {
            suppressMenu: true,
            headerClass: "custom-header" // Apply to all columns by default

        }
    };

    const gridOptions2 = {
        onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid3'),
        defaultColDef: {
            suppressMenu: true,
            headerClass: "custom-header" // Apply to all columns by default

        }
    };

    const gridOptions3 = {
        onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid4'),
        defaultColDef: {
            suppressMenu: true,
            headerClass: "custom-header" // Apply to all columns by default

        }
    };

    const gridOptions5 = {
        onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid5'),
        defaultColDef: {
            suppressMenu: true,
            headerClass: "custom-header" // Apply to all columns by default

        }
    };

    // const gridOptions4 = {
    //     onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid5'),
    //     defaultColDef: {
    //         suppressMenu: true,
    //         headerClass: "custom-header" // Apply to all columns by default

    //     }
    // };

    const gridOptions4 = {
        groupUseEntireRow: true,  // Ensure the entire row is used for grouping
        groupSuppressAutoColumn: true, // Hide the auto group column
    };

    // console.log(columnDefs);
    // console.log(columnDefs1);
    // console.log(columnDefs2);



    const defaultDates = [dayjs(startDateFromDashboard ? startDateFromDashboard : yesterday), dayjs(endDateFromDashboard ? endDateFromDashboard : yesterday)];

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
        // console.log(`Clicked page: ${page}, Page size: ${pageSize}`);
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

    // console.log(rowData, "rowData");
    // console.log(dailyData, "dailyData");
    // console.log(campaignData, "campaignData");
    // console.log(keywordData, "KeywordData");

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


    const refreshGrid3 = (gridRef3) => {
        setLoading1(true);
        if (gridRef3.current) {
            const gridApi = gridRef3.current.api;

            // Clear filters
            gridApi.setFilterModel(null);

            // Clear sorting by resetting the row data state
            setKeywordData([]); // Temporarily clear the data
            setTimeout(() => setKeywordData(newDailyData.current), 0); // Reset the data
            setTimeout(() => setLoading1(false), 1500);
            // Force refresh the grid cells and redraw the rows
            gridApi.refreshCells({ force: true });
            gridApi.redrawRows();
        } else {
            console.error('Grid reference is not available.');
        }
    };

    const refreshGrid4 = (gridRef4) => {
        setLoading4(true);
        if (gridRef4.current) {
            const gridApi = gridRef4.current.api;

            // Clear filters
            gridApi.setFilterModel(null);

            // Temporarily clear the data and reset after a timeout
            setSystem1KeywordData([]); // Temporarily clear the data
            setTimeout(() => setSystem1KeywordData(newDailyData.current), 0); // Reset the data
            setTimeout(() => setLoading4(false), 1500); // Stop loading after timeout

            // Force refresh the grid cells and redraw the rows
            gridApi.refreshCells({ force: true });
            gridApi.redrawRows();
        } else {
            console.error('Grid reference is not available.');
        }
    };

    const refreshGrid5 = (gridRef5) => {
        setTonicKeywordLoading(true);
        if (gridRef5.current) {
            const gridApi = gridRef5.current.api;
    
            // Clear filters
            gridApi.setFilterModel(null);
    
            // Temporarily clear the data and reset after a timeout
            setTonicKeywordData([]); // Temporarily clear the data
            setTimeout(() => setTonicKeywordData(newTonicKeywordData.current), 0); // Reset the data
            setTimeout(() => setTonicKeywordLoading(false), 1500); // Stop loading after timeout
    
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
        refreshGrid3(gridRef3); // Refresh gridRef3
        refreshGrid4(gridRef4);
        refreshGrid5(gridRef5);
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

    // console.log(revenuePratner);
    // console.log(time);

    const [isOpen, setIsOpen] = useState(false); // State to track if dropdown is open
    const [selectedValue, setSelectedValue] = useState(
        typeof networksData[0] === 'string' ? networksData[0] : networksData[0].accountNumber
    ); // Track selected value

    // Handle dropdown open/close state
    const handleDropdownVisibleChange = (open) => {
        setIsOpen(open); // Set dropdown open state
        setAccountNumberToPass(null);
    };

    // Handle option selection
    const handleChange1 = (value) => {
        const findAccount = (data, accountNumber) =>
            Object.values(data).flat().find(item => item.accountNumber === accountNumber) || null;

        const accountNameForAccount = findAccount(userdetails?.adAccounts, value);
        setAccountName(accountNameForAccount.accountName)
        setSelectedValue(value); // Update selected value
        onChangeSelect(value); // Call onChangeSelect function
    };

    // Create option with conditional rendering of additional info
    const createOption = (account) => {
        if (typeof account === 'string') {
            return {
                value: account,
                label: account, // If account is just a string, display it directly
            };
        } else {
            return {
                value: account.accountNumber,
                label: (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        padding: '5px 0',
                        height: 'auto',  // Adjust height to prevent layout issues
                        overflow: 'hidden'  // Prevent overflow issues
                    }}>
                        {/* Left Section: Account Details */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            maxWidth: '70%'
                        }}>
                            {/* Always show accountNumber */}
                            <p style={{
                                margin: '0px',
                                padding: '0px',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {account.accountNumber}
                            </p>
                            {/* Show "Additional Info" ONLY if the dropdown is open */}
                            {isOpen && (
                                <p style={{
                                    margin: '0px',
                                    padding: '0px',
                                    fontSize: '12px',
                                    color: 'gray',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {account.accountName ? account.accountName : ''}
                                </p>
                            )}
                        </div>
                        {/* Right Section: Status Icon */}
                        <span style={{ marginLeft: '10px', flexShrink: 0 }}>
                            {account.status === "Active" ? (
                                <CheckCircleFilled style={{ color: 'green', fontSize: '15px' }} />
                            ) : (
                                <CloseCircleFilled style={{ color: 'red', fontSize: '15px' }} />
                            )}
                        </span>
                    </div>
                ),
                text: account.accountNumber, // For sorting/filtering purposes
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


    const pinnedBottomRowData3 = [
        {
            campaignName: 'Total',
            spend: parseFloat(keywordData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
            revenue: parseFloat(keywordData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
            profit: parseFloat(keywordData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
            margin: parseFloat((keywordData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / keywordData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
            rpc: parseFloat((keywordData.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / keywordData.length).toFixed(2)),
            cpl: parseFloat((keywordData.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / keywordData.length).toFixed(2)),
            ncpl: parseFloat((keywordData.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / keywordData.length).toFixed(2)),
            fbleads: parseFloat(keywordData.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
            conversions: parseFloat(keywordData.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
            fmargin: parseFloat((keywordData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / keywordData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
            roi: parseFloat(((keywordData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - keywordData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / keywordData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
            cpc: parseFloat((keywordData.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / keywordData.length).toFixed(2)),
            fbclicks: parseFloat(keywordData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
            impressions: parseFloat(keywordData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
            ctr: parseFloat((keywordData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / keywordData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
        }
    ];

    const pinnedBottomRowData4 = [
        {
            searches: parseFloat(system1KeywordData.reduce((acc, curr) => acc + parseFloat(curr.searches), 0).toFixed(2)),
            clicks: parseFloat(system1KeywordData.reduce((acc, curr) => acc + parseFloat(curr.clicks), 0).toFixed(2)),
            revenue: parseFloat(system1KeywordData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
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


    // console.log(dailyData, "Daily");


    const items = [
        { key: '1', label: 'Live', content: 'Content for Live data' },
        { key: '2', label: 'Daily', content: 'Content for Daily data' },
        { key: '3', label: 'Campaigns', content: 'Content for Campaign data' },
        { key: '4', label: 'BMName', content: 'Content for BMName data' },
        ...(newRevenuePratner === "FB_Mnet" ? [{ key: '5', label: 'Domain', content: 'Content for Domain data' }] : []),
        ...(newRevenuePratner === "FB_DomainActive" ? [{ key: '5', label: 'Keywords', content: 'Content for Keyword data' }] : []),
        ...(newRevenuePratner === "FB_System1" ? [{ key: '5', label: 'Domain', content: 'Content for Domain data' }] : []),
        ...(newRevenuePratner === "FB_Tonic1" ? [{ key: '5', label: 'Keywords', content: 'Content for Keyword data' }] : []),
    ];
    const handleSlideChange = (from, to) => {
        // console.log(to, "to");
        setActiveTab((parseInt(to) + 1).toString());
        // console.log((parseInt(to)+1).toString());
    };

    const handleCarouselChange = (index) => {
        setActiveTab(index);
        // console.log(index);
        // console.log(parseInt(index)-1);
        carouselRef.current.goTo(parseInt(index) - 1)
        if (index == 5 && revenuePratner === "FB_DomainActive") {
            // console.log("hello praveen");
            setIsKeywordsTabActive("keyword");
        } else if (index === 5 && newRevenuePratner === "FB_System1") {
            setIsSystem1KeywordsTabActive('Domain')
        }
    };

    const renderCarouselNav = () => (
        <StickyBox offsetTop={64} offsetBottom={20} style={{ zIndex: 1, padding: '0px', margin: '0px', paddingLeft: '12px' }}>
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


    // console.log(networksData[0])
    // console.log(accountNumberFromDashboard);

    // console.log(activeTab);

    const sanitizedInput = inputValue.replace(/_/g, '\\_');

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
                            style={{
                                width: '100%',
                                backgroundColor: theme === 'dark' && '#333', // Background color
                                color: theme === 'dark' && '#fff',
                            }}
                            placeholder="Select Network"

                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            optionFilterProp="label"
                            defaultValue={networkFromDashboard ? networkFromDashboard : networks[0]}
                            options={networks.map((item) => ({
                                value: item,
                                label: item,
                            }))}
                        />
                    </Col>

                    <Col xs={24} sm={12} md={4} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                        <Select
                            showSearch
                            onChange={handleChange1} // Handle value selection
                            dropdownClassName={theme === 'dark' ? "custom-dropdown" : ''} // Apply dark theme if needed
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            style={{
                                width: '100%',
                                maxWidth: '100%',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }} // Prevent overflow with ellipsis
                            placeholder="Select Account"
                            optionFilterProp="value"
                            value={accountNumberToPass ? accountNumberToPass : selectedValue}  // Set selected value
                            defaultValue={accountNumberFromDashboard ? accountNumberFromDashboard : networksData[0].accountNumber}//typeof networksData[0] === 'string' ? networksData[0] : 
                            // defaultValue={
                            //     accountNumberFromDashboard && accountNumberFromDashboard !== '' 
                            //         ? accountNumberFromDashboard 
                            //         : networksData[0]?.accountNumber // Fallback to networksData[0].accountNumber
                            // }
                            options={accountsAccess.map((item) => createOption(item))} // Create options dynamically
                            onDropdownVisibleChange={handleDropdownVisibleChange} // Toggle dropdown state
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
                                    backgroundColor: theme === 'dark' ? '#555' : undefined,
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
                            className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                            placeholder="Select Timezone"
                            dropdownClassName={theme === 'dark' && "custom-dropdown"}
                            optionFilterProp="label"
                            value={time}
                            options={timezones.map((item) => ({
                                value: item,
                                label: item,
                            }))}
                        // style={{
                        //     width: '100%'
                        // }}
                        />
                    </Col>

                    <Col xs={24} sm={12} md={2}>
                        <Button className='submit-button' type='primary' style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black', fontWeight: '600' }} onClick={onClickButton} block>
                            Submit
                        </Button>
                    </Col>
                    <Col xs={24} sm={24} md={15} lg={5}>
                        <Tooltip title="Refresh and Search">
                            <Button
                                type="primary"
                                shape="circle"
                                style={{ backgroundColor: '#C7F39A', border: 'solid 1px #C7F39A', color: 'black', fontWeight: '600', float: 'inline-end' }}
                                icon={<SubnodeOutlined />}
                                onClick={handleSearchClick} // Toggle search bar visibility on button click
                            />
                        </Tooltip>
                    </Col>
                </Row>
            </Space>
            <div style={{ padding: '0px', margin: '0px' }}>
                {renderCarouselNav()}
            </div>
            <div>
                <div className={`secondRow ${isSecondRowVisible ? '' : 'hidden'}`}>
                    <Row style={{ padding: '10px', paddingRight: '30px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                            <Text style={{ fontWeight: '600', display: 'flex', justifyContent: 'flex-end' }}>
                                FbAcc Status: {`${fbCron.current}`}
                            </Text>
                        </Col>
                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                            <Text style={{ fontWeight: '600', display: 'flex', justifyContent: 'flex-end', marginRight: '20%' }}>
                                RevAcc Status: {`${revenueCron.current}`}
                            </Text>
                        </Col>
                        <Col style={{ marginRight: '15px' }}>
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
                                    <Button style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<SearchOutlined />} />
                                </Col>
                            </Row>
                        </Col>
                        <Col>
                            <Tooltip title="Click to Refresh Tables">
                                <Button type="primary" style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<ReloadOutlined />} onClick={onClickRefresh} />
                            </Tooltip>
                        </Col>
                    </Row>
                </div>

                <Carousel ref={carouselRef} beforeChange={handleSlideChange} dots={false}>
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
                            ) : rowData?.filter((each) => {
                                const normalizedCampaign = each.campaignname.trim().toLowerCase();
                                const normalizedInput = inputValue.trim().toLowerCase();
                                return (
                                    normalizedCampaign.startsWith(normalizedInput) ||
                                    normalizedCampaign.includes(normalizedInput) ||
                                    normalizedCampaign.endsWith(normalizedInput)
                                );
                            }
                            )?.length > 0 ? (

                                <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>

                                    <Row style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                                            <Space align="center">
                                                <div className="blinking-circle-1"></div>
                                                <Text style={{ paddingLeft: '3px', fontSize: '15px', fontWeight: '600' }}>Live</Text>
                                            </Space>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>Acc: {newaccount}</Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>AccName: {newAccountName}</Text>
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
                                                <Button type="primary" style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined />} onClick={onBtExport1} />
                                            </Tooltip>
                                        </Col>
                                    </Row>


                                    <AgGridReact
                                        ref={gridRef}
                                        rowData={rowData ? rowData?.filter((each) => {
                                            const normalizedCampaign = each.campaignname.trim().toLowerCase();
                                            const normalizedInput = inputValue.trim().toLowerCase();
                                            return (
                                                normalizedCampaign.startsWith(normalizedInput) ||
                                                normalizedCampaign.includes(normalizedInput) ||
                                                normalizedCampaign.endsWith(normalizedInput)
                                            );
                                        }
                                        ) : []}
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

                                        getMainMenuItems={getMainMenuItems}
                                    />

                                </div>
                            ) : <div style={{ backgroundColor: theme === "dark" && "#333" }}>
                                {startDate !== endDate ? <Result
                                    className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                    icon={<SmileOutlined />}
                                    title={`No LiveData for ${newaccount} from ${startDate} to ${endDate}`}
                                // extra={<Button type="primary">Next</Button>}
                                /> : <Result
                                    className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                    icon={<SmileOutlined />}
                                    title={`No LiveData for ${newaccount} to ${startDate}`}
                                // extra={<Button type="primary">Next</Button>}
                                />}
                            </div>}
                        </div>
                    </div>
                    <div>
                        <div style={contentStyle}>
                            {isLoading1 === true ? (
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
                            ) : dailyData?.filter((each) => {
                                const normalizedCampaign = each.campaignname.trim().toLowerCase();
                                const normalizedInput = inputValue.trim().toLowerCase();
                                return (
                                    normalizedCampaign.startsWith(normalizedInput) ||
                                    normalizedCampaign.includes(normalizedInput) ||
                                    normalizedCampaign.endsWith(normalizedInput)
                                );
                            }
                            )?.length > 0 ? (
                                <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>
                                    <Row style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                                            <Space align="center" className='daily-contaier'>
                                                <div className="blinking-circle"></div>
                                                <Text style={{ paddingLeft: '3px', fontSize: '15px', fontWeight: '600' }}>Daily</Text>
                                            </Space>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>Acc: {newaccount}</Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>AccName: {newAccountName}</Text>
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
                                                <Button type="primary" style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined />} onClick={() => onBtExport(gridRef1)} />
                                            </Tooltip>
                                        </Col>
                                    </Row>
                                    <AgGridReact
                                        ref={gridRef1}
                                        rowData={dailyData?.filter((each) => {
                                            const normalizedCampaign = each.campaignname.trim().toLowerCase();
                                            const normalizedInput = inputValue.trim().toLowerCase();
                                            return (
                                                normalizedCampaign.startsWith(normalizedInput) ||
                                                normalizedCampaign.includes(normalizedInput) ||
                                                normalizedCampaign.endsWith(normalizedInput)
                                            );
                                        }
                                        )}
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
                            ) : <div style={{ backgroundColor: theme === "dark" && "#333" }}>
                                {startDate !== endDate ? <Result
                                    className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                    icon={<SmileOutlined />}
                                    title={`No DailyData for ${newaccount} from ${startDate} to ${endDate}`}
                                // extra={<Button type="primary">Next</Button>}
                                /> : <Result
                                    className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                    icon={<SmileOutlined />}
                                    title={`No DailyData for ${newaccount} to ${startDate}`}
                                // extra={<Button type="primary">Next</Button>}
                                />}
                            </div>}
                        </div>
                    </div>
                    <div>
                        <div style={contentStyle}>
                            {isLoading2 === true ? (
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
                            ) : campaignData.filter((each) => {
                                const normalizedCampaign = each.campaignname.trim().toLowerCase();
                                const normalizedInput = inputValue.trim().toLowerCase();
                                return (
                                    normalizedCampaign.startsWith(normalizedInput) ||
                                    normalizedCampaign.includes(normalizedInput) ||
                                    normalizedCampaign.endsWith(normalizedInput)
                                );
                            })?.length > 0 ? (
                                <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>
                                    <Row style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                                            <Space align="center" className='daily-container' style={{ width: '150px' }}>
                                                <div class="blinking-circle-3"></div>
                                                <Text style={{ paddingLeft: '3px', fontSize: '15px', fontWeight: '600', width: '100px' }}>Campaigns</Text>
                                            </Space>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>Acc: {newaccount}</Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>AccName: {newAccountName}</Text>
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
                                                <Button type="primary" style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined />} onClick={() => onBtExport(gridRef2)} />
                                            </Tooltip>
                                        </Col>
                                    </Row>

                                    <div style={{ height: '90%' }}>
                                        <AgGridReact
                                            ref={gridRef2}
                                            rowData={campaignData.filter((each) => {
                                                const normalizedCampaign = each.campaignname.trim().toLowerCase();
                                                const normalizedInput = inputValue.trim().toLowerCase();
                                                return (
                                                    normalizedCampaign.startsWith(normalizedInput) ||
                                                    normalizedCampaign.includes(normalizedInput) ||
                                                    normalizedCampaign.endsWith(normalizedInput)
                                                );
                                            }
                                            )}
                                            columnDefs={columnDefs2.current}
                                            onCellClicked={onCellClickedAllCampaigns}
                                            autoGroupColumnDef={autoGroupColumnDef2}
                                            defaultColDef={defaultColDef}
                                            groupDisplayType='multipleColumns'
                                            suppressAggFuncInHeader={true}
                                            groupRowRenderer={GroupRowRenderer}
                                            onGridReady={(params) => {
                                                onGridReady(params, 'grid3', gridRef2);
                                                params.api.refreshCells(); // Refresh cells to apply the theme dynamically
                                            }}
                                            gridOptions={gridOptions2}
                                            suppressMenuHide={true}
                                            getMainMenuItems={getMainMenuItems}
                                            pinnedBottomRowData={campaignData.length > 0 ? fixedFooter : []}
                                            getRowStyle={params => {
                                                if (params.node.rowPinned) {
                                                    return {
                                                        fontWeight: 'bold',
                                                        // backgroundColor: theme === "dark" ? '#000' : '#fff', // Apply theme dynamically
                                                        // color: theme === "dark" ? '#fff' : '#000',           // Apply theme dynamically
                                                    };
                                                }
                                                return null;
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ backgroundColor: theme === "dark" && "#333" }}>
                                        {startDate !== endDate ? <Result
                                            className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                            icon={<SmileOutlined />}
                                            title={`No CampaignData for ${newaccount} from ${startDate} to ${endDate}`}
                                        /> : <Result
                                            className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                            icon={<SmileOutlined />}
                                            title={`No CampaignData for ${newaccount} to ${startDate}`}
                                        />}
                                    </div>
                                </div>
                            )}
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

                                    {/* <Row style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                                            <Space align="center">
                                                <div className="blinking-circle-1"></div>
                                                <Text style={{ paddingLeft: '3px', fontSize: '15px', fontWeight: '600' }}>Live</Text>
                                            </Space>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>Acc: {newaccount}</Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>AccName: {newAccountName}</Text>
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
                                                <Button type="primary" style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined />} onClick={onBtExport1} />
                                            </Tooltip>
                                        </Col>
                                    </Row> */}


                                    <AgGridReact
                                        rowData={BMNameData}
                                        columnDefs={BMNameColumnDefs}
                                        // defaultColDef={defaultColDef}
                                        suppressAggFuncInHeader={true}
                                        pinnedBottomRowData={BMNameFixedFooter}
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
                                {startDate !== endDate ? <Result
                                    className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                    icon={<SmileOutlined />}
                                    title={`No BMName Data for ${newaccount} from ${startDate} to ${endDate}`}
                                // extra={<Button type="primary">Next</Button>}
                                /> : <Result
                                    className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                    icon={<SmileOutlined />}
                                    title={`No BMName Data for ${newaccount} to ${startDate}`}
                                // extra={<Button type="primary">Next</Button>}
                                />}
                            </div>}
                        </div>
                    </div>

                    {revenuePratner === "FB_Tonic1" &&
                        <div>
                            <div style={contentStyle}>
                                {tonicKeywordLoading === true ? (
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
                                ) : tonicKeywordData?.length > 0 ? (
                                    <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>
                                        <AgGridReact
                                            ref={gridRef5}
                                            rowData={tonicKeywordData.filter((each) => {
                                                const normalizedCampaign = each.campaignname.trim().toLowerCase();
                                                const normalizedInput = inputValue.trim().toLowerCase();
                                                return (
                                                    normalizedCampaign.startsWith(normalizedInput) ||
                                                    normalizedCampaign.includes(normalizedInput) ||
                                                    normalizedCampaign.endsWith(normalizedInput)
                                                );
                                            }
                                            )}
                                            columnDefs={columnDefs4.current}
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
                                            autoGroupColumnDef={autoGroupColumnDef3}
                                            onGridReady={(params) => onGridReady(params, 'grid5', gridRef5)}
                                            gridOptions={gridOptions3}
                                            getMainMenuItems={getMainMenuItems}
                                            pinnedBottomRowData={tonicFixedFooter ? tonicFixedFooter : []}
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
                                            onFilterChanged={(params) => {
                                                try {
                                                    const api = params.api;
                                                    const filteredData = [];
                                            
                                                    // Collect filtered data
                                                    api.forEachNodeAfterFilterAndSort((node) => {
                                                        if (!node.rowPinned) {
                                                            filteredData.push(node.data);
                                                        }
                                                    });
                                            
                                                    const fieldValueFilter = (field, value) => {
                                                        if (!filteredData || !Array.isArray(filteredData)) {
                                                            console.error("Filtered data is invalid or not an array:", filteredData);
                                                            return [];
                                                        }
                                                        return filteredData.filter((item) => item && item[field] && item[field] === value);
                                                    };
                                                    const updatedFooter = [
                                                        {
                                                            adsetName: 'Total',
                                                            spend: filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.spend || 0), 0).toFixed(2),
                                                            revenue: filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.revenue || 0), 0).toFixed(2),
                                                            profit: filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.profit || 0), 0).toFixed(2),
                                                            margin: `${(
                                                                (filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.profit || 0), 0) /
                                                                    filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.revenue || 0), 0)) *
                                                                100 || 0
                                                            ).toFixed(2)}%`,
                                                            rpc: (
                                                                filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.rpc || 0), 0) / filteredData?.length || 0
                                                            ).toFixed(2),
                                                            cpl: (
                                                                filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.cpl || 0), 0) / filteredData?.length || 0
                                                            ).toFixed(2),
                                                            ncpl: (
                                                                filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.ncpl || 0), 0) / filteredData?.length || 0
                                                            ).toFixed(2),
                                                            fbleads: filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.fbleads || 0), 0),
                                                            conversions: filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.conversions || 0), 0),
                                                            fmargin: `${(
                                                                (filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.profit || 0), 0) /
                                                                    filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.spend || 0), 0)) *
                                                                100 || 0
                                                            ).toFixed(2)}%`,
                                                            roi: `${(
                                                                ((filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.revenue || 0), 0) -
                                                                    filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.spend || 0), 0)) /
                                                                    filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.spend || 0), 0)) *
                                                                100 || 0
                                                            ).toFixed(2)}%`,
                                                            cpc: (
                                                                filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.cpc || 0), 0) / filteredData?.length || 0
                                                            ).toFixed(2),
                                                            fbclicks: filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks || 0), 0),
                                                            impressions: filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.impressions || 0), 0),
                                                            ctr: `${(
                                                                (filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks || 0), 0) /
                                                                    filteredData?.reduce((acc, curr) => acc + parseFloat(curr?.impressions || 0), 0)) *
                                                                100 || 0
                                                            ).toFixed(2)}%`,
                                                        },
                                                    ];
                                            
                                                    // Set updated footer data
                                                    setFixedTonic(updatedFooter);
                                            
                                                    // Example field-based filtering logic with error handling
                                                    try {
                                                        const specificFieldData = fieldValueFilter('status', 'Active'); // Replace 'status' and 'Active' with your field and value
                                                        console.log('Filtered by status (Active):', specificFieldData);
                                                    } catch (fieldFilterError) {
                                                        console.error("Error in field-based filtering:", fieldFilterError);
                                                    }
                                                } catch (error) {
                                                    console.error("Error in onFilterChanged handler:", error);
                                                }
                                            }}
                                        />
                                    </div>
                                ) : <div style={{ backgroundColor: theme === "dark" && "#333" }}>
                                    {startDate !== endDate ? <Result
                                        className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                        icon={<SmileOutlined />}
                                        title={`No KeywordData for ${newaccount} from ${startDate} to ${endDate}`}
                                    // extra={<Button type="primary">Next</Button>}
                                    /> : <Result
                                        className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                        icon={<SmileOutlined />}
                                        title={`No KeywordData for ${newaccount} to ${startDate}`}
                                    // extra={<Button type="primary">Next</Button>}
                                    />}
                                </div>}
                            </div>
                        </div>
                    }

                    {revenuePratner === "FB_DomainActive" &&
                        <div>
                            <div style={contentStyle}>
                                {isLoading3 === true ? (
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
                                ) : keywordData.filter((each) => each.campaignname.includes(inputValue))?.length > 0 ? (
                                    <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>
                                        <Row style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
                                            <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                                                <Space align="center" className='daily-contaier'>
                                                    {/* <div className="blinking-circle"></div> */}
                                                    <Text style={{ paddingLeft: '3px', fontSize: '15px', fontWeight: '600' }}>Keywords</Text>
                                                </Space>
                                            </Col>
                                            <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                                <Text style={{ fontWeight: '600' }}>Acc: {newaccount}</Text>
                                            </Col>
                                            <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                                <Text style={{ fontWeight: '600' }}>AccName: {newAccountName}</Text>
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
                                                    <Button type="primary" style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined />} onClick={() => onBtExport(gridRef3)} />
                                                </Tooltip>
                                            </Col>
                                        </Row>
                                        <AgGridReact
                                            ref={gridRef3}
                                            rowData={keywordData.filter((each) => each.campaignname.includes(inputValue))}
                                            columnDefs={columnDefs3.current}
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
                                            autoGroupColumnDef={autoGroupColumnDef3}
                                            onGridReady={(params) => onGridReady(params, 'grid4', gridRef3)}
                                            gridOptions={gridOptions5}
                                            getMainMenuItems={getMainMenuItems}
                                            pinnedBottomRowData={keywordData.length > 0 ? pinnedBottomRowData3 : []}
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
                                ) : <div style={{ backgroundColor: theme === "dark" && "#333" }}>
                                    {startDate !== endDate ? <Result
                                        className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                        icon={<SmileOutlined />}
                                        title={`No KeywordData for ${newaccount} from ${startDate} to ${endDate}`}
                                    // extra={<Button type="primary">Next</Button>}
                                    /> : <Result
                                        className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                        icon={<SmileOutlined />}
                                        title={`No KeywordData for ${newaccount} to ${startDate}`}
                                    // extra={<Button type="primary">Next</Button>}
                                    />}
                                </div>}
                            </div>
                        </div>
                    }
                    {revenuePratner === "FB_System1" && (
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
                                ) : system1KeywordData.filter((each) => each.domain.includes(inputValue))?.length > 0 ? (
                                    <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>
                                        <Row style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
                                            <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                                                <Space align="center" className='daily-contaier'>
                                                    <Text style={{ paddingLeft: '3px', fontSize: '15px', fontWeight: '600' }}>Domain</Text>
                                                </Space>
                                            </Col>
                                            <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                                <Text style={{ fontWeight: '600' }}>Acc: {newaccount}</Text>
                                            </Col>
                                            <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                                <Text style={{ fontWeight: '600' }}>AccName: {newAccountName}</Text>
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
                                                    <Button type="primary" style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined />} onClick={() => onBtExport(gridRef4)} />
                                                </Tooltip>
                                            </Col>
                                        </Row>

                                        <AgGridReact
                                            ref={gridRef4}
                                            rowData={system1KeywordData}
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
                                            // onGridReady={(params) => onGridReady(params, 'grid5', gridRef4)}
                                            // gridOptions={gridOptions4}
                                            gridOptions={{
                                                groupUseEntireRow: true,  // Ensures the entire row is used for grouping
                                                // groupSuppressAutoColumn: true,  // Removes the auto group column that appears with the group header
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
                                        />
                                    </div>
                                ) : (
                                    <div style={{ backgroundColor: theme === "dark" ? "#333" : "#fff" }}>
                                        {startDate !== endDate ? (
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
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {revenuePratner === "FB_Mnet" &&
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
                                            rowData={domainData}
                                            columnDefs={domainColumnDefs}
                                            // defaultColDef={defaultColDef}
                                            suppressAggFuncInHeader={true}
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

                                                setDomainFixedFooter(updatedFooter);
                                            }}
                                        />
                                    </div>

                                ) : <div style={{ backgroundColor: theme === "dark" && "#333" }}>
                                    {startDate !== endDate ? <Result
                                        className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                        icon={<SmileOutlined />}
                                        title={`No DomainData for ${newaccount} from ${startDate} to ${endDate}`}
                                    // extra={<Button type="primary">Next</Button>}
                                    /> : <Result
                                        className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                        icon={<SmileOutlined />}
                                        title={`No DomainData for ${newaccount} to ${startDate}`}
                                    // extra={<Button type="primary">Next</Button>}
                                    />}
                                </div>}
                            </div>
                        </div>
                    }
                    {/* <div>hi</div> */}

                </Carousel>
            </div>

            {/* <Draggable>
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
            </Draggable> */}

            <Modal
                title="Basic Modal"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Add"
                cancelText="Cancel"
            >
                <Input value={newColumnName} placeholder='Enter Column Name' style={{ marginBottom: '10px' }} onChange={(e) => setNewColumnName(e.target.value)} />
                <Input value={formula} placeholder='Enter Formula' style={{ marginBottom: '10px' }} onChange={(e) => setFormula(e.target.value)} />
            </Modal>

        </div>
    );
};
export default MyTablePage;