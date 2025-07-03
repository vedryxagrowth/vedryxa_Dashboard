"use client"
import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import React from 'react';
import moment from 'moment-timezone';
import {  Input, Button, Result, Modal, message } from 'antd';
import {   SmileOutlined, CopyOutlined, StarOutlined, StarFilled, EditOutlined, MessageOutlined, PauseCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
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
    "FB_Tonic1": "Facebook_Tonic1",
    "FB_Sedo": "Facebook_Sedo",
    "FB_Inmobi": "Facebook_Inmobi",
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
    DST: 'DSTDate',
    CEST: 'CESTDate'
};


const InmobiKeywords = ({startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, campaignComments, Camapignlevelstatus,changeRRefrst, debouncedHandleColumnMove, userdetails, refreshComments, refreshpage, getMainMenuItems}) => {
    const {theme} = useTokenContext();
    const {apiClient} = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

    const [tonicKeywordData, setTonicKeywordData] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [fixedTonic, setFixedTonic] = useState([]);
    

    const [apiStatus, setApiStatus] = useState(false);

    const [tonicFixedFooter, setTonicFixedFooter] = useState([]);

    const [tonicKeywordLoading, setTonicKeywordLoading] = useState(true);

    const [selectedCells, setSelectedCells] = useState([]);
    const [firstSelectedCell, setFirstSelectedCell] = useState(null);

    const gridRef5 = useRef();

    const newTonicKeywordData = useRef();

    const oneTimeFetch = useRef(true);

    const memorizedColumnDef4 = useMemo(()=> columnDefs.current, [columnDefs.current]);
    const memorizedTonicKeywordsData = useMemo(()=>tonicKeywordData.filter((each) => {
        const normalizedCampaign = each.campaignname.trim().toLowerCase();
        const normalizedInput = inputValue.trim().toLowerCase();
        return (
            normalizedCampaign.startsWith(normalizedInput) ||
            normalizedCampaign.includes(normalizedInput) ||
            normalizedCampaign.endsWith(normalizedInput)
        );
    }
    ),[tonicKeywordData, inputValue]);

    const onBtExport = (gridRef, text) => {
        // const Details = {
        //     network : newRevenuePratner,
        //     account: newaccount,
        //     dateRange: `From ${newStartDate} to ${newendDate}`,
        //     type: text,
        //     email: userdetails?.email,
        //     time: moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A")
        // }
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
        // const updateDetails = async()=>{
        //     await apiClient.post('/UserExportActivities/', { Details });
        // }
        // updateDetails();
    };

    const autoGroupColumnDef3 = {
        headerName: 'Campaign name',
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
                
                        if (response.status === 200 || response.status === 201) {
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
                            if(response.status ===200 || response.status === 201){
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
                            if(response.status ===200 || response.status === 201){
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
                                                <PauseCircleOutlined style={{ color: 'orange', fontSize: '18px' }}  className='black-icon-pause' />
                                            </Tooltip>
                                        );
                                    } else if (status === 'ACTIVE') {
                                        return (
                                            <Tooltip title={tooltipContent}>
                                                <CheckCircleOutlined style={{ color: 'green', fontSize: '18px' }} className='black-icon-active' />
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
                                <MessageOutlined  className= {theme === "dark" ? "black-icon-comment" : 'Message'} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px', color: 'blue' }} />
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
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            onOk={handleOks} // Default Ok button functionality
                            onCancel={handleCancels} // Default Cancel button functionality
                            footer={[
                                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                    <div style={{display:'flex', flexDirection:"column"}}>
                                        <span key="info" style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black", fontWeight:"bold" }}>
                                            Last Edited Time:
                                        </span>
                                        <span key="info1" style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black", fontWeight:"bold" }}>
                                            {editUserANdTime ? moment(editUserANdTime?.editedTime, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A") : ""}
                                        </span>

                                    </div>
                                    <div>
                                    <Button
                                        key="delete"
                                        type="danger"
                                        onClick={handleDelete}
                                        style={{ marginRight: 'auto', border: "1px solid black" }} // Push Delete button to the far left
                                    >
                                        Delete
                                    </Button>
                                    <Button key="cancel" onClick={handleCancels} style={{marginLeft:"4px"}}>
                                        Cancel
                                    </Button>
                                    <Button key="ok" onClick={handleOks} style={{marginLeft:"4px", backgroundColor:"#91C25F"}}>
                                        Ok
                                    </Button>
                                    </div>
                                </div>
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
    const functionCall6 = async () => {
        try { 
            setTonicKeywordLoading(true);
            const fetchData = await apiClient.get(`/Inmobi/Keyword?dateStart=${startDate}&dateEnd=${endDate}&time=${newtime}&accountNumber=${newaccount}`);
            const mainData = fetchData.data;
            console.log(mainData, "mainData of functionCall6");
            const specifiedTimeZone = selectTimezone[newtime];

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
                            adid: "",
                            adname: "",
                            keyword: eachData.keyword,
                            from:'',
                            profitloss: "",
                            M_tq: "",
                            D_tq: "",
                            // compaignid: eachData.campaign_id,
                        }
                    )
                }) : null;

            console.log(filteredData);

            const fullData = filteredData?.length > 0 ? [...filteredData] : [];
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
            fetchData.status === 200 && setApiStatus(false);
            
        } catch (error) {
            setTonicKeywordData([]);
            setTonicKeywordLoading(false); 
            setApiStatus(true);
            // console.log(error);
            // setLoading4(false); // Hide loading spinner in case of error
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
    const onCellClicked = (event) => {
        
        if (event.colDef.field === 'adsetname') {
            const value = event.value;
            if (value !== undefined) {
                const url = `/DailyAndCampaignHistory/AdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        }
        // // ✅ Ensure first selected cell gets highlighted
        // if (event.event.shiftKey || event.event.ctrlKey) {
        //     // Add to selection when Shift/Ctrl is pressed
        //     setSelectedCells((prev) => [...prev, { rowIndex: event.node.rowIndex, colId: event.column.getId() }]);
        // } else {
        //     // Single click selects only one cell
        //     setFirstSelectedCell({ rowIndex: event.node.rowIndex, colId: event.column.getId() });
        //     setSelectedCells([{ rowIndex: event.node.rowIndex, colId: event.column.getId() }]);
        // }

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
    const gridOptions3 = {
        onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid4'),
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
    const handleReFetchData = () => {
        functionCall6();
        setApiStatus(false);
    }

    useEffect(() => {
        if (refreshpage === "Refresh5" && newRevenuePratner === "FB_Tonic1") {
            handleReFetchData();
        }
    }
    , [refreshpage]);

    useEffect(() => {
        if(oneTimeFetch.current){
            functionCall6();
            oneTimeFetch.current = false;
        }
    }, [oneTimeFetch.current]);
    return(
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
                            rowData={memorizedTonicKeywordsData}
                            columnDefs={memorizedColumnDef4}
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
                            gridOptions={{
                                ...gridOptions3,
                                ensureDomOrder: false,
                                suppressRowClickSelection: true,
                                suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                groupSelectsChildren: true, // ✅ Ensures child rows are selected properly
                            }}
                            getMainMenuItems={getMainMenuItems}
                            pinnedBottomRowData={tonicFixedFooter ? tonicFixedFooter : []}
                            onCellKeyDown={onCellKeyDown}
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
                            onFilterChanged={(params) => {
                                try {
                                    const api = params?.api;
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

export default InmobiKeywords;