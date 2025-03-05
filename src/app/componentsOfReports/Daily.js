"use client"
import { useEffect, useMemo, useState, useRef} from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import moment from 'moment-timezone';
import React from 'react';
import { Input, Button, Row, Col, Typography, Result, Modal, message} from 'antd';
import {  DownloadOutlined,  SmileOutlined, CopyOutlined,  EditOutlined,  MessageOutlined, PauseCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip} from 'antd';
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


const Daily = ({startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, campaignComments, Camapignlevelstatus, changeRRefrst, debouncedHandleColumnMove, userdetails, refreshComments, refreshpage}) => {
    const {theme} = useTokenContext();
    const {apiClient} = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

    const [dailyData, setdailyData] = useState([]);

    const [dailyFixedFooter, setDailyFixedFooter] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isLoading1, setLoading1] = useState(true);

    const timezone = useRef();

    const gridRef1 = useRef();

    const newDailyData = useRef();

    const oneTimeFetch = useRef(true);

    const [apiStatus, setApiStatus ]= useState(false);

    const memorizedColumnDef1 = useMemo(()=> columnDefs.current, [columnDefs.current]);
    const memorizedDailyData = useMemo(()=> dailyData?.filter((each) => {
        const normalizedCampaign = each.campaignname.trim().toLowerCase();
        const normalizedInput = inputValue.trim().toLowerCase();
        return (
            normalizedCampaign.startsWith(normalizedInput) ||
            normalizedCampaign.includes(normalizedInput) ||
            normalizedCampaign.endsWith(normalizedInput)
        );
    }
    ), [dailyData, inputValue]);

    useEffect(()=>{
        setDailyFixedFooter(
            [
                {
                    campaignName: 'Total',
                    actions: '',
                    spend: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
                    revenue: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
                    profit: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
                    margin: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
                    rpc: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / memorizedDailyData?.length).toFixed(2)),
                    cpl: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / memorizedDailyData?.length).toFixed(2)),
                    ncpl: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / memorizedDailyData?.length).toFixed(2)),
                    fbleads: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
                    conversions: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
                    fmargin: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                    roi: parseFloat(((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                    cpc: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / memorizedDailyData?.length).toFixed(2)),
                    fbclicks: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
                    impressions: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
                    ctr: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
                }
            ]
        );
    },[memorizedDailyData]);

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

    const autoGroupColumnDef = {
        headerName: 'Campaign-Name',
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
                        const response = await apiClient.post('/Comments', {
                            commentsdatas: logData,
                        });
                        // console.log('Response from server:', response.data);
                    } catch (error) {
                        console.error('Error sending data to server:', error);
                    }
                };

                const sendEditedCommentToAPI = async (logData) => {
                    try {
                        const response = await apiClient.post('/Comments/edit', {
                            campaignname: logData.campaignname,
                            comment: logData.comment,
                            Account: logData.Account,
                            adsetid: logData.adsetid,
                            campaignid: logData.campaignid,
                            status: true
                        });
                        // console.log('Response from server (edited comment):', response.data);
                        return response.data;
                    } catch (error) {
                        console.error('Error sending edited comment to server:', error);
                        throw error;
                    }
                };

                const handleDelete = async () => {
                    try {
                        // Prepare the payload for the API call
                        const payload = {
                            campaignname: firstColumnValue,
                            Account: newaccount,
                            adsetid: adsetid,
                            campaignid: campaignid,
                        };
                
                        // Call the backend API to delete the comment
                        const response = await apiClient.post('/Comments/delete', payload);
                
                        if (response.status === 200) {
                            // Remove the comment from the local state
                            // const updatedComments = campaignComments.filter(
                            //     (comment) => comment.campaignname !== firstColumnValue
                            // );
                
                            // // Update the state with the updated comments
                            // setCampaignComments(updatedComments);
                            refreshComments(newaccount);
                
                            // Refresh the table or any other UI component
                            // changeRRefrst();
                
                            message.success('Comment deleted successfully!');
                            setIsModalVisibles(false); // Close the popup
                        } else {
                            message.error('Failed to delete the comment. Please try again.');
                        }
                    } catch (error) {
                        console.error('Error deleting the comment:', error);
                        message.error('Failed to delete the comment. Please try again.');
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

                const handlePinClick = async (campaignName, campaignid, adsetid, currentPinStatus) => {
                    const updatedPinStatus = !currentPinStatus;

                    try {
                        let response;
                        if (updatedPinStatus) {
                            response = await apiClient.post('/Pin', {
                                campaignname: campaignName,
                                Account: newaccount,
                                campaignid: campaignid,
                                adsetid: adsetid,
                                userPin: userdetails?.email,
                                comment: comment || ''
                            });
                            // changeRRefrst();
                            if(response.status ===200){
                                refreshComments(newaccount);
                            }

                            message.success("Campaign pinned!");
                        } else {
                            response = await apiClient.post('/Unpin', {
                                campaignname: campaignName,
                                Account: newaccount,
                                campaignid: campaignid,
                                adsetid: adsetid
                            });
                            // changeRRefrst();
                            if(response.status ===200){
                                refreshComments(newaccount);
                            }

                            message.success("Campaign unpinned!");
                        }

                        // Update campaignComments with the new pinned status and edited user/time
                        // const updatedComments = campaignComments.map(cmt =>
                        //     cmt.campaignname === campaignName
                        //         ? {
                        //             ...cmt,
                        //             pinned: updatedPinStatus,
                        //             editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                        //             userPin: userdetails?.email
                        //         }
                        //         : cmt
                        // );

                        // if (!campaignComments.some(cmt => cmt.campaignname === campaignName)) {
                        //     updatedComments.push({
                        //         campaignname: campaignName,
                        //         pinned: updatedPinStatus,
                        //         editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                        //         userPin: userdetails?.email
                        //     });
                        // }
                        // const sortedComments = updatedComments.sort((a, b) => b.pinned - a.pinned);
                        // setCampaignComments(sortedComments);
                        setPinned(updatedPinStatus);
                    } catch (error) {
                        console.error('Error toggling pin status', error);
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
                            onOk={handleOks} // Default Ok button functionality
                            onCancel={handleCancels} // Default Cancel button functionality
                            footer={[
                                <Button
                                    key="delete"
                                    type="danger"
                                    onClick={handleDelete}
                                    style={{ marginRight: 'auto', border: "1px solid black" }} // Push Delete button to the far left
                                >
                                    Delete
                                </Button>,
                                <Button key="cancel" onClick={handleCancels}>
                                    Cancel
                                </Button>,
                                <Button key="ok" type="primary" onClick={handleOks}>
                                    Ok
                                </Button>,
                            ]}
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
    const functionCall2 = async () => {
        try {
            setLoading1(true);
            const api = newRevenuePratner === "FB_DomainActive" ? "Daily/CampaignName" : "Daily";
            const fetchData = await apiClient.get(`/${api}?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=${newtworkCollections[newRevenuePratner]}`);
            const mainData = fetchData.data;
            timezone.current = mainData.length > 0  ? mainData[0].accountTimezone : "";
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
                    let rpc = newRevenuePratner === "FB_Mnet" && newtime === "UTC" ? eachData.ad_clicks !== 0 ? (Math.round((Revenue / eachData.ad_clicks) * 100) / 100) : 0 : eachData.conversions !== 0 ? (Math.round((Revenue / eachData.conversions) * 100) / 100) : 0;
                    const revenue = ((eachData.estimated_revenue - eachData.spend) / (eachData.fbLeads * rpc)) * 100;
                    let fMargin = revenue !== 0 ? Math.round(((profit / revenue) * 100) * 100) / 100 : 0;
                    const cpl = eachData.fbLeads !== 0 ? Math.round((eachData.spend / eachData.fbLeads) * 100) / 100 : 0;
                    let ncpl = newRevenuePratner === "FB_Mnet" && newtime === "UTC" ? eachData.ad_clicks !== 0 ? Math.round((eachData.spend / eachData.ad_clicks) * 100) / 100 : 0 : eachData.conversions !== 0 ? Math.round((eachData.spend / eachData.conversions) * 100) / 100 : 0;
                    const roi = eachData.spend !== 0 ? `${Math.round((((Revenue - eachData.spend) / eachData.spend) * 100) * 100) / 100}%` : '0%';
                    const ctr = eachData.impressions !== 0 ? `${Math.round(((eachData.fbClicks / eachData.impressions) * 100) * 100) / 100}%` : '0%';
                    const mainRvenue = ((Math.round(Revenue * 100) / 100)).toString();
                    const conversions = newRevenuePratner === "FB_Mnet" && newtime === "UTC" 
                    ? eachData.ad_clicks !== undefined 
                        ? eachData.ad_clicks 
                        : '0'
                    : eachData.conversions !== undefined 
                        ? eachData.conversions 
                        : '0';
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

            const fullData = filteredData?.length > 0 ? [...filteredData] : [];

            setDailyFixedFooter(
                [
                    {
                        campaignName: 'Total',
                        actions: '',
                        spend: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
                        revenue: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
                        profit: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
                        margin: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
                        rpc: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / fullData?.length).toFixed(2)),
                        cpl: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / fullData?.length).toFixed(2)),
                        ncpl: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / fullData?.length).toFixed(2)),
                        fbleads: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
                        conversions: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
                        fmargin: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                        roi: parseFloat(((fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                        cpc: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / fullData?.length).toFixed(2)),
                        fbclicks: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
                        impressions: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
                        ctr: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
                    }
                ]
            );

            setdailyData(fullData);
            newDailyData.current = fullData;
            fetchData.status === 200 && setApiStatus(false);
            fetchData.status === 200 && console.log("Success");
            // setTrue(false);
            setLoading1(false);
        } catch (error) {
            // console.log(error);
            // if(error.response.status === 500){
            //     apiStatus.current = true;
            // }
            console.log(error);
            setApiStatus(true);
            setLoading1(false);
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
    const gridOptions1 = {
        onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid2'),
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

    
    const handleReFetchData = () => {
        functionCall2();
        setApiStatus(false);
    }

    useEffect(() => {
        if(oneTimeFetch.current){
            functionCall2();
            oneTimeFetch.current = false;
        }
    }, [oneTimeFetch.current]);

    useEffect(() => {
        if (refreshpage === "Refresh2") {
            handleReFetchData();
        }
    }
    , [refreshpage]);

    useEffect(() => {
        if (gridRef1.current && gridRef1.current.api) {
            setTimeout(() => {
                gridRef1.current.api.refreshCells({ force: true });
                gridRef1.current.api.redrawRows();
                gridRef1.current.api.sizeColumnsToFit();
            }, 200);
        }
    }, [memorizedDailyData]);
    
    return(
                    <div style={{ height: "100%", marginBottom: '20px' }}>
                        <div style={contentStyle}>
                            {isLoading1 === true ? 
                            (
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
                                        {/* <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ fontWeight: '600' }}>
                                                Cron/Acc status: {cronStatus.current} /{' '}
                                                <span style={{ color: accountStatus.current === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
                                                    {accountStatus.current}
                                                </span>
                                            </Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={4} lg={2} style={{ flex: "0.2 0 auto" }}>
                                            <Tooltip
                                            title={
                                                <>
                                                <div>FbAcc Status: {`${fbCron.current}`}</div>
                                                <div>RevAcc Status: {`${revenueCron.current}`}</div>
                                                </>
                                            }
                                            >
                                                <InfoCircleOutlined style={{ fontSize: '18px', cursor: 'pointer', marginRight: '10px' }} />
                                            </Tooltip>
                                        </Col> */}
                                        <Col xs={24} sm={24} md={4} lg={2} style={{ flex: '0.2 0 auto' }}>
                                            <Tooltip title="Export to CSV">
                                                <Button type="primary" style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined />} onClick={() => onBtExport(gridRef1, "Daily")} />
                                            </Tooltip>
                                        </Col>
                                    </Row>
                                    <AgGridReact
                                        ref={gridRef1}
                                        rowData={memorizedDailyData}
                                        columnDefs={memorizedColumnDef1}
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
                                        onGridReady={(params) => {
                                            gridRef1.current = params.api; // Store grid API
                                            restoreGridState(gridRef1.current); // Restore state when grid is ready
                                            onGridReady(params, 'grid2', gridRef1);
                                            if (params.columnApi) {
                                                params.columnApi.autoSizeAllColumns();
                                            }
                                        }}
                                        gridOptions={gridOptions1}
                                        getMainMenuItems={getMainMenuItems}
                                        pinnedBottomRowData={dailyFixedFooter}
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
                                            const api = params.api;
                                            const filteredData = [];
                                            // api.forEachNodeAfterFilterAndSort((node) => {
                                            //     if (!node.rowPinned) {
                                            //         filteredData.push(node.data);
                                            //     }
                                            // });
                                            const normalizedInput = inputValue.trim().toLowerCase();

                                            api.forEachNodeAfterFilterAndSort((node) => {
                                                // Check if node.data exists and has a valid campaignname
                                                if (node.data && node.data.campaignname) {
                                                    const normalizedCampaign = node.data.campaignname.trim().toLowerCase();
                                        
                                                    // Apply both search and AG-Grid filters
                                                    if (
                                                        normalizedCampaign.startsWith(normalizedInput) ||
                                                        normalizedCampaign.includes(normalizedInput) ||
                                                        normalizedCampaign.endsWith(normalizedInput)
                                                    ) {
                                                        filteredData.push(node.data);
                                                    }
                                                }
                                            });

                                            const updatedFooter = [
                                                {
                                                    // [`${newtime}Date`]: 'Totals',
                                                    campaignName: 'Total',
                                                    spend: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend || 0), 0).toFixed(2)),
                                                    revenue: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.revenue || 0), 0).toFixed(2)),
                                                    profit: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.profit || 0), 0).toFixed(2)),
                                                    margin: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.revenue), 0) * 100).toFixed(2)),
                                                    rpc: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.rpc), 0) / filteredData.length).toFixed(2)),
                                                    cpl: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpl), 0) / filteredData.length).toFixed(2)),
                                                    ncpl: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.ncpl), 0) / filteredData.length).toFixed(2)),
                                                    fbleads: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbleads), 0).toFixed(2)),
                                                    conversions: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.conversions), 0).toFixed(2)),
                                                    fmargin: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0) * 100).toFixed(2)),
                                                    roi: parseFloat(((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.revenue), 0) - filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0)) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0) * 100).toFixed(2)),
                                                    cpc: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpc), 0) / filteredData.length).toFixed(2)),
                                                    fbclicks: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0).toFixed(2)),
                                                    impressions: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0).toFixed(2)),
                                                    ctr: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0) * 100).toFixed(2))
                                                },
                                            ];

                                            setDailyFixedFooter(updatedFooter);
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
                                    title={`No DailyData for ${newaccount} from ${startDate} to ${endDate}`}
                                // extra={<Button type="primary">Next</Button>}
                                /> : <Result
                                    className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                    icon={<SmileOutlined />}
                                    title={`No DailyData for ${newaccount} to ${startDate}`}
                                // extra={<Button type="primary">Next</Button>}
                                />)}
                            </div>}
                        </div>
                    </div> 
    );
};

export default Daily;