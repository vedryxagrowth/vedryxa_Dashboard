// pages/dashboard.js
"use client"
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
// pages/index.js
import React from 'react';
import axios from 'axios';
import { Select, Tag, theme } from 'antd';
import moment from 'moment-timezone';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
// const options = [];
// for (let i = 10; i < 36; i++) {
//   options.push({
//     value: i.toString(36) + i,
//     label: i.toString(36) + i,
//   });
// }

import { DatePicker, Space, ConfigProvider, Flex, Spin, Skeleton } from 'antd';
const { RangePicker } = DatePicker;
import locale from 'antd/es/date-picker/locale/en_US';
const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
const defaultDates = [dayjs(yesterday), dayjs(yesterday)];
const disabledDate = (current) => {
    // Disable dates after today
    return current && current > dayjs().endOf('day');
};

import {
    Card,
    Row,
    Col,
    Statistic,
    Progress,
    List,
    Avatar,
    Divider,
    Typography,
    Checkbox
} from 'antd';
// import {
//     TrophyOutlined,
//     ArrowUpOutlined,
//     ArrowDownOutlined,
//     DollarOutlined,
//     UserOutlined,
//     ShoppingOutlined,
//     SmileOutlined,
// } from '@ant-design/icons';

import { useTokenContext } from '../components/parent';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import 'ag-grid-enterprise';



const { Title } = Typography;

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

