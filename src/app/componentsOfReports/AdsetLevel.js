import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import React from 'react';
import moment from 'moment-timezone';
import {  Input, Button, Row, Col, Typography, Result, Modal, message, Switch, Tabs, Checkbox } from 'antd';
import {  InfoCircleOutlined, DownloadOutlined, SmileOutlined, CopyOutlined, EditOutlined, MessageOutlined, PauseCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { Space } from 'antd';
import StickyBox from 'react-sticky-box';
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
    "FB_Sedo": "Facebook_Sedo",
    "FB_Inmobi": "Facebook_Inmobi",
    "FB_TonicRsoc":"Facebook_TonicRsoc"
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

const AdsetLevelReports = ({functionCallForCampaigns, context, functionCallForCommnets, startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, campaignComments, Camapignlevelstatus, changeRRefrst, debouncedHandleColumnMove, userdetails, refreshComments, refreshpage, getMainMenuItems, toggleStatus, handleChangeToggle, tabStatus, selectedAdsets, showAdsetLevel, removeSelectedAdsets, selectedCampaigns, moveToNextTab}) => {
    console.log(columnDefs, "columnDefs");
    const {theme} = useTokenContext();
    const {apiClient} = useTokenContext();
    const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
    const getRowStyleTheme = theme === 'dark' ? { backgroundColor: '#1e1e1f', color: '#ffffff' } : { backgroundColor: '#ffffff', color: '#000000' };
    const [rowData, setRowData] = useState([]);

    const [liveFixedFooter, setLiveFixedFooter] = useState([]);

    const [isLoading, setLoading] = useState(true);

    const [apiStatus, setApiStatus] = useState(false);
    

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedCells, setSelectedCells] = useState([]); // Store selected cell positions
    const [firstSelectedCell, setFirstSelectedCell] = useState(null); // Store the first selected cell
    const [activeTab, setActiveTab] = useState("1");

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
    ) : [], [rowData, inputValue, theme]);
    console.log(memorizedRowData, "memorizedRowData");
    console.log(rowData, "rowData");

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
                cpclinkclicks: parseFloat((memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks), 0) / memorizedRowData?.length).toFixed(2)),
                fbclicks: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
                fblinkclicks: parseFloat(memorizedRowData?.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0).toFixed(2)),
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
        headerName: 'Adset name',
        minWidth: 450,
        pinned: 'left',
        sortable: true, // Enable sorting
        // filter: 'agTextColumnFilter',      // Enable string filter
        // floatingFilter: false,              // Optional: show quick filter below header
        // suppressMenu: false,
        // showRowGroup: 'adsetname',
        // field: 'adsetname',

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

        cellRenderer: "agGroupCellRenderer", // ✅ Use AG Grid's built-in renderer
        cellRendererParams: {
            checkbox: true,
            suppressCount: false,
            innerRenderer: (params) => {
                if (params.node.footer) {
                    return 'Total';
                }
                // console.log(params.value, "value");

                const firstColumnValue = params.node.key;  // campaign name
                const campaignName = params.node.key;

                let campaignid, adsetid;

                if (params.node.group && Array.isArray(params.node.childrenAfterGroup) && params.node.childrenAfterGroup.length > 0) {
                    const firstChild = params.node.childrenAfterGroup[0]?.data;  // Safe access with optional chaining
                
                    if (firstChild) {  // Ensure firstChild is not undefined before accessing properties
                        campaignid = firstChild.campaignid ?? null;  // Use null-safe access
                        adsetid = firstChild.adsetid ?? null;
                    } else {
                        console.log("First child data is undefined", params.node.childrenAfterGroup[0]);
                    }
                } else if (params.data) {
                    campaignid = params.data.campaignid ?? null;
                    adsetid = params.data.adsetid ?? null;
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
                // console.log(editUserANdTime);

                const [tooltipText, setTooltipText] = useState("Click to Copy");
                const [isModalVisibles, setIsModalVisibles] = useState(false);
                const [isAdsetModalVisibles, setIsAdsetModalVisibles] = useState(false);
                const [selectedAdset, setSelectedAdset] = useState(null); // store adid when switch clicked
                // const [switchOn, setSwitchOn] = useState(false); // control toggle state
                const [nextChecked, setNextChecked] = useState(false); // what user clicked
                const [comment, setComment] = useState(relatedComment || '');
                const [pinned, setPinned] = useState(getPinStatusForCampaign(campaignName));

                // const commentForCampaign = campaignComments.find(
                //     obj => obj.campaignid === campaignid
                // );

                // Default to ACTIVE if not defined
                // const [switchOn, setSwitchOn] = useState(
                //     commentForCampaign?.AdsetLevel
                //     ? commentForCampaign.AdsetLevel.adset_id === adsetid &&
                //         commentForCampaign.AdsetLevel.status === "ACTIVE"
                //     : true // Default to ACTIVE if AdsetLevel not found
                // );                
                    
                // useEffect(() => {
                //     const updated = campaignComments.find(obj => obj.campaignid === campaignid);
                //     const adsetMatch =
                //       updated?.AdsetLevel?.adset_id === adsetid &&
                //       updated?.AdsetLevel?.status === "ACTIVE";
                  
                //     // setSwitchOn(adsetMatch);
                //     setSwitchOn(updated?.AdsetLevel ? adsetMatch : true);
                // }, [campaignComments, campaignid, adsetid]);

                const [switchOn, setSwitchOn] = useState(true); // default to ACTIVE

                useEffect(() => {
                const commentForCampaign = campaignComments.find(obj => obj.campaignid === campaignid);

                let matchedAdset = null;

                if (Array.isArray(commentForCampaign?.AdsetLevel)) {
                    matchedAdset = commentForCampaign.AdsetLevel.find(a => a.adset_id === adsetid);
                } else if (commentForCampaign?.AdsetLevel?.adset_id === adsetid) {
                    matchedAdset = commentForCampaign.AdsetLevel;
                }

                const isActive = matchedAdset?.status === "ACTIVE";

                setSwitchOn(matchedAdset ? isActive : true); // fallback to ACTIVE
                }, [campaignComments, campaignid, adsetid]);

                const handlePauseClick = (adsetid, checked) => {
                    setSelectedAdset(adsetid); 
                    setNextChecked(checked); // user’s toggle intent
                    setIsAdsetModalVisibles(true);
                };

                const handlePauseOk = async () => {
                    setSwitchOn(nextChecked); // update visual switch state
                  
                    try {
                      const token = localStorage.getItem("token");
                  
                      const response = await apiClient.post(`/adsetStatusChange`,
                        {
                            status: nextChecked ? "ACTIVE" : "PAUSED",
                            id: params.data?.identifier,             // Used if needed
                            // ad_id: adid,                              // Required
                            name: campaignName,
                            accountNumber: newaccount,
                            revenuePartner: params.data?.revenuePartner || "",
                            campaign_id: campaignid,
                            adset_id: adsetid,
                            email: userdetails?.email,
                        },
                        {
                          headers: {
                            Authorization: token
                          }
                        }
                      );
                  
                      if (response.status === 200 || response.status === 201) {
                        functionCallForCommnets(newaccount);
                        console.log(" Status updated on Facebook:", response.data.status, "Adset ID:", response.data.adset_id);
                      } else {
                        console.warn(" Backend returned unexpected status:", response.status);
                      }
                  
                    } catch (error) {
                      console.error(" API call to /adStatusChange failed:", error?.response?.data || error.message);
                    }
                  
                    setIsAdsetModalVisibles(false);
                    setSelectedAdset(null);
                };  

                const handlePauseCancel = () => {
                    setIsAdsetModalVisibles(false);
                    setSelectedAdset(null);
                };

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
                
                        if (response.status === 200  || response.status === 201) {
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
                        <Switch 
                            checked={switchOn}
                            onClick={(checked) => handlePauseClick(adsetid, checked)} 
                            size="small" 
                            style={{
                              backgroundColor: switchOn ? '#91C25F' : '#d9d9d9',
                            }} 
                        />
                        <Modal
                            title="Confirm Action"
                            open={isAdsetModalVisibles}
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            onOk={handlePauseOk}
                            onCancel={handlePauseCancel}
                        >
                            <p>
                                Are you sure you want to turn {nextChecked ? "ON" : "OFF"} this adset?
                            </p>
                            <p>Adset ID: {selectedAdset}</p>
                        </Modal>
                        <PinIcon
                            campaignName={campaignName}
                            campaignid={campaignid}
                            adsetid={adsetid}
                            pinned={pinned}
                        />
                        {/* <div style={{ marginLeft: '2px' }}>
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
                        </div> */}
                        {/* {relatedComment && (
                            <Tooltip title={(
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span>{relatedComment || 'No comment available'}</span>
                                    <EditOutlined onClick={handleEditClick} style={{ marginLeft: '10px', color: 'blue', cursor: 'pointer' }} />
                                </div>
                            )}>
                                <MessageOutlined className= {theme === "dark" ? "black-icon-comment" : 'Message'} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px', color: 'blue' }} />
                                <Tooltip title={tooltipText}></Tooltip>
                            </Tooltip>
                        )} */}
                        {relatedComment && (
                            <Tooltip
                                title={relatedComment || 'No comment available'}
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
                        )}
                        {!relatedComment && (
                            <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }} />
                        )}
                        <Tooltip title={tooltipText}>
                            <CopyOutlined
                                onClick={copyToClipboard}
                                style={{ cursor: 'pointer', marginLeft: '2px', color: "#1e1e1f", marginRight: '10px' }}
                            />
                        </Tooltip>
                        <LinkOutlined 
                            onClick={() => {
                                const url = `/LiveHistory/LiveAdsetHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                                window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                            style={{ cursor: 'pointer', marginLeft: '0px', color: "#1e1e1f", marginRight: '5px' }}
                        />
                        <Tooltip title={valueWithCount}>
                            <span
                                onClick={() => {
                                    const rowData = params.node.group
                                    ? params.node.childrenAfterGroup?.[0]?.data
                                    : params.node.data;

                                    const rowNode = params.api.getRowNode(params.node.id);

                                    // Clear existing selections (for single-select mode)
                                    params.api.deselectAll();

                                    // Set this row as selected
                                    if (rowNode) {
                                        rowNode.setSelected(true);
                                    }


                                    showAdsetLevel([rowData]);
                                    moveToNextTab("3");

                                    // console.log("Clicked row data:", [rowData]);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                {valueWithCount}
                            </span>
                        </Tooltip>
                        <Modal
                             title={
                                firstColumnValue
                            }
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            visible={isModalVisibles}
                            onOk={handleOks} // Default Ok button functionality
                            onCancel={handleCancels} // Default Cancel button functionality
                            footer={[
                                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                    <div style={{display:'flex', flexDirection:"column"}}>
                                        <span key="info" style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black", }}>
                                            Last Edited Time:
                                        </span>
                                        <span key="info1" style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black", }}>
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
                                style={{color: theme === "dark" ? "white" : "black"}}
                            />
                        </Modal>
                    </div>
                );
            }
        },
        processCellForClipboard: (params) => {
            if (params.node.group) {
                console.log("Processing group column for copy..."); // Debugging log
    
                // ✅ Fix: Ensure `params.node.parent` exists before accessing its properties
                if (!params.node.parent || !params.node.parent.childrenAfterGroup) {
                    return params.node.key;
                }
    
                // ✅ Only copy group name for the first row in the group
                return params.node.rowIndex === params.node.parent.childrenAfterGroup[0]?.rowIndex
                    ? params.node.key
                    : ""; // Prevent duplicate copies
            }
            return params.value; // Normal copy behavior for regular cells
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
            const campaigns = selectedCampaigns.length > 0
            ? [...new Set(selectedCampaigns.map(adset => adset.campaignid))]
            : [];
            const collectionName = newRevenuePratner === "FB_DomainActive" ? "Facebook_DActive_Names" : newtworkCollections[newRevenuePratner];
            // const fetchData = await apiClient.get(`/Live?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=${collectionName}`);
            const fetchData = await apiClient.post(`/AdsetLevel?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&status=${tabStatus}&network=${collectionName}`, { campaignids: campaigns });
            // const mainData = fetchData.data;
            const mainData1 = fetchData.data;
            const mainData = mainData1.filter(obj => !(obj.ad_clicks > 0));
            // const mainData =  tabStatus === "Live" ? mainData1.filter(obj => !("ad_clicks" in obj)) : mainData;
            // console.log(mainData1, "mainData1");
            console.log(mainData, "mainData");
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
                        revenueData = parseFloat(eachData.estimated_revenue).toFixed(2);
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
                    const fbLClicks = parseInt(eachData.fbLinkClicks, 10);
                    const spend = parseFloat(eachData.spend);
                    const cpcLinkClicks = isNaN(fbLClicks) || fbLClicks === 0 ? 0 : Math.round((spend / fbLClicks)*100)/100;
                    return (

                        {
                            campaignname: eachData.campaign_name,
                            adsetname: eachData.adsetName,
                            date: eachData[specifiedTimeZone],
                            'fb-hour': eachData.hour,
                            'mnet-hour': eachData.updatedHour,
                            spend: parseFloat(eachData.spend).toFixed(2),
                            revenue: revenueData ? revenueData : 0,
                            profit: parseFloat(profit),
                            // margin: margin,
                            fbleads: parseInt(eachData.fbLeads),
                            conversions: eachData.conversions !== null && eachData.conversions !== 0 ? parseInt(eachData.conversions) : 0,
                            cpc: parseFloat(eachData.cpc),
                            cpclinkclicks: cpcLinkClicks,
                            fbclicks: parseInt(eachData.fbClicks),
                            fblinkclicks: parseInt(eachData.fbLinkClicks),
                            impressions: parseInt(eachData.impressions),
                            rpc: parseFloat(rpc),
                            cpl: parseFloat(cpl),
                            ncpl: parseFloat(ncpl),
                            adsetid: eachData.adset_id,
                            campaignid: eachData.campaign_id,
                            timezone: eachData[newtime],
                            comment: relatedComment ? relatedComment.comment : null,
                            adid: "",
                            adname: "",
                            actions: '...',
                            from: "",
                            to: "",
                            profitloss: "",
                            M_tq: "",
                            D_tq: "",
                            fbCron: eachData.fbCron,
                            revenueCron: eachData.revenueCron
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
                    cpclinkclicks: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks), 0) / filteredData?.length).toFixed(2)),
                    fbclicks: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
                    fblinkclicks: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0).toFixed(2)),
                    impressions: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
                    ctr: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
                }
            ]);
            setRowData(filteredData);
            console.log(filteredData, "filteredData");
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
        // setSelectedCell({ rowIndex: event.node.rowIndex, colId: event.column.getId() });

        if (event.colDef.field === "adsetname") {
            const value = event.value;
            if (value !== undefined) {
                const url = `/LiveHistory/LiveAdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                window.open(url, "_blank", "noopener,noreferrer");
            }
        }
    };
    // const onGridReady = (params, gridId) => {
    //     gridRef.current = params;
    
    //     params.api.applyColumnState({ 
    //         state: columnDefs || [], 
    //         applyOrder: true 
    //     });
    // };
    
    // // Use useEffect to track changes in toggleStatus
    // useEffect(() => {
    //     if (!gridRef.current) return; // Ensure gridRef exists
    
    //     const gridApi = gridRef.current.api;
    
    //     const handleDragStopped = (e) => debouncedHandleColumnMove(e, 'grid1');
    
    //     if (toggleStatus) {
    //         gridApi.addEventListener('dragStopped', handleDragStopped);
    //     } else {
    //         gridApi.removeEventListener('dragStopped', handleDragStopped);
    //     }
    
    //     return () => {
    //         gridApi.removeEventListener('dragStopped', handleDragStopped);
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
    const gridOptions = useMemo(() => ({
        onColumnMoved: (params) => {
            // if (toggleStatus) {
                debouncedHandleColumnMove(params, 'grid1');
            // }
        },
        defaultColDef: {
            suppressMenu: true,
            headerClass: "custom-header" // Apply to all columns by default
        },
        ensureDomOrder: false
    }), []);

    document.addEventListener("DOMContentLoaded", function () {
        const gridDiv = document.getElementById("myGrid");
        new agGrid.Grid(gridDiv, gridOptions);
      
        // Set column definitions separately after grid initialization
        gridOptions.api.setColumnDefs(columnDefs);
    });
    const handleReFetchData = () => {
        functionCall1();
        setApiStatus(false);
    }
    useEffect(() => {
        if(selectedCampaigns){
            functionCall1();
            oneTimeFetch.current = false;
        }
    }, [selectedCampaigns]);

    useEffect(() => {
        if (refreshpage === "Refresh12") {
            handleReFetchData();
            showAdsetLevel([]);
        }
    }
    , [refreshpage]);

    // const onCellClickedLive = (event) => {
    //     setSelectedCell({ rowIndex: event.node.rowIndex, colId: event.column.getId() });

    //     if (event.colDef.field === "adsetname") {
    //         const value = event.value;
    //         if (value !== undefined) {
    //             const url = `/LiveHistory/LiveAdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}`;
    //             window.open(url, "_blank", "noopener,noreferrer");
    //         }
    //     }
    // };

    // const onRangeSelectionChanged = (params) => {
    //     const selected = [];
    //     const rangeSelections = params.api.getCellRanges();
    
    //     if (rangeSelections) {
    //         rangeSelections.forEach((range) => {
    //             const startRow = Math.min(range.startRow.rowIndex, range.endRow.rowIndex);
    //             const endRow = Math.max(range.startRow.rowIndex, range.endRow.rowIndex);
    //             const columns = range.columns.map((col) => col.getColId());
    
    //             for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
    //                 const node = params.api.getDisplayedRowAtIndex(rowIndex);
    
    //                 if (!node.group && node.data) { // ✅ Ensures only data rows are selected
    //                     if (!firstSelectedCell) {
    //                         setFirstSelectedCell({ rowIndex, colId: columns[0] }); // ✅ Ensure first cell is recorded
    //                     }
    //                     selected.push({ rowIndex, columns });
    //                 }
    //             }
    //         });
    //     }
    
    //     setSelectedCells(selected);
    // };

    
    const onCellKeyDown = (params) => {
        if (params.event.ctrlKey && params.event.key === "c") {
            params.event.preventDefault(); // Prevent default copy behavior
    
            // ✅ Prepare data to copy: Rows separated by \n, Columns by \t
            const copiedText = selectedCells
                .map(({ rowIndex, columns }) =>
                    columns.map((colId) => params.api.getValue(colId, params.api.getDisplayedRowAtIndex(rowIndex))).join("\t")
                )
                .join("\n"); // Each row on a new line
    
            navigator.clipboard.writeText(copiedText);
            params.api.copySelectedRangeToClipboard(); // ✅ Restore AG Grid blinking effect
        }
    };

    const handleTabChange = (key) => {
        console.log("Switched to Tab:", key); // Debugging log
        setActiveTab(key);
    };

    const items = [
        { key: '1', label: 'Campaigns', content: 'Content for Campaign data' },
        { key: '2', label: 'Adset', content: 'Content for Adset data' },
        { key: '3', label: 'Ad', content: 'Content for Ad data' }
    ];

    const handleCarouselChange = (index) => {
        setActiveTab(index);
        // console.log(index);
        // console.log(parseInt(index)-1);
        // carouselRef.current.goTo(parseInt(index))
        // localStorage.setItem("activeTab", index);
        
    };

    const renderCarouselNav = () => (
        <StickyBox offsetTop={64} offsetBottom={20} style={{ zIndex: 1, padding: '0px', margin: '0px', paddingLeft: '12px', paddingTop:'15px' }}>
            <Tabs
                activeKey={activeTab}
                onChange={handleCarouselChange}
                items={items.map((item) => ({
                    key: item.key,
                    label: item.label,
                }))}
                className={`custom-tabs ${theme === 'dark' ? 'dark-mode-tabs' : 'light-mode-tabs'}`}
                style={{
                    backgroundColor:  'transparent',
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

    const uniqueByAdsetId = (arr) => {
        const map = new Map();
        arr.forEach(obj => {
          if (!map.has(obj.adsetid)) {
            map.set(obj.adsetid, obj);
          }
        });
        return Array.from(map.values());
      };

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        console.log("Selected Adsets:", selectedData);
        showAdsetLevel(uniqueByAdsetId(selectedData));
    };

    const restoreSelection = () => {
        const selectedRow = selectedAdsets[0];
        console.log("Selected Row:", selectedRow); // Debugging log
        console.log(selectedAdsets, "selectedAdsets"); // Debugging log

        if (selectedRow) {
        // Make sure getRowId is set up to use adset_id
            const rowNode = gridRef.current.api.getRowNode(selectedRow.adset_id);

            // Clear previous selection
            gridRef.current.api.deselectAll();

        // Select the specific row
            if (rowNode) {
                rowNode.setSelected(true);
            }
        }
    };

    useEffect(() => {
        if(removeSelectedAdsets === "Remove"){
            if (gridRef.current) {
                gridRef.current.api.deselectAll(); // ✅ clears selection in grid
                // showCampaignLevel([]);             // ✅ manually clears selection data
            }
        }
    }, [removeSelectedAdsets]); 

    // useEffect(() => {
    //     if (gridRef.current?.api) {
    //       restoreSelection();
    //     }
    //   }, [rowData]);


    
    // return(
    //                 <div style={{ height: "100%", marginBottom: '20px',overflow: "visible" }}>
    //                     <div style={contentStyle}>
    //                         {isLoading === true ? (
    //                             <div className="loader-container ag-container" style={{ backgroundColor: theme === "dark" ? "#333" : "white" }}>
    //                                 <div className="ag-grid-Loader">
    //                                     <Audio
    //                                         height="80"
    //                                         width="80"
    //                                         radius="9"
    //                                         color="green"
    //                                         ariaLabel="loading"
    //                                         wrapperStyle
    //                                         wrapperClass
    //                                     />
    //                                 </div>
    //                             </div>
    //                         ) : rowData?.filter((each) => {
    //                             const normalizedCampaign = each.campaignname.trim().toLowerCase();
    //                             const normalizedInput = inputValue.trim().toLowerCase();
    //                             return (
    //                                 normalizedCampaign.startsWith(normalizedInput) ||
    //                                 normalizedCampaign.includes(normalizedInput) ||
    //                                 normalizedCampaign.endsWith(normalizedInput)
    //                             );
    //                         }
    //                         )?.length > 0 ? (
    //                             <div className={`ag-theme-alpine ag-container ${gridThemeClass}`}>

    //                                 <Row style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap', backgroundColor: theme === "dark" && "#4d4d4d" }}>
    //                                     <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
    //                                         <Space align="center">
    //                                             <div className="blinking-circle-1"></div>
    //                                             <Text style={{ paddingLeft: '3px', fontSize: '15px', fontWeight: '600', color: theme === "dark" && "white" }}>Live</Text>
    //                                         </Space>
    //                                     </Col>
    //                                     <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
    //                                         <Text style={{ fontWeight: '600', color: theme === "dark" && "white" }}>Acc: {newaccount}</Text>
    //                                     </Col>
    //                                     <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
    //                                         <Text style={{ fontWeight: '600', color: theme === "dark" && "white" }}>AccName: {newAccountName}</Text>
    //                                     </Col>
    //                                     <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
    //                                         <Text style={{ fontWeight: '600', color: theme === "dark" && "white" }}>Timezone: {timezone.current}</Text>
    //                                     </Col>
    //                                     <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
    //                                         <Text style={{ fontWeight: '600', color: theme === "dark" && "white" }}>F/N Hour: {maxHour.current}:00 / {maxNetworkHour.current}:00</Text>
    //                                     </Col>
    //                                     {/* <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
    //                                         <Text style={{ fontWeight: '600' }}>
    //                                             Cron/Acc status: {cronStatus.current} /{' '}
    //                                             <span style={{ color: accountStatus.current === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
    //                                                 {accountStatus.current}
    //                                             </span>
    //                                         </Text>
    //                                     </Col> */}
    //                                     <Col xs={24} sm={24} md={4} lg={2} style={{ flex: "0.2 0 auto" }}>
    //                                         <Tooltip
    //                                         title={
    //                                             <>
    //                                                 <div>FbAcc Status: {`${fbCron.current}`}</div>
    //                                                 <div>RevAcc Status: {`${revenueCron.current}`}</div>
    //                                                 <Text style={{ fontWeight: '600', color: "white" }}>
    //                                                     Cron/Acc status: {cronStatus.current} /{' '}
    //                                                     <span style={{ color: accountStatus.current === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
    //                                                         {accountStatus.current}
    //                                                     </span>
    //                                                 </Text>
    //                                             </>
    //                                         }
    //                                         >
    //                                             <InfoCircleOutlined style={{ fontSize: '18px', cursor: 'pointer', marginRight: '10px', color:"#91C25F" }} className="black-icon-info"/>
    //                                         </Tooltip>
    //                                     </Col>
    //                                     {/* <Col>
    //                                         <Tooltip 
    //                                             title={ !toggleStatus ? "Turn on toggle to column re-arrangement" : "Turn off to stop column re-arrangement"} 
    //                                             mouseEnterDelay={0} // Tooltip appears after 1 second
    //                                         >
    //                                             <Switch checked={toggleStatus} onChange={() => handleChangeToggle()} style={{marginLeft:'10px', marginRight:'10px', backgroundColor: toggleStatus && "#91C25F" }}/>
    //                                         </Tooltip>
    //                                     </Col> */}
    //                                     <Col xs={24} sm={24} md={4} lg={2} style={{ flex: '0.2 0 auto' }}>
    //                                         <Tooltip title="Export to CSV">
    //                                             <Button type="primary" style={{ backgroundColor: '#91C25F', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined className="black-icon"/>} onClick={onBtExport1} />
    //                                         </Tooltip>
    //                                     </Col>
    //                                 </Row>

    //                                 <AgGridReact
    //                                     ref={gridRef}
    //                                     rowData={memorizedRowData}
    //                                     rowSelection='multiple'
    //                                     columnDefs={memorizedColumnDef}
    //                                     defaultColDef={{ ...defaultColDef, suppressMenu: true }}
    //                                     onCellClicked={onCellClickedLive}
    //                                     pagination={true}
    //                                     paginationPageSize={100}
    //                                     paginationPageSizeSelector={[20, 40, 60, 80, 100]}
    //                                     suppressAggFuncInHeader={true}
    //                                     getMainMenuItems={getMainMenuItems}
    
    //                                     // onRangeSelectionChanged={onRangeSelectionChanged} // ✅ Captures range selection
    //                                     // onCellKeyDown={onCellKeyDown}
    //                                     // domLayout="normal"
    //                                     // groupIncludeTotalFooter={rowData.length > 0 ? true : false}
    //                                     // groupIncludeFooter={rowData.length > 0 ? true : false}
    //                                     autoGroupColumnDef={autoGroupColumnDefLive}
    //                                     onGridReady={(params) => onGridReady(params, 'grid1', gridRef)}
    //                                     gridOptions={{
    //                                         ...gridOptions,
    //                                         ensureDomOrder: false,
    //                                         suppressRowClickSelection: true,
    //                                         suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
    //                                         enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
    //                                         groupSelectsChildren: true, // ✅ Ensures child rows are selected properly
    //                                     }}
    //                                     frameworkComponents={{ GroupCellRenderer }}
    //                                     groupDisplayType='multipleColumns'
    //                                     // rowGroupPanelShow='always'
    //                                     // onFilterChanged={onFilterChanged} // Use the custom filter handler
    //                                     pinnedBottomRowData={liveFixedFooter}
    //                                     suppressCellSelection={true}
    //                                     getRowStyle={(params) => {
    //                                         if (params.node.rowPinned) {
                                                
    //                                             return {
    //                                                 fontWeight: "bold",
    //                                                 backgroundColor: theme === "dark" ? "#1a1918" : "#fff", // Dark mode or light mode
    //                                                 color: theme === "dark" ? "#fff" : "#000",
    //                                             };
    //                                         }
    //                                         return null; // Keep other row styles unchanged
    //                                     }}
    //                                     getCellStyle={(params) => {
    //                                         const isSelected = selectedCells.some(
    //                                             (cell) => cell.rowIndex === params.node.rowIndex && cell.columns.includes(params.column.getId())
    //                                         );
                                    
    //                                         // ✅ Ensure first cell inside a group is highlighted
    //                                         const isFirstSelected = firstSelectedCell &&
    //                                             firstSelectedCell.rowIndex === params.node.rowIndex &&
    //                                             firstSelectedCell.colId === params.column.getId();
                                    
    //                                         return isSelected || isFirstSelected ? { backgroundColor: "#007bff", color: "#fff" } : {};
    //                                     }}
    //                                     onFilterChanged={(params) => {
    //                                         const api = params.api;
    //                                         const filteredData = [];
    //                                         // api.forEachNodeAfterFilterAndSort((node) => {
    //                                         //     if (!node.rowPinned) {
    //                                         //         filteredData.push(node.data);
    //                                         //     }
    //                                         // });
    //                                         const normalizedInput = inputValue.trim().toLowerCase();

    //                                         api.forEachNodeAfterFilterAndSort((node) => {
    //                                             if (node.data && node.data.campaignname) {
    //                                                 const normalizedCampaign = node.data.campaignname.trim().toLowerCase();
                                        
    //                                                 // Apply search and filter conditions
    //                                                 if (
    //                                                     normalizedCampaign.startsWith(normalizedInput) ||
    //                                                     normalizedCampaign.includes(normalizedInput) ||
    //                                                     normalizedCampaign.endsWith(normalizedInput)
    //                                                 ) {
    //                                                     filteredData.push(node.data);
    //                                                 }
    //                                             }
    //                                         });

    //                                         const updatedFooter = [
    //                                             {
    //                                                 // [`${newtime}Date`]: 'Totals',
    //                                                 campaignName: 'Total',
    //                                                 actions: "",
    //                                                 spend: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend || 0), 0).toFixed(2)),
    //                                                 revenue: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.revenue || 0), 0).toFixed(2)),
    //                                                 profit: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.profit || 0), 0).toFixed(2)),
    //                                                 margin: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.revenue), 0) * 100).toFixed(2)),
    //                                                 rpc: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.rpc), 0) / filteredData.length).toFixed(2)),
    //                                                 cpl: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpl), 0) / filteredData.length).toFixed(2)),
    //                                                 ncpl: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.ncpl), 0) / filteredData.length).toFixed(2)),
    //                                                 fbleads: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbleads), 0).toFixed(2)),
    //                                                 conversions: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.conversions), 0).toFixed(2)),
    //                                                 fmargin: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0) * 100).toFixed(2)),
    //                                                 roi: parseFloat(((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.revenue), 0) - filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0)) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0) * 100).toFixed(2)),
    //                                                 cpc: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpc), 0) / filteredData.length).toFixed(2)),
    //                                                 cpclinkclicks: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpclinkclicks), 0) / filteredData.length).toFixed(2)),
    //                                                 fbclicks: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0).toFixed(2)),
    //                                                 fblinkclicks: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fblinkclicks), 0).toFixed(2)),
    //                                                 impressions: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0).toFixed(2)),
    //                                                 ctr: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0) * 100).toFixed(2))
    //                                             },
    //                                         ];

    //                                         setLiveFixedFooter(updatedFooter);
    //                                     }}
    //                                 />

    //                             </div>
    //                         ) : <div style={{ backgroundColor: theme === "dark" && "#333" }}>
    //                             {apiStatus === true ? 
    //                             <Result
    //                             className={theme === 'dark' ? 'dark-result' : 'light-result'}
    //                             // icon={<SmileOutlined />}
    //                             title={`API failed to fetch the data. Please click retry button to fetch the data`}
    //                         extra={<Button type="primary" onClick={handleReFetchData}>Retry</Button>}
    //                         /> : (startDate !== endDate ? <Result
    //                                 className={theme === 'dark' ? 'dark-result' : 'light-result'}
    //                                 icon={<SmileOutlined />}
    //                                 title={`No LiveData for ${newaccount} from ${startDate} to ${endDate}`}
    //                             // extra={<Button type="primary">Next</Button>}
    //                             /> : <Result
    //                                 className={theme === 'dark' ? 'dark-result' : 'light-result'}
    //                                 icon={<SmileOutlined />}
    //                                 title={`No LiveData for ${newaccount} to ${startDate}`}
    //                             // extra={<Button type="primary">Next</Button>}
    //                             />)}
    //                         </div>}
    //                     </div>
    //                 </div>
    // );

    return (
        <div>
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
                        ) : rowData?.length > 0 ? (
                            <div 
                                className={`ag-theme-alpine ag-container ${gridThemeClass}`}
                                style={{
                                    width: '100%',
                                    // borderRadius: 12,
                                    backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
                                    padding: 10,
                                    height: 'auto',
                                    boxShadow:
                                    theme === 'dark'
                                        ? '0 1px 3px rgba(0,0,0,0.6)'
                                        : '0 1px 6px rgba(0,0,0,0.08)',
                                }}
                            >

                                <Row style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap', backgroundColor: theme === "dark" && "#4d4d4d" }}>
                                    <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                                        <Space align="center">
                                            <div className="blinking-circle-1"></div>
                                            <Text style={{ paddingLeft: '3px', fontSize: '15px', color: theme === "dark" && "white" }}>Live</Text>
                                        </Space>
                                    </Col>
                                    <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                        <Text style={{ color: theme === "dark" && "white" }}>Acc: {newaccount}</Text>
                                    </Col>
                                    <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                        <Text style={{ color: theme === "dark" && "white" }}>Acc name: {newAccountName}</Text>
                                    </Col>
                                    <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                        <Text style={{ color: theme === "dark" && "white" }}>Time zone: {timezone.current}</Text>
                                    </Col>
                                    <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                        <Text style={{ color: theme === "dark" && "white" }}>F/N hour: {maxHour.current}:00 / {maxNetworkHour.current}:00</Text>
                                    </Col>
                                    {/* <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                        <Text style={{ fontWeight: '600' }}>
                                            Cron/Acc status: {cronStatus.current} /{' '}
                                            <span style={{ color: accountStatus.current === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
                                                {accountStatus.current}
                                            </span>
                                        </Text>
                                    </Col> */}
                                    <Col xs={24} sm={24} md={4} lg={2} style={{ flex: "0.2 0 auto" }}>
                                        <Tooltip
                                        title={
                                            <>
                                                <div>FbAcc status: {`${fbCron.current}`}</div>
                                                <div>RevAcc status: {`${revenueCron.current}`}</div>
                                                <Text style={{ fontWeight: '600', color: "white" }}>
                                                    Cron/Acc status: {cronStatus.current} /{' '}
                                                    <span style={{ color: accountStatus.current === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
                                                        {accountStatus.current}
                                                    </span>
                                                </Text>
                                            </>
                                        }
                                        >
                                            <InfoCircleOutlined style={{ fontSize: '18px', cursor: 'pointer', marginRight: '10px', color:"#91C25F" }} className="black-icon-info"/>
                                        </Tooltip>
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
                                        <Tooltip title="Export to CSV">
                                            <Button type="primary" style={{ backgroundColor: '#91C25F', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined className="black-icon"/>} onClick={onBtExport1} />
                                        </Tooltip>
                                    </Col>
                                </Row>

                                <AgGridReact
                                    ref={gridRef}
                                    className='custom-grid'
                                    context={context}
                                    rowData={memorizedRowData}
                                    rowSelection='multiple'
                                    groupSelectsChildren={true} // ✅ Selects all children when a group is selected
                                    suppressRowClickSelection={true}
                                    columnDefs={memorizedColumnDef}
                                    defaultColDef={{ ...defaultColDef, suppressMenu: true }}
                                    onCellClicked={onCellClickedLive}
                                    pagination={true}
                                    paginationPageSize={100}
                                    paginationPageSizeSelector={[20, 40, 60, 80, 100]}
                                    suppressAggFuncInHeader={true}
                                    getMainMenuItems={getMainMenuItems}

                                    // onRangeSelectionChanged={onRangeSelectionChanged} // ✅ Captures range selection
                                    // onCellKeyDown={onCellKeyDown}
                                    // domLayout="normal"
                                    // groupIncludeTotalFooter={rowData.length > 0 ? true : false}
                                    // groupIncludeFooter={rowData.length > 0 ? true : false}
                                    onSelectionChanged={onSelectionChanged}
                                    autoGroupColumnDef={autoGroupColumnDefLive}
                                    onGridReady={(params) => onGridReady(params, 'grid1', gridRef)}
                                    gridOptions={{
                                        ...gridOptions,
                                        ensureDomOrder: false,
                                        suppressRowClickSelection: true,
                                        suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                                        enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                                        groupSelectsChildren: true, // ✅ Ensures child rows are selected properly
                                    }}
                                    frameworkComponents={{ GroupCellRenderer }}
                                    groupDisplayType='multipleColumns'
                                    // rowGroupPanelShow='always'
                                    // onFilterChanged={onFilterChanged} // Use the custom filter handler
                                    pinnedBottomRowData={liveFixedFooter}
                                    suppressCellSelection={true}
                                    getRowStyle={(params) => {
                                        if (params.node.rowPinned) {
                                            
                                            return {
                                                // fontWeight: "bold",
                                                backgroundColor: theme === "dark" ? "#1a1918" : "#fff", // Dark mode or light mode
                                                color: theme === "dark" ? "#fff" : "#000",
                                            };
                                        }
                                        return null; // Keep other row styles unchanged
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
                                                cpclinkclicks: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpclinkclicks), 0) / filteredData.length).toFixed(2)),
                                                fbclicks: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0).toFixed(2)),
                                                fblinkclicks: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fblinkclicks), 0).toFixed(2)),
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
            
        </div>
    );

};

export default AdsetLevelReports;
