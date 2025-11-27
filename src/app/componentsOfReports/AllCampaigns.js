"use client"
import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import React from 'react';
import moment from 'moment-timezone';
import { Input, Button, Pagination, Row, Col, Typography, Result, Modal, message, Switch, Badge } from 'antd';
import { DownloadOutlined, ArrowLeftOutlined, ArrowRightOutlined, SmileOutlined, CopyOutlined, EditOutlined, MessageOutlined, PauseCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined, NumberOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { Space } from 'antd';
import 'antd/dist/reset.css';
import '../globals.css';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useTokenContext } from '../components/parent';

const SearchFilters = React.lazy(() => import('./SearchFilters'));

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
    "FB_Sedo": "Facebook_Sedo",
    "FB_Inmobi": "Facebook_Inmobi",
    "FB_InuvoPrism": "Facebook_InuvoPrism"
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


const AllCampaigns = ({ campaignStatusFilter, handleChangeInput, handleBlur, onClickRefresh, startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, fetchData, campaignComments, Camapignlevelstatus, changeRRefrst, debouncedHandleColumnMove, userdetails, refreshComments, refreshpage, getMainMenuItems, toggleStatus, handleChangeToggle, accountsAccess }) => {
    const { theme } = useTokenContext();
    const { apiClient } = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

    const [campaignData, setCampaignData] = useState([]);

    const [apiStatus, setApiStatus] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);


    const [pageSize, setPageSize] = useState(1);

    const [fixedFooter, setFixedFooter] = useState([]);

    const [isLoading2, setLoading2] = useState(true);

    const [selectedCells, setSelectedCells] = useState([]);
    const [firstSelectedCell, setFirstSelectedCell] = useState(null);

    const timezone = useRef();

    const gridRef2 = useRef();

    const newCampaignData = useRef();

    const totalItems = useRef();

    const prevPageRef = useRef(pageSize);
    const prevInputRef = useRef(inputValue);

    const memorizedColumnDef2 = useMemo(() => columnDefs.current, [columnDefs.current]);
    const memorizedCampaignsData = useMemo(() => campaignData?.filter((each) => {
        const normalizedCampaign = each?.campaignname?.trim().toLowerCase();
        const normalizedInput = inputValue?.trim().toLowerCase();
        return (
            normalizedCampaign?.startsWith(normalizedInput) ||
            normalizedCampaign?.includes(normalizedInput) ||
            normalizedCampaign?.endsWith(normalizedInput)
        );
    }
    ), [campaignData, inputValue]);

    useEffect(() => {

        setFixedFooter([
            {
                campaignName: 'Total',
                actions: '',
                spend: memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2),
                revenue: memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2),
                profit: memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2),
                margin: (
                    (memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) /
                        memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0)) *
                    100
                ).toFixed(2),
                rpc: (
                    memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.rpc || 0), 0) /
                    memorizedCampaignsData.length
                ).toFixed(2),
                cpl: (
                    memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.cpl || 0), 0) /
                    memorizedCampaignsData.length
                ).toFixed(2),
                ncpl: (
                    memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.ncpl || 0), 0) /
                    memorizedCampaignsData.length
                ).toFixed(2),
                fbleads: memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0),
                conversions: memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0),
                fmargin: (
                    (memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) /
                        memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) *
                    100
                ).toFixed(2),
                roi: (
                    ((memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) -
                        memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) /
                        memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) *
                    100
                ).toFixed(2),
                cpc: (
                    memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr?.cpc || 0), 0) /
                    memorizedCampaignsData.length
                ).toFixed(2),
                fbclicks: memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0),
                cpclinkclicks: (
                    memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks || 0), 0) /
                    memorizedCampaignsData.length
                ).toFixed(2),
                fblinkclicks: memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0),
                impressions: memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0),
                ctr: (
                    (memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) /
                        memorizedCampaignsData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0)) *
                    100
                ).toFixed(2),
            },
        ]);
    }, [memorizedCampaignsData]);

    const onBtExport = (gridRef, text) => {
        const Details = {
            network: newRevenuePratner,
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
        const updateDetails = async () => {
            await apiClient.post('/UserExportActivities/', { Details });
        }
        updateDetails();
    };

    const autoGroupColumnDef2 = {
        headerName: 'Campaign name',
        minWidth: 450,
        pinned: 'left',
        unSortIcon: true,
        sortable: true,
        headerClass: 'ag-center-header',

        comparator: (campaignA, campaignB) => {
            if (!campaignA) return 1;
            if (!campaignB) return -1;
            const getPinStatusForCampaign = (campaignName) => {
                const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                return relatedComment ? relatedComment.pinned : false;
            };
            const isPinnedA = getPinStatusForCampaign(campaignA);
            const isPinnedB = getPinStatusForCampaign(campaignB);

            if (isPinnedA !== isPinnedB) {
                return isPinnedA ? -1 : 1;  // Pinned campaigns should come first
            }
            return campaignA.localeCompare(campaignB);
        },

        cellRendererParams: {
            suppressCount: false, // Allow count to be shown
            innerRenderer: (params) => {
                // if (params.node.footer) {
                //     return 'Total'; // Custom footer label
                // }
                if (params.node.footer || params.node.rowPinned) {
                    return 'Total'; // Or just '' if you prefer no label
                }
                // Handle ungrouped rows — skip icons and render plain name
                if (!params.node.group) {
                    return params.value || ''; // Just the campaign name
                }

                // const firstColumnValue = params.node.key; // This should give you the campaign name
                const firstColumnValue = (() => {
                    if (params.node.childrenAfterGroup?.length > 0) {
                        return params.node.childrenAfterGroup[0]?.data?.campaignname || params.node.key;
                    }
                    return params.node.key; // fallback to campaignid
                })();
                const campaignName = firstColumnValue;

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
                            campaignname: logData.campaignname,
                            comment: logData.comment,
                            Account: logData.Account,
                            adsetid: logData.adsetid,
                            campaignid: logData.campaignid,
                            status: true
                        });
                        console.log('Response from server (edited comment):', response.data);
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
                            refreshComments(newaccount);

                            message.success('Comment deleted successfully!');
                        } else {
                            message.error('Failed to delete the comment. Please try again.');
                        }
                    } catch (error) {
                        console.error('Error deleting the comment:', error);
                        message.error('Failed to delete the comment. Please try again.');
                    }
                };

                const handleOk = async () => {
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
                            response = await apiClient.post('/Pin', {
                                campaignname: campaignName,
                                Account: newaccount,
                                campaignid: campaignid,
                                adsetid: adsetid,
                                userPin: userdetails?.email,
                                comment: comment || ''
                            });
                            // changeRRefrst();
                            if (response.status === 200) {
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
                            if (response.status === 200) {
                                refreshComments(newaccount);
                            }

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
                        const sortedComments = updatedComments.sort((a, b) => b.pinned - a.pinned);
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
                                                <PauseCircleOutlined style={{ color: 'orange', fontSize: '18px' }} className='black-icon-pause' />
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
                            <Tooltip
                                // title={relatedComment || 'No comment available'}
                                title={
                                    <div>
                                        <div>{relatedComment || 'No comment available'}</div>
                                        <div>
                                            {editUserANdTime
                                                ? moment(editUserANdTime?.editedTime, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A")
                                                : ""}
                                        </div>
                                    </div>
                                }
                            >
                                <MessageOutlined
                                    className={theme === "dark" ? "black-icon-comment" : 'Message'}
                                    style={{
                                        cursor: 'pointer',
                                        marginLeft: '10px',
                                        marginRight: '10px',
                                        color: '#4CAF50'
                                    }}
                                    onClick={handleEditClick} // Open modal directly on click
                                />
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
                                window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                        >
                            {valueWithCount}
                        </span>
                        <Modal
                            title={firstColumnValue}
                            visible={isModalVisible}
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            onOk={handleOk} // Default Ok button functionality
                            onCancel={handleCancel} // Default Cancel button functionality
                            footer={[
                                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                    <div style={{ display: 'flex', flexDirection: "column" }}>
                                        <span key="info" style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black", fontWeight: "bold" }}>
                                            Last Edited Time:
                                        </span>
                                        <span key="info1" style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black", fontWeight: "bold" }}>
                                            {editUserANdTime ? moment(editUserANdTime?.editedTime, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A") : ""}
                                        </span>

                                    </div>
                                    <div>
                                        <Button
                                            key="delete"
                                            type="danger"
                                            onClick={handleDelete}
                                            style={{ marginRight: 'auto', border: "1px solid #e3e3da" }} // Push Delete button to the far left
                                        >
                                            Delete
                                        </Button>
                                        <Button key="cancel" onClick={handleCancel} style={{ marginLeft: "4px" }}>
                                            Cancel
                                        </Button>
                                        <Button key="ok" onClick={handleOk} style={{ marginLeft: "4px", backgroundColor: "#91C25F" }}>
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

    // const functionCall3 = async () => {
    //     try{
    //         setLoading2(true);
    //         setCampaignData([]);
    //         const fetchData = await apiClient.get(`http://localhost:8000/AllCampaigns?accountNumber=${newaccount}&timezone=${newtime}&network=${newtworkCollections[newRevenuePratner]}&campaignName=${inputValue}`);

    //         // &page=${pageSize}&limit=100

    //         // console.log(fetchData, "f1");
    //         const mainData = fetchData.data.items;
    //         timezone.current = mainData[0].accountTimezone;

    //         const url = `https://hello/AllCampaigns?accountNumber=${newaccount}&timezone=${newtime}&network=${newtworkCollections[newRevenuePratner]}&page=${pageSize}&limit=100`;

    //         const specifiedTimeZone = selectTimezone[newtime];
    //         const filteredData = mainData && mainData.length > 0 ?
    //             mainData.map((eachData) => {
    //                 let revenueData;
    //                 if (eachData.estimated_revenue === 0) {
    //                     revenueData = '0.00';
    //                 }
    //                 else if (eachData.estimated_revenue === undefined) {
    //                     revenueData = '0.00';
    //                 }
    //                 else {
    //                     revenueData = parseFloat(eachData.estimated_revenue).toFixed(2);
    //                 }
    //                 const profit = (revenueData - eachData.spend).toFixed(2);
    //                 let margin;
    //                 if (revenueData === '0.00') {
    //                     margin = "0";
    //                 }
    //                 else {
    //                     margin = `${Math.round((((revenueData - eachData.spend) / revenueData) * 100) * 100) / 100}%`;
    //                 }
    //                 const rpc = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((revenueData / eachData.conversions) * 100) / 100;

    //                 let cpl;
    //                 if (eachData.fbLeads == 0) {
    //                     cpl = 0;
    //                 } else {
    //                     cpl = Math.round((eachData.spend / eachData.fbLeads) * 100) / 100;
    //                 }
    //                 const ncpl = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((eachData.spend / eachData.conversions) * 100) / 100;
    //                 // console.log(eachData[specifiedTimeZone],"time");
    //                 const fbLClicks = parseInt(eachData.fbLinkClicks, 10);
    //                 const spend = parseFloat(eachData.spend);
    //                 const cpcLinkClicks = isNaN(fbLClicks) || fbLClicks === 0 ? 0 : Math.round((spend / fbLClicks)*100)/100;
    //                 return (
    //                     {
    //                         campaignname: eachData.campaign_name,
    //                         adsetname: eachData.adsetName,
    //                         date: eachData[specifiedTimeZone],
    //                         spend: parseFloat(eachData.spend).toFixed(2),
    //                         revenue: revenueData,
    //                         profit: profit,
    //                         fbleads: eachData.fbLeads,
    //                         conversions: eachData.conversions,
    //                         cpc: eachData.cpc,
    //                         cpclinkclicks: cpcLinkClicks,
    //                         fbclicks: eachData.fbClicks,
    //                         fblinkclicks: eachData.fbLinkClicks,
    //                         impressions: eachData.impressions,
    //                         campaignid: eachData.campaign_id,
    //                         adsetid: eachData.adset_id,
    //                         actions: '...',
    //                         adid: "",
    //                         adname: "",
    //                     }
    //                 )
    //             })
    //             : null;
    //         totalItems.current = fetchData.data.totalItems;
    //         // console.log(mainData);
    //         setCampaignData(filteredData);
    //         setFixedFooter([
    //             {
    //                 campaignName: 'Total',
    //                 actions: '',
    //                 spend: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
    //                 revenue: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
    //                 profit: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
    //                 margin: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
    //                 rpc: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / filteredData?.length).toFixed(2)),
    //                 cpl: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / filteredData?.length).toFixed(2)),
    //                 ncpl: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / filteredData?.length).toFixed(2)),
    //                 fbleads: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
    //                 conversions: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
    //                 fmargin: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
    //                 roi: parseFloat(((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
    //                 cpc: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / filteredData?.length).toFixed(2)),
    //                 fbclicks: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
    //                 cpclinkclicks: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks), 0) / filteredData?.length).toFixed(2)),
    //                 fblinkclicks: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0).toFixed(2)),
    //                 impressions: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
    //                 ctr: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
    //             }
    //         ]);
    //         newCampaignData.current = filteredData;

    //         fetchData.status === 200 && setApiStatus(false) ;
    //         // setTrue(false);
    //         setLoading2(false);
    //     }
    //     catch(error){
    //         setLoading2(false);
    //         setApiStatus(true) ;
    //     }
    // }

    const statusByCampaignId = useMemo(() => {
        const m = new Map();
        Camapignlevelstatus?.forEach(c => {
            const id = String(c.campaign_id ?? '').trim();
            if (id) m.set(id, (c.status || 'ACTIVE').toUpperCase());
        });
        return m;
    }, [Camapignlevelstatus]);

    const functionCall3 = async (fetchData) => {
        try {
            setLoading2(true);
            setCampaignData([]);

            // const fetchData = await apiClient.get(
            //     `/AllCampaigns?accountNumber=${newaccount}&timezone=${newtime}&network=${newtworkCollections[newRevenuePratner]}&campaignName=${inputValue}`
            // );

            const mainData = fetchData.items || [];

            if (mainData.length > 0) {
                timezone.current = mainData[0].accountTimezone;
            }

            const specifiedTimeZone = selectTimezone[newtime];
            const filteredData = mainData.map((eachData) => {
                const revenueData = eachData.estimated_revenue
                    ? parseFloat(eachData.estimated_revenue).toFixed(2)
                    : '0.00';

                const profit = (revenueData - eachData.spend).toFixed(2);

                const margin =
                    revenueData === '0.00'
                        ? '0'
                        : `${Math.round(((revenueData - eachData.spend) / revenueData) * 10000) / 100}%`;

                const rpc =
                    eachData.conversions && eachData.conversions !== 0
                        ? Math.round((revenueData / eachData.conversions) * 100) / 100
                        : 0;

                const cpl =
                    eachData.fbLeads && eachData.fbLeads !== 0
                        ? Math.round((eachData.spend / eachData.fbLeads) * 100) / 100
                        : 0;

                const ncpl =
                    eachData.conversions && eachData.conversions !== 0
                        ? Math.round((eachData.spend / eachData.conversions) * 100) / 100
                        : 0;

                const sanitizedCPC = parseFloat(eachData.cpc);
                const cpc = isNaN(sanitizedCPC) ? 0 : sanitizedCPC;
                const fbLClicks = parseInt(eachData.fbLinkClicks, 10);
                const spend = parseFloat(eachData.spend);
                const cpcLinkClicks =
                    fbLClicks && fbLClicks !== 0
                        ? Math.round((spend / fbLClicks) * 100) / 100
                        : 0;

                return {
                    campaignname: eachData.campaign_name,
                    adsetname: eachData.adsetName,
                    date: eachData[specifiedTimeZone],
                    spend: spend.toFixed(2),
                    revenue: revenueData,
                    profit,
                    fbleads: eachData.fbLeads,
                    conversions: eachData.conversions,
                    cpc: cpc,
                    cpclinkclicks: cpcLinkClicks,
                    fbclicks: eachData.fbClicks,
                    fblinkclicks: eachData.fbLinkClicks,
                    impressions: eachData.impressions,
                    campaignid: eachData.campaign_id,
                    adsetid: eachData.adset_id,
                    actions: '...',
                    adid: "",
                    adname: "",
                    from: "",
                    profitloss: "",
                    M_tq: "",
                    D_tq: "",
                };
            });

            const normFilter = (campaignStatusFilter || 'ALL').toUpperCase();

            const filteredByStatus =
                normFilter === 'ALL'
                    ? filteredData
                    : filteredData.filter(item => {
                        const status = (statusByCampaignId.get(String(item.campaignid).trim()) || 'ACTIVE').toUpperCase();
                        return status === normFilter;
                    });


            setCampaignData(filteredByStatus);

            setFixedFooter([
                {
                    campaignName: 'Total',
                    actions: '',
                    spend: filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2),
                    revenue: filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2),
                    profit: filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2),
                    margin: (
                        (filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) /
                            filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0)) *
                        100
                    ).toFixed(2),
                    rpc: (
                        filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.rpc || 0), 0) /
                        filteredByStatus.length
                    ).toFixed(2),
                    cpl: (
                        filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.cpl || 0), 0) /
                        filteredByStatus.length
                    ).toFixed(2),
                    ncpl: (
                        filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.ncpl || 0), 0) /
                        filteredByStatus.length
                    ).toFixed(2),
                    fbleads: filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0),
                    conversions: filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0),
                    fmargin: (
                        (filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) /
                            filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) *
                        100
                    ).toFixed(2),
                    roi: (
                        ((filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) -
                            filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) /
                            filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) *
                        100
                    ).toFixed(2),
                    cpc: (
                        filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr?.cpc || 0), 0) /
                        filteredByStatus.length
                    ).toFixed(2),
                    fbclicks: filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0),
                    cpclinkclicks: (
                        filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks || 0), 0) /
                        filteredByStatus.length
                    ).toFixed(2),
                    fblinkclicks: filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0),
                    impressions: filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0),
                    ctr: (
                        (filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) /
                            filteredByStatus.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0)) *
                        100
                    ).toFixed(2),
                },
            ]);

            // setCampaignData(filteredData);

            // setFixedFooter([
            //     {
            //         campaignName: 'Total',
            //         actions: '',
            //         spend: filteredData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2),
            //         revenue: filteredData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2),
            //         profit: filteredData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2),
            //         margin: (
            //             (filteredData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) /
            //                 filteredData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0)) *
            //             100
            //         ).toFixed(2),
            //         rpc: (
            //             filteredData.reduce((acc, curr) => acc + parseFloat(curr.rpc || 0), 0) /
            //             filteredData.length
            //         ).toFixed(2),
            //         cpl: (
            //             filteredData.reduce((acc, curr) => acc + parseFloat(curr.cpl || 0), 0) /
            //             filteredData.length
            //         ).toFixed(2),
            //         ncpl: (
            //             filteredData.reduce((acc, curr) => acc + parseFloat(curr.ncpl || 0), 0) /
            //             filteredData.length
            //         ).toFixed(2),
            //         fbleads: filteredData.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0),
            //         conversions: filteredData.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0),
            //         fmargin: (
            //             (filteredData.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) /
            //                 filteredData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) *
            //             100
            //         ).toFixed(2),
            //         roi: (
            //             ((filteredData.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) -
            //                 filteredData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) /
            //                 filteredData.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) *
            //             100
            //         ).toFixed(2),
            //         cpc: (
            //             filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpc || 0), 0) /
            //             filteredData.length
            //         ).toFixed(2),
            //         fbclicks: filteredData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0),
            //         cpclinkclicks: (
            //             filteredData.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks || 0), 0) /
            //             filteredData.length
            //         ).toFixed(2),
            //         fblinkclicks: filteredData.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0),
            //         impressions: filteredData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0),
            //         ctr: (
            //             (filteredData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) /
            //                 filteredData.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0)) *
            //             100
            //         ).toFixed(2),
            //     },
            // ]);

            newCampaignData.current = filteredData;

            setApiStatus(false);
            setLoading2(false);
        } catch (error) {
            setLoading2(false);
            setApiStatus(true);
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
    const onCellClickedAllCampaigns = (event) => {
        if (event.colDef.field === 'adsetname') {
            const value = event.value;
            if (value !== undefined) {
                const url = `/AllCampaigns/AdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
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
    // const onGridReady = (params, gridId) => {
    //     gridRef2.current = params;

    //     params.api.applyColumnState({ 
    //         state: columnDefs || [], 
    //         applyOrder: true 
    //     });
    // };

    // // Effect to handle event listener based on toggleStatus
    // useEffect(() => {
    //     if (!gridRef2.current) return; // Ensure gridRef exists

    //     const gridApi = gridRef2.current.api;
    //     const handleDragStopped = (e) => debouncedHandleColumnMove(e, 'grid3');

    //     if (toggleStatus) {
    //         gridApi.addEventListener('dragStopped', handleDragStopped);
    //     } else {
    //         gridApi.removeEventListener('dragStopped', handleDragStopped);
    //     }

    //     return () => {
    //         gridApi.removeEventListener('dragStopped', handleDragStopped); // Cleanup on unmount
    //     };
    // }, [toggleStatus]);

    const onGridReady = (params, gridId, gridRef) => {
        gridRef.current = params;
        params.api.applyColumnState({ state: columnDefs, applyOrder: true });
        params.api.addEventListener('dragStopped', (e) => debouncedHandleColumnMove(e, gridId));
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

    const handlePageClick = (page, pageSize) => {
        // console.log(`Clicked page: ${page}, Page size: ${pageSize}`);
        setLoading2(true);
        setPageSize(page);
        // Add your custom onClick functionality here
    };

    const gridOptions2 = useMemo(() => ({
        onColumnMoved: (params) => {
            // if (toggleStatus) {
            debouncedHandleColumnMove(params, 'grid3');
            // }
        },
        defaultColDef: {
            suppressMenu: true,
            headerClass: "custom-header" // Apply to all columns by default
        },
        ensureDomOrder: false
    }), []);

    const itemRender = (_, type, originalElement) => {
        if (type === 'prev') {
            return <a><ArrowLeftOutlined /></a>;
        }
        if (type === 'next') {
            return <a><ArrowRightOutlined /></a>;
        }
        return originalElement;
    };

    const handleReFetchData = (fetchData) => {
        functionCall3(fetchData);
        setApiStatus(false);
    }

    useEffect(() => {
        if (!fetchData) return;
        functionCall3(fetchData);   // <-- pass it
    }, [fetchData, campaignStatusFilter, Camapignlevelstatus]);

    useEffect(() => {
        if (refreshpage === "Refresh3") {
            handleReFetchData(fetchData);
        }
    }
        , [refreshpage, fetchData]);

    // useEffect(() => {
    //     if(inputValue){
    //         setPageSize(1);
    //     }
    //     functionCall3();
    // }, [pageSize, inputValue]);

    useEffect(() => {
        if (prevInputRef.current === '' && inputValue !== '') {
            prevPageRef.current = pageSize;
            setPageSize(1);
        }
        else if (prevInputRef.current !== '' && inputValue === '') {
            setPageSize(prevPageRef.current);
        }
        prevInputRef.current = inputValue;
    }, [inputValue]);

    useEffect(() => {
        functionCall3(fetchData);
    }, [inputValue, fetchData]);

    const ids = Array.isArray(newaccount)
        ? newaccount
        : (newaccount ? [newaccount] : []);

    return (
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
                    <div
                        className={`ag-theme-alpine ag-container ${gridThemeClass}`}
                    // style={{
                    //     width: '100%',
                    //     // borderRadius: 12,
                    //     backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
                    //     padding: 10,
                    //     height: '100%',
                    //     boxShadow:
                    //     theme === 'dark'
                    //         ? '0 1px 3px rgba(0,0,0,0.6)'
                    //         : '0 1px 6px rgba(0,0,0,0.08)',
                    // }}
                    >
                        <Row style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap', backgroundColor: theme === "dark" && "#4d4d4d" }}>
                            <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                                <Space align="center" className='daily-container' style={{ width: '150px' }}>
                                    <div class="blinking-circle-3"></div>
                                    <Text style={{ paddingLeft: '3px', fontSize: '15px', width: '100px', color: theme === "dark" && "white" }}>Campaigns</Text>
                                </Space>
                            </Col>
                            <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                {/* <Text style={{ color: theme === "dark" && "white" }}>Id: {newaccount}</Text> */}
                                {ids.length <= 1 ? (
                                    // Single (or none) → plain text
                                    <Text style={{ color: theme === "dark" ? "white" : undefined }}>
                                        Id: {ids[0] ?? "-"}
                                    </Text>
                                ) : (
                                    // Multiple → only an icon; hover shows selected accounts
                                    <Tooltip
                                        title={
                                            <div style={{ maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
                                                {ids.map((id, i) => {
                                                    const getAccountObject = accountsAccess.find(item => item.accountNumber === id)
                                                    return (<div
                                                        key={`${id}-${i}`}
                                                        style={{
                                                            padding: "4px 6px",
                                                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                                                            fontSize: 12,
                                                            color: theme === "dark" ? "#ddd" : "#333",
                                                            display: "flex",
                                                            flexDirection: "column"
                                                        }}
                                                    >
                                                        <div>{id}</div>
                                                        <div>{getAccountObject?.accountName}</div>
                                                    </div>)
                                                })}
                                            </div>
                                        }
                                        overlayInnerStyle={{
                                            maxWidth: 320,
                                            background: theme === "dark" ? "#1f1f1f" : '#fff',
                                            color: theme === "dark" ? "#fff" : '#000'
                                        }}
                                    >
                                        <Badge count={ids.length} size="small" offset={[0, 2]}>
                                            <NumberOutlined
                                                style={{
                                                    fontSize: 18,
                                                    cursor: "pointer",
                                                    color: theme === "dark" ? "#9ad" : "#1677ff"
                                                }}
                                            />
                                        </Badge>
                                    </Tooltip>
                                )}
                            </Col>
                            <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                <Text style={{ color: theme === "dark" && "white" }}>Name: {newAccountName}</Text>
                            </Col>
                            <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                <Text style={{ color: theme === "dark" && "white" }}>Time zone: {timezone.current}</Text>
                            </Col>
                            {/* <Col>
                                            <Tooltip 
                                                title={ !toggleStatus ? "Turn on toggle to column re-arrangement" : "Turn off to stop column re-arrangement"} 
                                                mouseEnterDelay={0} // Tooltip appears after 1 second
                                            >
                                                <Switch checked={toggleStatus} onChange={() => handleChangeToggle()} style={{marginLeft:'10px', marginRight:'10px', backgroundColor: toggleStatus && "#91C25F" }}/>
                                            </Tooltip>
                                        </Col> */}
                            <Col xs={24} sm={24} md={4} lg={2} style={{ flex: '0.2 0 auto' }}>
                                {/* <Tooltip title="Export to CSV"> */}
                                <Button type="primary" style={{ backgroundColor: '#91C25F', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined className="black-icon" />} onClick={() => onBtExport(gridRef2, "AllCampaigns")} />
                                {/* </Tooltip> */}
                            </Col>
                        </Row>

                        <div className='table-container' style={{ height: '100%' }}>
                            <AgGridReact
                                ref={gridRef2}
                                className='custom-grid'
                                rowHeight={35}
                                rowData={memorizedCampaignsData}
                                columnDefs={memorizedColumnDef2}
                                onCellClicked={onCellClickedAllCampaigns}
                                autoGroupColumnDef={autoGroupColumnDef2}
                                defaultColDef={defaultColDef}
                                // groupDisplayType='multipleColumns'
                                groupDisplayType={null}
                                suppressAggFuncInHeader={true}
                                groupRowRenderer={GroupRowRenderer}
                                enableCharts={true}
                                        enableRangeSelection={true}
                                    
                                onGridReady={(params) => {
                                    onGridReady(params, 'grid3', gridRef2);
                                    window.__top5 = params.api;
                                    params.api.refreshCells(); // Refresh cells to apply the theme dynamically
                                }}

                                pagination={true} // Enable built-in pagination
                                paginationPageSize={200} // S
                                paginationPageSizeSelector={[20, 40, 60, 80, 100, 150, 200]}
                                onSortChanged={(params) => {
                                    const sortedData = [];
                                    params.api.forEachNodeAfterFilterAndSort(node => {
                                        if (node.data) sortedData.push(node.data);
                                    });
                                    setCampaignData(sortedData); // Updates sorted data
                                }}

                                // onRangeSelectionChanged={onRangeSelectionChanged} // ✅ Captures range selection
                                onCellKeyDown={onCellKeyDown}
                                gridOptions={{
                                    ...gridOptions2,
                                    ensureDomOrder: false,
                                    enableCharts: true,
                                    suppressRowClickSelection: true,
                                    suppressClipboardPaste: true,
                                    enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                    enableCellTextSelection: true, // ✅ Allows text selection inside cells
                                }}
                                suppressMenuHide={true}
                                getMainMenuItems={getMainMenuItems}
                                pinnedBottomRowData={campaignData.length > 0 ? fixedFooter : []}
                                getRowStyle={params => {
                                    if (params.node.rowPinned) {
                                        return {
                                            // fontWeight: 'bold',
                                            // backgroundColor: theme === "dark" ? '#000' : '#fff', // Apply theme dynamically
                                            // color: theme === "dark" ? '#fff' : '#000',           // Apply theme dynamicallyhe
                                            height: '35px'

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
                                            actions: '',
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
                                            cpclinkclicks: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpclinkclicks), 0) / filteredData.length).toFixed(2)),
                                            fblinkclicks: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fblinkclicks), 0).toFixed(2)),
                                            impressions: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0).toFixed(2)),
                                            ctr: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0) * 100).toFixed(2))
                                        },
                                    ];

                                    setFixedFooter(updatedFooter);
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ backgroundColor: theme === "dark" && "#333" }}>
                            {apiStatus === true ?
                                <Result
                                    className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                    // icon={<SmileOutlined />}
                                    title={`API failed to fetch the data. Please click retry button to fetch the data`}
                                    extra={<Button type="primary" onClick={handleReFetchData}>Retry</Button>}
                                /> : (startDate !== endDate ? <Result
                                    className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                    icon={<SmileOutlined />}
                                    title={`No CampaignData for ${newaccount} from ${startDate} to ${endDate}`}
                                /> : <Result
                                    className={theme === 'dark' ? 'dark-result' : 'light-result'}
                                    icon={<SmileOutlined />}
                                    title={`No CampaignData for ${newaccount} to ${startDate}`}
                                />)}
                        </div>
                    </div>
                )}
            </div>
            {/* <Pagination
                            style={{ marginBottom: '12px' }}
                            total={totalItems.current}
                            pageSize={100}
                            itemRender={itemRender}
                            showSizeChanger={false}
                            showQuickJumper={false}
                            current={pageSize}
                            onChange={handlePageClick}
                        /> */}
        </div>
    );
};

export default AllCampaigns;