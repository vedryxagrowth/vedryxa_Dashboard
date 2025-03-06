"use client"
import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import React from 'react';
import moment from 'moment-timezone';
import dayjs from 'dayjs';
import {  Input, Button, Row, Col, Typography, Result, Modal, message } from 'antd';
import {  DownloadOutlined, SmileOutlined, CopyOutlined, StarOutlined, StarFilled, EditOutlined, MessageOutlined, PauseCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
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
    "FB_Tonic1": "Facebook_Tonic1"
}
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


const DAKeywords = ({startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, campaignComments, Camapignlevelstatus, changeRRefrst, debouncedHandleColumnMove, userdetails, refreshComments, refreshpage}) => {
    const {theme} = useTokenContext(); 
    const {apiClient} = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

    const [keywordData, setKeywordData] = useState([]);

    const [dailyFixedFooter, setDailyFixedFooter] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isLoading3, setLoading3] = useState(true);

    const [apiStatus, setApiStatus] = useState(false);

    const timezone = useRef();

    const gridRef3 = useRef();

    const newDailyData = useRef();

    const oneTimeFetch = useRef(true);

    const memorizedColumnDef3 = useMemo(()=> columnDefs.current, [columnDefs.current]);
    const memorizedKeywordsData = useMemo(()=>keywordData.filter((each) => {
        const normalizedCampaign = each.campaignname.trim().toLowerCase();
        const normalizedInput = inputValue.trim().toLowerCase();
        return (
            normalizedCampaign.startsWith(normalizedInput) ||
            normalizedCampaign.includes(normalizedInput) ||
            normalizedCampaign.endsWith(normalizedInput)
        );
    }
    ),[keywordData, inputValue]);

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

    const autoGroupColumnDef3 = {
        headerName: 'Campaign-Name',
        minWidth: 450,
        pinned: 'left',
        sortable: true, // Enable sorting

        comparator: (campaignA, campaignB) => {
            if (!campaignA) return 1;
            if (!campaignB) return -1;

            const getStarredForCampaign = (campaignName) => {
                const relatedComment = campaignComments.find(comment => comment?.campaignname === campaignName);
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

                const firstColumnValue = params?.node?.key;  // campaign name
                const campaignName = params?.node?.key;

                let campaignid, adsetid;

                if (params?.node?.group && params?.node?.childrenAfterGroup && params?.node?.childrenAfterGroup?.length > 0) {
                    const firstChild = params?.node?.childrenAfterGroup[0]?.data;
                    campaignid = firstChild?.campaignid;
                    adsetid = firstChild?.adsetid;
                } else if (params?.data) {
                    campaignid = params?.data?.campaignid;
                    adsetid = params?.data?.adsetid;
                } else {
                    console.error('Missing campaignid or adsetid for campaign:', campaignName);
                    return (
                        <div style={{ color: 'red' }}>
                            Error: campaignid or adsetid missing for {campaignName}
                        </div>
                    );
                }
                const getEditedUserAndTime = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments?.find(comment => comment?.campaignname === campaignName && comment?.Account === newaccount);
                    // console.log(relatedStatus, "relatedStatus");
                    const relatedStatusEditedTime = relatedStatus ? relatedStatus : null;
                    // console.log(relatedStatusTrue);
                    return relatedStatusEditedTime;
                }
                const getStatusForCampaign = (campaignName, newaccount) => {
                    const relatedStatus = campaignComments?.find(comment => comment?.campaignname === campaignName && comment?.Account === newaccount);
                    // console.log(relatedStatus, "relatedStatus");
                    const relatedStatusTrue = relatedStatus !== undefined && relatedStatus?.status === true ? true : relatedStatus !== undefined ? false : null;
                    // console.log(relatedStatusTrue);
                    return relatedStatusTrue;
                }

                const getCommentForCampaign = (campaignName) => {
                    const relatedComment = campaignComments?.find(comment => comment?.campaignname === campaignName);
                    return relatedComment ? relatedComment?.comment : null;
                };

                const getStarredForCampaign = (campaignName) => {
                    const relatedComment = campaignComments?.find(comment => comment?.campaignname === campaignName);
                    return relatedComment ? relatedComment?.starred : false;
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
                    navigator?.clipboard?.writeText(firstColumnValue)
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
                        const response = await apiClient.post('/Comments', {
                            commentsdatas: logData,
                        });
                        console.log('Response from server:', response.data);
                    } catch (error) {
                        console.error('Error sending data to server:', error);
                    }
                };

                const sendEditedCommentToAPI = async (logData) => {
                    try {
                        const response = await apiClient.post('/Comments/edit', {
                            campaignname: logData?.campaignname,
                            comment: logData?.comment,
                            Account: logData?.Account,
                            adsetid: logData?.adsetid,
                            campaignid: logData?.campaignid,
                            status: true
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
                        const endpoint = isStarred ? '/Star' : '/Unstar';
                        const response = await apiClient.post(endpoint, {
                            campaignname: campaignname,
                            Account: account,
                            usercommit: userdetails?.email,
                            campaignid: campaignid,
                            adsetid: adsetid
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

                    const updatedComments = campaignComments?.map(cmt =>
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
                            refreshComments(newaccount);
                            message.success("Comment updated successfully!");
                        } else {
                            await sendNewCommentToAPI(logData);
                            refreshComments(newaccount);
                            message.success("New comment added successfully!");
                        }
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
                                const campaignStatus = Camapignlevelstatus?.find(statusObj => statusObj.name === campaignName);

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
                                window.open(url, '_blank', 'noopener,noreferrer');
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

    function findMaxHour(data) {
        // Use reduce to find the maximum value of the 'hour' key
        const maxHour = data.reduce((max, obj) => {
            // Convert the 'hour' value to a number before comparison
            const hourAsNumber = parseInt(obj.hour, 10);
            return hourAsNumber > max ? hourAsNumber : max;
        }, -Infinity);  // Initialize with -Infinity to ensure proper comparison

        return String(maxHour).padStart(2, '0');  // Return the max hour as a string with leading zero
    }

    function getMaxHour(data) {
        const hours = data
            .filter(item => item.updatedHour) // Filter out objects without updatedHour
            .map(item => parseInt(item.updatedHour.split(":")[0], 10));
        return hours.length > 0 ? Math.max(...hours) : null;
    }
    const functionCall4 = async () => {
        try {
            setLoading3(true);
            const fetchData = await apiClient.get(`/DAKeywords?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=${newtworkCollections[newRevenuePratner]}`);
            const mainData = fetchData.data;
            timezone.current = mainData[0].accountTimezone;
            // console.log(mainData, "mainData of functionCall4");
            let totalSpend = 0;
            let totalRevenue = 0;
            let totalProfit = 0;
            let totalCpc = 0;
            let totalFbleads = 0;
            let totalFbclicks = 0;
            let totalImpressions = 0;
            let totalConversions = 0;
            const specifiedTimeZone = selectTimezone[newtime];
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

            const fullData = filteredData?.length > 0 ? [...filteredData] : [];
            setKeywordData(fullData);
            newDailyData.current = fullData;
            fetchData.status === 200 && setApiStatus(false);
            setLoading3(false);
        } catch (error) {
            setLoading3(false);
            setApiStatus(true);
            // console.log(error);
        }
    }
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
    const onCellClicked = (event) => {
        
        if (event.colDef.field === 'adsetname') {
            const value = event.value;
            if (value !== undefined) {
                const url = `/DailyAndCampaignHistory/AdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        }

    };
    const onGridReady = (params, gridId, gridRef) => {
        gridRef.current = params;
        params.api.applyColumnState({ state: columnDefs || [], applyOrder: true });
        params.api.addEventListener('dragStopped', (e) => debouncedHandleColumnMove(e, gridId));
    };
    
    // const onGridReady = (params, gridId, gridRef) => {
    //     gridRef.current = params;
    //     params.api.applyColumnState({ state: columnDefs, applyOrder: true });
    //     params.api.addEventListener('dragStopped', (e) => debouncedHandleColumnMove(e, gridId));
    // };
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
    const showModal = () => {
        setIsModalOpen(true);
    };
    const getMainMenuItems = (params) => {
        const defaultItems = params.defaultItems.slice();

        // Find and override the "Reset Columns" option
        const resetColumnsItemIndex = defaultItems.findIndex(item => item === 'resetColumns');
        if (resetColumnsItemIndex > -1) {
            defaultItems[resetColumnsItemIndex] = {
                name: 'Reset Columns (Custom)',
                action: () => {
                    changeRRefrst();
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
    const gridOptions5 = {
        onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid5'),
        defaultColDef: {
            suppressMenu: true,
            headerClass: "custom-header" // Apply to all columns by default

        }
    };
    const restoreGridState = (gridApi) => {
        const filterModel = JSON.parse(localStorage.getItem('gridFilterModel'));
        const sortModel = JSON.parse(localStorage.getItem('gridSortModel'));

        if (gridApi) {
            if (filterModel) gridApi.setFilterModel(filterModel);
            if (sortModel) gridApi.setSortModel(sortModel);
        }
    };
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
    const handleReFetchData = () => {
        functionCall4();
        setApiStatus(false);
    }
    useEffect(() => {
        if(oneTimeFetch.current){
            functionCall4();
            oneTimeFetch.current = false;
        }
    }, [oneTimeFetch.current]);
    useEffect(() => {
        if (refreshpage === "Refresh5" && newRevenuePratner === "FB_DomainActive") {
            handleReFetchData();
        }
    }
    , [refreshpage]);
    return(
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
                ) : keywordData?.length > 0 ? (
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
                            <Col xs={24} sm={24} md={4} lg={2} style={{ flex: '0.2 0 auto' }}>
                                <Tooltip title="Export to CSV">
                                    <Button type="primary" style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined />} onClick={() => onBtExport(gridRef3, "Keywords")} />
                                </Tooltip>
                            </Col>
                        </Row>
                        <AgGridReact
                            ref={gridRef3}
                            rowData={memorizedKeywordsData}
                            columnDefs={memorizedColumnDef3}
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
                    {apiStatus === true ? 
                        <Result
                            className={theme === 'dark' ? 'dark-result' : 'light-result'}
                             // icon={<SmileOutlined />}
                            title={`API failed to fetch the data. Please click retry button to fetch the data`}
                            extra={<Button type="primary" onClick={handleReFetchData}>Retry</Button>}
                        /> : 
                        (startDate !== endDate ? <Result
                            className={theme === 'dark' ? 'dark-result' : 'light-result'}
                            icon={<SmileOutlined />}
                            title={`No KeywordData for ${newaccount} from ${startDate} to ${endDate}`}
                        // extra={<Button type="primary">Next</Button>}
                        /> : <Result
                            className={theme === 'dark' ? 'dark-result' : 'light-result'}
                            icon={<SmileOutlined />}
                            title={`No KeywordData for ${newaccount} to ${startDate}`}
                        // extra={<Button type="primary">Next</Button>}
                        />)}
                </div>}
            </div>
        </div>

    );
};

export default DAKeywords;