const Dashboard = () => {
    const { userdetails } = useTokenContext();
    const { theme } = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
    console.log(userdetails);
    // console.log(userdetails?.adAccounts, "f1");
    // const { adAccounts } = userdetails;

    if (!userdetails?.adAccounts) {
        return <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Flex align="center" gap="middle">
                {/* <Spin size="small" />
                <Spin /> */}
                <Spin size="large" />
            </Flex>
        </div>;
    }

    const transformData = (data) => {
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => {
                // Check if the value is an array and if it contains objects
                if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                    // Convert array of objects to array of accountNumbers
                    return [key, value.map(obj => obj.accountNumber)];
                }
                // If it's not an array of objects, keep it as is
                return [key, value];
            })
        );
    };

    const transformedData = transformData(userdetails?.adAccounts);
    // console.log(transformedData, "1");


    const defaultCategory = Object.keys(transformedData)[0];

    const [skeletonLoading, setSkeletonLoading] = useState(true);

    const [startDate, setStartDate] = useState(yesterday);

    const [endDate, setEndDate] = useState(yesterday);
    const [darkMode, setDarkMode] = useState(false);
    const [data, setData] = useState([]);
    // const toggleTheme = () => {
    //     setDarkMode(!darkMode);
    // };
    const [time, setTime] = useState('UTC');

    const onChangeTime = (value) => {
        setSkeletonLoading(true);
        setTime(value);
    }

    const revenue1 = useRef(0);
    const spend1 = useRef(0);
    const profit1 = useRef(0);
    const leads1 = useRef(0);
    const conversions1 = useRef(0);
    const cpc1 = useRef(0);
    const ncpl1 = useRef(0);
    const cpl1 = useRef(0);
    const ctr1 = useRef(0);
    const rpc1 = useRef(0);

    // State for the first Select element (categories)
    const [firstSelectValues, setFirstSelectValues] = useState([defaultCategory]);

    // State for the second Select element (selected items within categories)
    const [selectedItems, setSelectedItems] = useState({
        [defaultCategory]: transformedData[defaultCategory], // Default all items in the first category
    });

    const [chartData, setChartData] = useState({ dates: [], spend: [], revenue: [], profit: [], margin: [] });

    const [rowData, setRowData] = useState([]);

    // const functionalCall = (data) => {
    //     setData(data);
    // }

    const handleChangeDates = (dates) => {
        if (dates && dates.length === 2) {
            setSkeletonLoading(true);
            const [start, end] = dates;
    
            const formattedStart = start.format('YYYY-MM-DD');
            const formattedEnd = end.format('YYYY-MM-DD');
    
            if (startDate !== formattedStart || endDate !== formattedEnd) {
                setStartDate(formattedStart);
                setEndDate(formattedEnd);
            } else {
                // Trigger a manual re-render if the dates are the same
                setStartDate('');
                setEndDate('');
                setTimeout(() => {
                    setStartDate(formattedStart);
                    setEndDate(formattedEnd);
                }, 0);
            }
        }
    };

    function getTotalEstimatedRevenue(fullData) {
        const total = fullData.reduce((sum, item) => {
            // Check if 'estimated_revenue' exists in the object and is a number
            if (item.estimated_revenue && typeof item.estimated_revenue === 'number') {
                return sum + item.estimated_revenue;
            }
            return sum;
        }, 0); // Start the sum at 0

        // Round the final total to 2 decimal places
        return Math.round(total * 100) / 100;
    }


    // function getTotalEstimatedSpend(fullData) {
    //     return fullData.reduce((total, item) => {
    //         // Check if 'estimated_revenue' exists in the object and is a number
    //         if (item.spend) {
    //             return total + parseFloat(item.spend);
    //         }
    //         // console.log(typeof total);
    //         return Math.round(total * 100) / 100;
    //     }, 0); // Start the total at 0
    // }getTotalEstimatedProfit

    function getTotalEstimatedSpend(fullData) {
        const total = fullData.reduce((sum, item) => {
            // Check if 'estimated_revenue' exists in the object and is a number
            if (item.spend) {
                return sum + parseFloat(item.spend);
            }
            return sum;
        }, 0); // Start the sum at 0

        // Round the final total to 2 decimal places
        return Math.round(total * 100) / 100;
    }

    function getTotalEstimatedProfit(fullData) {
        return Math.round((getTotalEstimatedRevenue(fullData) - getTotalEstimatedSpend(fullData)) * 100) / 100;
    }

    function getTotalLeads(fullData) {
        const total = fullData.reduce((sum, item) => {
            // Check if 'estimated_revenue' exists in the object and is a number
            if (item.fbLeads) {
                return sum + parseInt(item.fbLeads);
            }
            return sum;
        }, 0); // Start the sum at 0

        // Round the final total to 2 decimal places
        return total;
    }

    function getTotalConversions(fullData) {
        const total = fullData.reduce((sum, item) => {
            // Check if 'estimated_revenue' exists in the object and is a number
            if (item.conversions) {
                return sum + parseInt(item.conversions);
            }
            return sum;
        }, 0); // Start the sum at 0

        // Round the final total to 2 decimal places
        return total;
    }

    function getAverageEstimatedCpc(fullData) {
        // Filter items that have a valid 'cpc' value
        const validCpcItems = fullData.filter(item => item.cpc);

        // Calculate the total sum of 'cpc'
        const total = validCpcItems.reduce((sum, item) => {
            return sum + parseFloat(item.cpc);
        }, 0);

        // Calculate the average, and round to 2 decimal places
        const average = validCpcItems.length > 0 ? (total / validCpcItems.length) : 0;

        return Math.round(average * 100) / 100;
    }

    function getTotalFbClicks(fullData) {
        const total = fullData.reduce((sum, item) => {
            // Check if 'estimated_revenue' exists in the object and is a number
            if (item.fbLeads) {
                return sum + parseInt(item.fbLeads);
            }
            return sum;
        }, 0); // Start the sum at 0

        // Round the final total to 2 decimal places
        return total;
    }

    function getTotalImpressions(fullData) {
        const total = fullData.reduce((sum, item) => {
            // Check if 'estimated_revenue' exists in the object and is a number
            if (item.impressions) {
                return sum + parseInt(item.impressions);
            }
            return sum;
        }, 0); // Start the sum at 0

        // Round the final total to 2 decimal places
        return total;
    }

    function getTotalNcpl(fullData) {
        return Math.round((getTotalEstimatedSpend(fullData) / getTotalConversions(fullData)) * 100) / 100;
    }

    function getTotalRpc(fullData) {
        return Math.round((getTotalEstimatedRevenue(fullData) / getTotalConversions(fullData)) * 100) / 100;
    }

    function getTotalCpl(fullData) {
        return Math.round((getTotalEstimatedSpend(fullData) / getTotalLeads(fullData)) * 100) / 100;
    }

    function getTotalCtr(fullData) {
        return Math.round(((getTotalFbClicks(fullData) / getTotalImpressions(fullData)) * 100) * 100) / 100;
    }

    const functionCallForResponse = debounce(async (data) => {
        const transformObjectKeys = (obj) => {
            const transformedObject = {};

            Object.keys(obj).forEach((key) => {
                // Split the key by underscore
                const splitKey = key.split('_');

                // Add "Facebook_" to the first index
                //   splitKey[0] = "Facebook_" + splitKey[1];

                // Join the array back into a string
                const newKey = "Facebook_" + splitKey[1];

                // Assign the value to the new key in the transformed object
                transformedObject[newKey] = obj[key];
            });

            return transformedObject;
        };

        // Example usage
        // const originalObject = {
        //     ad_campaign_2023: "active",
        //     ad_set_2023: "paused",
        // };

        const transformedObject = transformObjectKeys(data);
        // console.log(transformedObject);
        const response = await axios.post(`https://prodapis.adsgoat.in/Dashboard?timezone=${time}&start_date=${startDate}&end_date=${endDate}`, { formattedData: [transformedObject] }); 
        const responseData = response.data;
        const functionForDetailsUpdate = async () => {
            revenue1.current = getTotalEstimatedRevenue(responseData);
            spend1.current = getTotalEstimatedSpend(responseData);
            profit1.current = getTotalEstimatedProfit(responseData);
            leads1.current = getTotalLeads(responseData);
            conversions1.current = getTotalConversions(responseData);
            cpc1.current = getAverageEstimatedCpc(responseData);
            ncpl1.current = getTotalNcpl(responseData);
            cpl1.current = getTotalCpl(responseData);
            rpc1.current = getTotalRpc(responseData);
            ctr1.current = getTotalCtr(responseData);

            setData(responseData);
        }
        functionForDetailsUpdate();

        function groupByAccountNumber(data) {
            return data.reduce((acc, obj) => {
                const key = obj.accountNumber;

                // Find if the accountNumber already exists in the accumulator array
                let account = acc.find(item => item.accountNumber === key);

                if (!account) {
                    // If not found, create a new entry for this accountNumber
                    acc.push({
                        accountNumber: obj.accountNumber,
                        spend: obj.spend ? parseFloat(obj.spend) : 0, // Initialize with current object values
                        estimated_revenue: obj.estimated_revenue ? parseFloat(obj.estimated_revenue) : 0,
                        fbLeads: obj.fbLeads ? parseInt(obj.fbLeads) : 0,
                        conversions: obj.conversions ? parseInt(obj.conversions) : 0,
                        revenuePartner: obj.revenuePartner,
                        mediaBuyerName: obj.MediaBuyerName,
                        holder: obj.Holder,
                    });
                } else {
                    // If found, sum the respective fields
                    account.spend += obj.spend !== null && obj.spend !== undefined ? parseFloat(obj.spend) : 0;
                    account.estimated_revenue += obj.estimated_revenue !== null && obj.estimated_revenue !== undefined ? parseFloat(obj.estimated_revenue) : 0;
                    account.fbLeads += obj.fbLeads !== null && obj.fbLeads !== undefined ? parseInt(obj.fbLeads) : 0;
                    account.conversions += obj.conversions !== null && obj.conversions !== undefined ? parseInt(obj.conversions) : 0;
                }

                return acc;
            }, []).map(account => {
                // Calculate profit after grouping
                account.profit = account.estimated_revenue - account.spend;
                return account;
            });
        }

        const groupedData = groupByAccountNumber(responseData);
        setRowData(groupedData);


        console.log(groupedData);

        const dates = groupedData.map(d => d.accountNumber.slice(-4));
        const spend = groupedData.map(d => Math.round((d.spend) * 100) / 100);
        const revenue = groupedData.map(d => (Math.round(d.estimated_revenue) * 100) / 100);
        const profit = groupedData.map(d => Math.round((d.estimated_revenue - d.spend) * 100) / 100);
        const rpc = groupedData.map(d => Math.round((d.estimated_revenue / d.conversions) * 100) / 100);
        const cpl = groupedData.map(d => Math.round(((d.spend / d.fbLeads) * 100) * 100) / 100);

        const margin = groupedData.map(d => Math.round((((d.estimated_revenue - d.spend) / d.estimated_revenue) * 100) * 100) / 100);

        setChartData({ dates, spend, revenue, profit, margin, rpc, cpl });
        console.log(responseData.length);
        setSkeletonLoading(false);
    }, 1500);;

    useEffect(() => {
        // if(selectedItems.length > 0){
        functionCallForResponse(selectedItems);
        // }
    }, [selectedItems, time, startDate, endDate])


    useEffect(() => {
        let selectedCategoryValues = null;

        // Log the default state on component mount (runs only once)
        if (Object.keys(selectedItems).length === 0) {
            console.log('First Select - Default Selected Categories:', [defaultCategory]);
            console.log('Second Select - Default Selected Items:', { [defaultCategory]: transformedData[defaultCategory] });
        }

        // Only process selectedItems if it's populated
        if (Object.keys(selectedItems).length > 0) {
            selectedCategoryValues = Object.entries(selectedItems).reduce((result, [category, values]) => {
                if (values.length > 0) {
                    result[category] = values;
                }
                return result;
            }, {});

            console.log('Second Select - Current Selected Items:', selectedCategoryValues);


            // Ensure functionalCall is not triggering state updates
            //   if (selectedCategoryValues) {
            //     // Make sure functionalCall doesn't trigger updates that cause rerenders
            //     functionalCall([selectedCategoryValues]);
            //   }
        }

    }, [selectedItems, defaultCategory, transformedData]);
    //   useEffect(() => {
    //     console.log(`Second Select - Current Selected Items for ${defaultCategory}:`, selectedItems[defaultCategory]);
    //   }, [selectedItems[defaultCategory]]); 

    // Handle change in the first select (category select)
    const handleFirstSelectChange = (newCategories) => {
        // Automatically select all items for newly added categories
        setSkeletonLoading(true);
        setFirstSelectValues(newCategories);

        setSelectedItems((prevSelected) => {
            const updatedSelectedItems = { ...prevSelected };

            // Remove categories that are deselected
            Object.keys(prevSelected).forEach((category) => {
                if (!newCategories.includes(category)) {
                    delete updatedSelectedItems[category]; // Remove deselected categories
                }
            });

            // For any new category, select all items by default
            newCategories.forEach((category) => {
                if (!prevSelected[category] && transformedData[category]) {
                    updatedSelectedItems[category] = transformedData[category]; // Select all items by default
                }
            });

            return updatedSelectedItems;
        });

        // Check if only 'FB_Tonic' is selected and update the timezone
        if (newCategories.length === 1 && newCategories[0] === 'FB_Tonic') {
            setTime('PDT'); // Change to PDT when FB_Tonic is selected
        } else {
            setTime('UTC'); // Default to UTC otherwise
        }
    };


    // Handle change in the second select (category items select)
    // This runs whenever `selectedItems` changes

    // Example state updating functions from previous example for reference:

    const debouncedUpdateSelectedItems = useCallback(
        debounce((category, checkedValues) => {
            setSelectedItems((prevSelected) => ({
                ...prevSelected,
                [category]: checkedValues,
            }));
            //   setSkeletonLoading(false); // Optionally stop loading
        }, 1000), // Adjust debounce time (1000ms in this example)
        []
    );

    const handleGroupChange = (checkedValues, category) => {
        setSkeletonLoading(true);
        // Call the debounced function to update the state
        debouncedUpdateSelectedItems(category, checkedValues);
    };

    const handleSelectAllChange = (isChecked, category) => {
        setSkeletonLoading(true);
        const newSelectedValues = isChecked ? transformedData[category] : [];
        setSelectedItems((prevSelected) => ({
            ...prevSelected,
            [category]: newSelectedValues,
        }));
        // setSkeletonLoading(false); // Optionally stop loading
    };

    // Render checkboxes for categories dynamically based on the first Select values
    const renderInnerSelects = (theme) => {
        return firstSelectValues.map((category) => {
            const allSelected =
                transformedData[category]?.length === selectedItems[category]?.length;

            return (
                <div key={category}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: theme === 'dark' ? 'white' : 'black',
                        }}
                    >
                        <Divider style={{ color: theme === 'dark' ? 'white' : 'black' }}>
                            {category}
                            <Checkbox
                                checked={allSelected}
                                onChange={(e) => handleSelectAllChange(e.target.checked, category)}
                                style={{ marginLeft: '15px' }}
                                className={theme === 'dark' ? 'checkbox-dark' : 'checkbox-light'}
                            />
                        </Divider>
                    </div>
                    <Checkbox.Group
                        options={transformedData[category]} // Use the plain options as Ant Design expects
                        value={selectedItems[category] || []} // Keep the previously selected items
                        onChange={(checkedValues) => handleGroupChange(checkedValues, category)}
                        className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'} // Apply class based on theme
                    />
                </div>
            );
        });
    };






    // const newNetworks = userdetails?.adAccounts.map((each)=>)

    const networks = Object.keys(userdetails?.adAccounts);
    console.log(networks, "network");

    const options = networks.map(each => ({
        value: each,
        label: each,
    }));

    const disabledDate = (current) => {
        // Disable dates after today
        return current && current > Date.now();
    };

    const spender = (params) => {
        const total = params.values.reduce((acc, value) => acc + parseFloat(value || 0), 0);
        return Math.round(total * 100) / 100; // Round to 2 decimal places
    };

    const currencyFormatter = (params) => {
        return `$${parseFloat(params.value || 0).toFixed(2)}`; // Ensure 2 decimal places in currency format
    };

    const [columnDefs] = useState([
        {
            field: "revenuePartner",
            resizable: true,
            sortable: true,
            // width: 500,
            hide: true,
            rowGroup: true,
            enableRowGroup: true,
        }, // Group by Network
        {
            field: "holder",
            resizable: true,
            sortable: true,
            hide: true, // Hide column as it's grouped
            rowGroup: true,
            enableRowGroup: true,
        }, // Group by Holder
        {
            field: "mediaBuyerName",

        }, // Display Media Buyer name
        { field: 'accountNumber', headerName: 'AccountNumber' },
        {
            field: "spend",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
        }, // Summing Spend column
        {
            headerName: 'Revenue',
            field: "estimated_revenue",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
        }, // Summing Revenue column
        {
            field: "profit",
            aggFunc: spender,
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            valueFormatter: currencyFormatter,
        }, // Custom aggregation for Profit
    ]);

    const [columnDefs1] = useState([
        {
            field: "accountNumber",

        }, // Group by Network
        {
            field: "spend",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
        }, // Summing Spend column
        {
            headerName: 'Revenue',
            field: "estimated_revenue",
            aggFunc: spender,
            valueFormatter: currencyFormatter,
        }, // Summing Revenue column
        {
            field: "profit",
            aggFunc: spender,
            sort: 'desc',
            cellClassRules: {
                'font-red': p => p.value < 0
            },
            valueFormatter: currencyFormatter,
        },
        {
            field: "revenuePartner",
        }, // Group by Holder
        {
            field: "holder",// Group by MediaBuyerName
        },
        {
            field: "mediaBuyerName",// Group by MediaBuyerName
        },
    ]);

    //   const [columnDefs2] = useState([
    //     { field: "revenuePartner", 
    //         resizable: true,
    //         sortable: true,
    //         // width: 500,
    //         hide: true,
    //         rowGroup: true,
    //         enableRowGroup: true,
    //     }, // Group by Network
    //     { field: "holder",
    //     resizable: true,
    //     sortable: true,
    //     hide: true, // Hide column as it's grouped
    //     rowGroup: true, 
    //     enableRowGroup: true,  }, // Group by Holder
    //     {
    //       field: "mediaBuyerName",// Group by MediaBuyerName
    //     }, // Display Media Buyer name
    //     {
    //       field: "spend",
    //       aggFunc: spender,
    //     //   valueFormatter: currencyFormatter,
    //     }, // Summing Spend column
    //     {
    //       field: "estimated_revenue",
    //       aggFunc: spender,
    //     //   valueFormatter: currencyFormatter,
    //     }, // Summing Revenue column
    //     {
    //       field: "profit",
    //       aggFunc: spender,
    //     //   valueFormatter: currencyFormatter,
    //     }, // Custom aggregation for Profit
    //   ]);

    const [defaultColDef] = useState({
        flex: 1, // Flex for responsiveness
        sortable: true, // Enable sorting
        filter: true, // Enable filtering
        resizable: true,
        enableRowGroup: true, // Enable row grouping
    });

    //   function currencyFormatter(params) {
    //     const value = params.value || 0; // Ensure value is defined and default to 0
    //     return `$${value}`; // Format the value as currency
    //   }


    // console.log(rowData?.map(each=> each.profit > 0));
    console.log(chartData, "data");
    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '40%' }}>
                    <h1 style={{ color: darkMode ? '#007BFF' : '#fff', fontSize: '22px', textAlign: 'start' }}>
                        Welcome, {userdetails?.userName} !
                    </h1>
                </div>
                <div style={{ width: '60%', display: 'flex', justifyContent: 'flex-end', height: '50px' }}>
                    <Row style={{ width: '100%', height: '100px', display: 'flex', justifyContent: 'space-between' }}>
                        <Col span={5}>
                            <Select
                                mode="tags"
                                style={{
                                    width: '100%',
                                    maxHeight: '40px',
                                    overflowY: 'auto',
                                }}
                                placeholder="Select Categories"
                                value={firstSelectValues}
                                onChange={handleFirstSelectChange}
                                maxTagCount="responsive"
                                dropdownClassName={theme === 'dark' && "custom-dropdown"}
                                dropdownRender={(menu) => (
                                    <div
                                        style={{
                                            width: '100%',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            overflowX: 'hidden',
                                            // padding: '8px',
                                            scrollbarWidth: 'none', // For Firefox
                                            msOverflowStyle: 'none',
                                        }}
                                    >
                                        {menu}
                                    </div>
                                )}
                                options={Object.keys(transformedData).map((category) => ({
                                    value: category,
                                    label: category,
                                }))}
                            />
                        </Col>

                        <Col span={6}>
                            <Select
                                mode="multiple"
                                style={{ width: '100%', color: theme === 'dark' ? 'white' : 'black' }}
                                placeholder="Select items"
                                dropdownClassName={theme === 'dark' && 'custom-dropdown'}
                                value={[]} // This should be updated to reflect selectedItems based on the selected categories
                                dropdownRender={() => (
                                    <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px' }}>
                                        {renderInnerSelects(theme)}
                                    </div>
                                )}
                            />
                        </Col>

                        <Col span={3}>
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

                        <Col span={8}>
                            <ConfigProvider locale={locale}>
                                <RangePicker
                                    presets={rangePresets}
                                    onChange={handleChangeDates}
                                    defaultValue={defaultDates}
                                    disabledDate={disabledDate}
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
                    </Row>
                </div>
            </div>

            {skeletonLoading ? (
                <Skeleton active paragraph={{ rows: 18 }} />
            ) : (
                <div style={{ height: '100%', paddingBottom: '40px' }}>
                    <Row gutter={24} style={{ marginTop: '20px' }} justify="space-between">
                        <Col flex="1">
                            <Card>
                                <Statistic
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    height: '12px',
                                                    width: '12px',
                                                    backgroundColor: '#A3F254',
                                                    borderRadius: '50%',
                                                    marginRight: '8px',
                                                }}
                                            ></span>
                                            <span style={{ color: '#A3F254', fontWeight: 600 }}>Revenue</span>
                                        </div>
                                    }
                                    value={data.length > 0 ? revenue1.current : 0}
                                    prefix="$"
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>

                        <Col flex="1">
                            <Card>
                                <Statistic
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    height: '12px',
                                                    width: '12px',
                                                    backgroundColor: '#EC7117',
                                                    borderRadius: '50%',
                                                    marginRight: '8px',
                                                }}
                                            ></span>
                                            <span style={{ color: '#EC7117', fontWeight: 600 }}>Profit</span>
                                        </div>
                                    }
                                    value={data.length > 0 ? profit1.current : 0}
                                    prefix="$"
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>

                        <Col flex="1">
                            <Card>
                                <Statistic
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    height: '12px',
                                                    width: '12px',
                                                    backgroundColor: '#5C58EE',
                                                    borderRadius: '50%',
                                                    marginRight: '8px',
                                                }}
                                            ></span>
                                            <span style={{ color: '#5C58EE', fontWeight: 600 }}>Spend</span>
                                        </div>
                                    }
                                    value={data.length > 0 ? spend1.current : 0}
                                    prefix="$"
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>

                        <Col flex="1">
                            <Card>
                                <Statistic
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    height: '12px',
                                                    width: '12px',
                                                    backgroundColor: '#EC7117',
                                                    borderRadius: '50%',
                                                    marginRight: '8px',
                                                }}
                                            ></span>
                                            <span style={{ color: '#EC7117', fontWeight: 600 }}>Leads</span>
                                        </div>
                                    }
                                    value={data.length > 0 ? leads1.current : 0}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>

                        <Col flex="1">
                            <Card>
                                <Statistic
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    height: '12px',
                                                    width: '12px',
                                                    backgroundColor: '#5C58EE',
                                                    borderRadius: '50%',
                                                    marginRight: '8px',
                                                }}
                                            ></span>
                                            <span style={{ color: '#5C58EE', fontWeight: 600 }}>Conversions</span>
                                        </div>
                                    }
                                    value={data.length > 0 ? conversions1.current : 0}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={24} style={{ marginTop: '20px' }} justify="space-between">
                        <Col flex="1">
                            <Card>
                                <Statistic
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    height: '12px',
                                                    width: '12px',
                                                    backgroundColor: '#A3F254',
                                                    borderRadius: '50%',
                                                    marginRight: '8px',
                                                }}
                                            ></span>
                                            <span style={{ color: '#A3F254', fontWeight: 600 }}>NCPL</span>
                                        </div>
                                    }
                                    value={data.length > 0 ? ncpl1.current : 0}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>

                        <Col flex="1">
                            <Card>
                                <Statistic
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    height: '12px',
                                                    width: '12px',
                                                    backgroundColor: '#EC7117',
                                                    borderRadius: '50%',
                                                    marginRight: '8px',
                                                }}
                                            ></span>
                                            <span style={{ color: '#EC7117', fontWeight: 600 }}>CPL</span>
                                        </div>
                                    }
                                    value={data.length > 0 ? cpl1.current : 0}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>

                        <Col flex="1">
                            <Card>
                                <Statistic
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    height: '12px',
                                                    width: '12px',
                                                    backgroundColor: '#5C58EE',
                                                    borderRadius: '50%',
                                                    marginRight: '8px',
                                                }}
                                            ></span>
                                            <span style={{ color: '#5C58EE', fontWeight: 600 }}>CTR</span>
                                        </div>
                                    }
                                    value={data.length > 0 ? ctr1.current : 0}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>

                        <Col flex="1">
                            <Card>
                                <Statistic
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    height: '12px',
                                                    width: '12px',
                                                    backgroundColor: '#EC7117',
                                                    borderRadius: '50%',
                                                    marginRight: '8px',
                                                }}
                                            ></span>
                                            <span style={{ color: '#EC7117', fontWeight: 600 }}>CPC</span>
                                        </div>
                                    }
                                    value={data.length > 0 ? cpc1.current : 0}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>

                        <Col flex="1">
                            <Card>
                                <Statistic
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    height: '12px',
                                                    width: '12px',
                                                    backgroundColor: '#5C58EE',
                                                    borderRadius: '50%',
                                                    marginRight: '8px',
                                                }}
                                            ></span>
                                            <span style={{ color: '#5C58EE', fontWeight: 600 }}>RPC</span>
                                        </div>
                                    }
                                    value={data.length > 0 ? rpc1.current : 0}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* <Row style={{ height: '400px', marginBottom: '10px', marginTop: '25px', padding: '0px', marginLeft:'0px', marginRight:'0px' }}>
                    <Line
                    data={{
                        labels: chartData.dates,
                        datasets: [
                        {
                            label: 'Spend',
                            data: chartData.spend,
                            borderColor: 'rgba(44, 144, 192, 1)',
                            backgroundColor: 'rgba(44, 144, 192, 0.2)',
                            fill: true,
                            hidden: true,
                            tension: 0.3
                        },
                        {
                            label: 'Revenue',
                            data: chartData.revenue,
                            borderColor: 'rgba(99, 200, 99, 1)',
                            backgroundColor: 'rgba(99, 200, 99, 0.2)',
                            fill: true,
                            hidden: true,
                            tension: 0.3
                        },
                        {
                            label: 'RPC',
                            data: chartData.rpc,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            fill: true,
                            hidden: true,
                            tension: 0.3
                        },
                        {
                            label: 'CPL',
                            data: chartData.cpl,
                            borderColor: 'rgba(255, 159, 64, 1)',
                            backgroundColor: 'rgba(255, 159, 64, 0.2)',
                            fill: true,
                            hidden: true,
                            tension: 0.3
                        },
                        {
                            label: 'Profit',
                            data: chartData.profit,
                            borderColor: 'rgba(255, 206, 86, 1)',
                            backgroundColor: 'rgba(255, 206, 86, 0.2)',
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: 'Margin',
                            data: chartData.margin,
                            borderColor: 'rgba(153, 102, 255, 1)',
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            fill: true,
                            hidden: true,
                            tension: 0.3
                        },
                        ],
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                        x: {
                            ticks: {
                            padding: 30,
                            },
                        },
                        y: {
                            beginAtZero: true,
                        },
                        },
                    }}
                    height={350}
                    />
                </Row> */}
                    <Row
                        style={{
                            height: '400px',
                            marginBottom: '10px',
                            marginTop: '25px',
                            padding: '0px',
                            marginLeft: '0px',
                            marginRight: '0px',
                        }}
                    >
                        <Line
                            data={{
                                labels: chartData.dates,
                                datasets: [
                                    {
                                        label: 'Spend',
                                        data: chartData.spend,
                                        borderColor: 'rgba(44, 144, 192, 1)',
                                        backgroundColor: 'rgba(44, 144, 192, 0.2)',
                                        fill: true,
                                        hidden: true,
                                        tension: 0.3
                                    },
                                    {
                                        label: 'Revenue',
                                        data: chartData.revenue,
                                        borderColor: 'rgba(99, 200, 99, 1)',
                                        backgroundColor: 'rgba(99, 200, 99, 0.2)',
                                        fill: true,
                                        hidden: true,
                                        tension: 0.3
                                    },
                                    {
                                        label: 'RPC',
                                        data: chartData.rpc,
                                        borderColor: 'rgba(255, 99, 132, 1)',
                                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                        fill: true,
                                        hidden: true,
                                        tension: 0.3
                                    },
                                    {
                                        label: 'CPL',
                                        data: chartData.cpl,
                                        borderColor: 'rgba(255, 159, 64, 1)',
                                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                                        fill: true,
                                        hidden: true,
                                        tension: 0.3
                                    },
                                    {
                                        label: 'Profit',
                                        data: chartData.profit,
                                        borderColor: 'rgba(255, 206, 86, 1)',
                                        backgroundColor: 'rgba(255, 206, 86, 0.2)',
                                        fill: true,
                                        tension: 0.3
                                    },
                                    {
                                        label: 'Margin',
                                        data: chartData.margin,
                                        borderColor: 'rgba(153, 102, 255, 1)',
                                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                                        fill: true,
                                        hidden: true,
                                        tension: 0.3
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    x: {
                                        ticks: {
                                            padding: 30,
                                            color: darkMode ? '#fff' : '#000', // Change tick color based on mode
                                        },
                                        grid: {
                                            color: darkMode ? '#444' : '#e0e0e0', // Change grid color based on mode
                                        },
                                    },
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            color: darkMode ? '#fff' : '#000', // Change tick color based on mode
                                        },
                                        grid: {
                                            color: darkMode ? '#444' : '#e0e0e0', // Change grid color based on mode
                                        },
                                    },
                                },
                                plugins: {
                                    legend: {
                                        labels: {
                                            color: darkMode ? '#fff' : '#000', // Change legend color based on mode
                                        },
                                    },
                                },
                            }}
                            height={350}
                        />
                    </Row>

                    <Row style={{ display: 'flex', flexDirection: 'column' }}>
                        <Col>
                            <h2 >
                                Over All Report
                            </h2>

                        </Col>
                        {/* <Col>
                        <div className="ag-theme-alpine" style={{ width: '100%', height: '400px' }}>
                            
                            <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowGroupPanelShow="always"
                            suppressAggFuncInHeader={true}
                            groupIncludeFooter={true}
                            groupIncludeTotalFooter={true}
                            />
                        </div>
                    </Col> */}
                        <Col>
                            <div
                                className={`ag-theme-alpine ${gridThemeClass}`}
                                style={{ width: '100%', height: '400px' }}
                            >
                                <AgGridReact
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    rowGroupPanelShow="always"
                                    suppressAggFuncInHeader={true}
                                    groupIncludeFooter={true}
                                    groupIncludeTotalFooter={true}
                                />
                            </div>
                        </Col>

                    </Row>

                    <Row style={{ display: 'flex', flexDirection: 'column' }}>
                        <Col>
                            <h2>Profit Accounts</h2>
                        </Col>

                        <Col>
                            <div
                                className={`ag-theme-alpine ${gridThemeClass}`}
                                style={{ width: '100%', height: '400px' }}
                            >
                                <AgGridReact
                                    rowData={rowData?.filter((each) => each.profit > 0)}
                                    columnDefs={columnDefs1}
                                    defaultColDef={defaultColDef}
                                    rowGroupPanelShow="always"
                                    suppressAggFuncInHeader={true}
                                    groupIncludeFooter={true}
                                    groupIncludeTotalFooter={true}
                                />
                            </div>
                        </Col>

                    </Row>
                    <Row style={{ display: 'flex', flexDirection: 'column' }}>
                        <Col>
                            <h2>Loss Accounts</h2>
                        </Col>
                        <Col>
                            <div
                                className={`ag-theme-alpine ${gridThemeClass}`}
                                style={{ width: '100%', height: '400px' }}
                            >             <AgGridReact
                                    rowData={rowData?.filter(each => each.profit < 0)}
                                    columnDefs={columnDefs1}
                                    defaultColDef={defaultColDef}
                                    rowGroupPanelShow="always"
                                    suppressAggFuncInHeader={true}
                                    groupIncludeFooter={true}
                                    groupIncludeTotalFooter={true}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row></Row>


                </div>
            )}
        </div>


    );
};

export default Dashboard;
