"use client"
import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import React from 'react';
import moment from 'moment-timezone';
import {  Input, Button, Row, Col, Typography, Result, Modal, message } from 'antd';
import {  InfoCircleOutlined, DownloadOutlined, SmileOutlined, CopyOutlined, EditOutlined, MessageOutlined, PauseCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
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

const LiveReports = ({startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, campaignComments, Camapignlevelstatus, changeRRefrst, debouncedHandleColumnMove, userdetails, refreshComments}) => {
    const {theme} = useTokenContext();
    const {apiClient} = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
    const [rowData, setRowData] = useState([]);

    const [liveFixedFooter, setLiveFixedFooter] = useState([]);

    const [isLoading, setLoading] = useState(true);

    const [apiStatus, setApiStatus] = useState(false);
    

    const [isModalOpen, setIsModalOpen] = useState(false);

    const timezone = useRef();

    const cronStatus = useRef();

    const accountStatus = useRef();

    let fbCron = useRef();

    let revenueCron = useRef();

    const maxHour = useRef();

    const maxNetworkHour = useRef();

    const gridRef = useRef();


    const newRowData = useRef();

    const oneTimeFetch = useRef(true);

    const memorizedColumnDef = useMemo(() => columnDefs, [columnDefs]);
    const memorizedRowData = useMemo(() => rowData ? rowData?.filter((each) => {
        const normalizedCampaign = each.campaignname.trim().toLowerCase();
        const normalizedInput = inputValue.trim().toLowerCase();
        return (
            normalizedCampaign.startsWith(normalizedInput) ||
            normalizedCampaign.includes(normalizedInput) ||
            normalizedCampaign.endsWith(normalizedInput)
        );
    }
    ) : [], [rowData, inputValue]);

    useEffect(()=>{
        setLiveFixedFooter([
            {
                campaignName: 'Total',
                actions: "",
                spend: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
                revenue: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
                profit: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
                margin: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
                rpc: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / memorizedRowData?.length).toFixed(2)),
                cpl: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / memorizedRowData?.length).toFixed(2)),
                ncpl: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / memorizedRowData?.length).toFixed(2)),
                fbleads: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
                conversions: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
                fmargin: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                roi: parseFloat(((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
                cpc: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / memorizedRowData?.length).toFixed(2)),
                fbclicks: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
                impressions: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
                ctr: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
            }
        ])
    },[memorizedRowData]);

    const onBtExport1 = () => {
        console.log(gridRef.current.api,"in")
        const Details = {
            network : newRevenuePratner,
            account: newaccount,
            dateRange: `From ${startDate} to ${endDate}`,
            type: "Live",
            email: userdetails?.email,
            time: moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A")
        }
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
        const updateDetails = async()=>{
            await apiClient.post('/UserExportActivities/', { Details });
        }
        updateDetails();

    };

    const autoGroupColumnDefLive = {
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
                        const response = await apiClient.post('/Comments', {
                            commentsdatas: logData,
                        });
                    } catch (error) {
                        console.error('Error sending data to server:', error);
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
                        // console.log(payload);
                
                        // Call the backend API to delete the comment
                        const response = await apiClient.post('/Comments/delete', payload);
                
                        if (response.status === 200) {
                            // Remove the comment from the local state
                            // const updatedComments = campaignComments.filter(
                            //     (comment) => comment.campaignname !== firstColumnValue
                            // );
                            refreshComments(newaccount);
                
                            // // Update the state with the updated comments
                            // setCampaignComments(updatedComments);
                
                            // // Refresh the table or any other UI component
                            // // changeRRefrst();
                
                            message.success('Comment deleted successfully!');
                            setIsModalVisibles(false); // Close the popup
                        } else {
                            message.error('Failed to delete the comment. Please try again.-1');
                        }
                    } catch (error) {
                        console.error('Error deleting the comment:', error);
                        message.error('Failed to delete the comment. Please try again.');
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
                            refreshComments(newaccount);
                            message.success("Comment updated successfully!");
                        } else {
                            await sendNewCommentToAPI(logData);
                            refreshComments(newaccount);
                            message.success("New comment added successfully!");
                        }

                        // const updatedComments = relatedComment
                        //     ? campaignComments.map(cmt => (cmt.campaignname === firstColumnValue ? { ...cmt, comment } : cmt))
                        //     : [...campaignComments, logData];
                        // setCampaignComments(updatedComments);

                        // changeRRefrst();
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
    const functionCall1 = async () => {
       try{
        // console.log(newRevenuePratner);
            setLoading(true);
            const collectionName = newRevenuePratner === "FB_DomainActive" ? "Facebook_DActive_Names" : newtworkCollections[newRevenuePratner];
            const fetchData = await apiClient.get(`/Live?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=${collectionName}`);
            const mainData1 = fetchData.data;
            const mainData =  mainData1.filter(obj => !("ad_clicks" in obj));
            const specifiedTimeZone = selectTimezone[newtime];
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
                            timezone: eachData[newtime],
                            comment: relatedComment ? relatedComment.comment : null,
                            actions: '...'
                        }
                    )
                })
                : null;

            const getFbValue = mainData.filter(item => item.fbCron !== null && item.fbCron !== 'Failed');
            const getRevenueValue = mainData.filter(item => item.revenueCron !== null && item.revenueCron !== 'Failed');
            

            if (mainData.length > 1) {
                timezone.current = mainData[0].accountTimezone;
                accountStatus.current = mainData[0].accountStatus;
                cronStatus.current = mainData[0].cronStatus;

                fbCron.current = getFbValue[0]?.fbCron ? getFbValue[0].fbCron : 'Failed';
                revenueCron.current = getRevenueValue[0]?.revenueCron ? getRevenueValue[0].revenueCron : 'Failed';

                maxHour.current = findMaxHour(mainData);
                maxNetworkHour.current = getMaxHour(mainData);
            }
            setLiveFixedFooter([
                {
                    campaignName: 'Total',
                    actions: "",
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
            setRowData(filteredData);
            newRowData.current = filteredData;
            fetchData.status === 200 && console.log("Success") ;
            fetchData.status === 200 && setApiStatus(false) ;
            // setInitialRowData(filteredData);
            // setTrue(false);
            setLoading(false);
       }
       catch(error){
            setApiStatus(true);
            setLoading(false);
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
    const onCellClickedLive = (event) => {
        if (event.colDef.field === 'adsetname') {
            const value = event.value;
            if (value !== undefined) {
                const url = `/LiveHistory/LiveAdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                window.open(url, '_blank', 'noopener,noreferrer');
                // console.log(`Adset clicked: ${value}`);
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
    // const handleOk = () => {
    //     if (!newColumnName || !formula) {
    //         message.error('Please fill in all fields.');
    //         return;
    //     }

    //     const lowerCaseFormula = formula.toLowerCase();

    //     try {
    //         // Define the new column definition
    //         const newColumnDef = {
    //             headerName: newColumnName,
    //             field: newColumnName.toLowerCase(),
    //             valueGetter: (params) => {
    //                 if (!params.data) return null;
    //                 try {
    //                     const originalKeys = Object.keys(params.data);
    //                     const sanitizedKeys = originalKeys.map(key => key.replace(/[^a-zA-Z_$0-9]/g, '_'));
    //                     const values = Object.values(params.data);

    //                     const keyMapping = {};
    //                     sanitizedKeys.forEach((key, index) => {
    //                         keyMapping[key] = originalKeys[index];
    //                     });

    //                     // Constructing the function safely using sanitized keys
    //                     const func = new Function(...sanitizedKeys, `return ${lowerCaseFormula}`);

    //                     // Map the values back to their original keys for function execution
    //                     const mappedValues = sanitizedKeys.map(key => params.data[keyMapping[key]]);
    //                     return func(...mappedValues);
    //                 } catch (error) {
    //                     console.error('Error evaluatings formula:', error);
    //                     return null;
    //                 }
    //             },
    //             sortable: true,
    //             filter: true,
    //             aggFunc: (params) => {
    //                 try {
    //                     const values = params.values;
    //                     const sum = values.reduce((acc, value) => acc + (value || 0), 0);

    //                     return sum; // Replace with other aggregation logic if needed
    //                 } catch (error) {
    //                     console.error('Error in aggregation function:', error);
    //                     return null;
    //                 }
    //             },
    //             cellStyle: { backgroundColor: 'skyblue' },
    //             headerCellStyle: { backgroundColor: 'skyblue', color: 'black' }
    //         };

    //         // Update the column definitions
    //         setColumnDefs((prevDefs) => [...prevDefs, newColumnDef]);
    //         columnDefs1.current = [...columnDefs1.current, newColumnDef];
    //         columnDefs2.current = [...columnDefs2.current, newColumnDef];
    //         columnDefs3.current = [...columnDefs3.current, newColumnDef];

    //         // Common function to update data
    //         const updateData = (prevData) => {
    //             return prevData.map((row) => {
    //                 const updatedRow = { ...row };
    //                 try {
    //                     const originalKeys = Object.keys(row);
    //                     const sanitizedKeys = originalKeys.map(key => key.replace(/[^a-zA-Z_$0-9]/g, '_'));
    //                     const values = Object.values(row);
    //                     // console.log(values, "values1");

    //                     const keyMapping = {};
    //                     sanitizedKeys.forEach((key, index) => {
    //                         keyMapping[key] = originalKeys[index];
    //                     });

    //                     const func = new Function(...sanitizedKeys, `return ${lowerCaseFormula}`);
    //                     const mappedValues = sanitizedKeys.map(key => row[keyMapping[key]]);
    //                     updatedRow[newColumnName.toLowerCase()] = func(...mappedValues);
    //                 } catch (error) {
    //                     console.error('Error evaluating formula for data update:', error);
    //                     updatedRow[newColumnName.toLowerCase()] = null;
    //                 }
    //                 return updatedRow;
    //             });
    //         };

    //         // Update data with the new column
    //         setRowData((prevData) => updateData(prevData));
    //         // setdailyData((prevData) => updateData(prevData));
    //         // setCampaignData((prevData) => updateData(prevData));
    //         // setKeywordData((prevData) => updateData(prevData));
    //         // setSystem1KeywordData((prevData) => updateData(prevData));

    //     } catch (error) {
    //         console.error('Error adding column:', error);
    //     }
    //     setNewColumnName('');
    //     setFormula('');
    //     setIsModalOpen(false);
    // };
    // const handleCancel = () => {
    //     setIsModalOpen(false);
    // };
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
    const gridOptions = {
        onColumnMoved: (params) => debouncedHandleColumnMove(params, 'grid1'),
        defaultColDef: {
            suppressMenu: true,
            headerClass: "custom-header" // Apply to all columns by default

        }
    };
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
    
    return(
                    <div style={{ height: "100%", marginBottom: '20px',overflow: "visible" }}>
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
                                        </Col>
                                        <Col xs={24} sm={24} md={4} lg={2} style={{ flex: '0.2 0 auto' }}>
                                            <Tooltip title="Export to CSV">
                                                <Button type="primary" style={{ backgroundColor: '#C7F39A', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined />} onClick={onBtExport1} />
                                            </Tooltip>
                                        </Col>
                                    </Row>

                                    <AgGridReact
                                        ref={gridRef}
                                        rowData={memorizedRowData}
                                        rowSelection='multiple'
                                        columnDefs={memorizedColumnDef}
                                        defaultColDef={{ ...defaultColDef, suppressMenu: true }}
                                        onCellClicked={onCellClickedLive}
                                        pagination={true}
                                        paginationPageSize={100}
                                        paginationPageSizeSelector={[20, 40, 60, 80, 100]}
                                        suppressAggFuncInHeader={true}
                                        // domLayout="normal"
                                        // groupIncludeTotalFooter={rowData.length > 0 ? true : false}
                                        // groupIncludeFooter={rowData.length > 0 ? true : false}
                                        autoGroupColumnDef={autoGroupColumnDefLive}
                                        onGridReady={(params) => onGridReady(params, 'grid1', gridRef)}
                                        gridOptions={gridOptions}
                                        frameworkComponents={{ GroupCellRenderer }}
                                        groupDisplayType='multipleColumns'
                                        // rowGroupPanelShow='always'
                                        // onFilterChanged={onFilterChanged} // Use the custom filter handler
                                        pinnedBottomRowData={liveFixedFooter}
                                        getRowStyle={params => {
                                            if (params.node.rowPinned) {
                                                return {
                                                    fontWeight: 'bold',
                                                    backgroundColor: theme === "dark" ? '#1a1918' : '#fff', // Dark mode background should be dark, light mode should be light
                                                    color: theme === "dark" ? '#fff' : '#000',           // Text color should contrast with the background
                                                };
                                            }

                                            return null;
                                        }}

                                        getMainMenuItems={getMainMenuItems}
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
                                                if (node.data && node.data.campaignname) {
                                                    const normalizedCampaign = node.data.campaignname.trim().toLowerCase();
                                        
                                                    // Apply search and filter conditions
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
                                                    actions: "",
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

                                            setLiveFixedFooter(updatedFooter);
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
                            /> : (startDate !== endDate ? <Result
                                    className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                    icon={<SmileOutlined />}
                                    title={`No LiveData for ${newaccount} from ${startDate} to ${endDate}`}
                                // extra={<Button type="primary">Next</Button>}
                                /> : <Result
                                    className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                    icon={<SmileOutlined />}
                                    title={`No LiveData for ${newaccount} to ${startDate}`}
                                // extra={<Button type="primary">Next</Button>}
                                />)}
                            </div>}
                        </div>
                    </div>
    );
};

export default LiveReports;
