"use client"
import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import moment from 'moment-timezone';
import React from 'react';
import { Input, Button, Row, Col, Typography, Result, Modal, message, Switch, Spin, Badge, Space, Tooltip, Menu, Dropdown } from 'antd';
import { GlobalOutlined, NumberOutlined, InfoCircleOutlined, DownloadOutlined, SmileOutlined, CopyOutlined, EditOutlined, MessageOutlined, PauseCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined, LinkOutlined, PushpinOutlined, FilterOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';;
import { RxSwitch } from "react-icons/rx";
import 'antd/dist/reset.css';
import '../globals.css';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useTokenContext } from '../components/parent';

// const CampaignLevelReports = React.lazy(() => import('./CampaignLevel'));
// const AdsetLevelReports = React.lazy(() => import('./AdsetLevel'));
// const AdLevelReports = React.lazy(() => import('./AdLevel'));

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
  "FB_Mnet": "Facebook_Mnet_Daily",
  "FB_MnetBing": "Facebook_MnetBing_Daily",
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
  "FB_TonicRsoc": "Facebook_TonicRsoc",
  "FB_InuvoPrism": "Facebook_InuvoPrismDaily",
  "FB_CodeFuel": "Facebook_CodeFuel_Daily",
  "FB_Predicto": 'Facebook_Predicto_Daily',
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


const Daily = ({ functionCallForCampaigns, context, functionCallForCommnets, startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, campaignComments, setCampaignComments, Camapignlevelstatus, setCamapignlevelstatus, changeRRefrst, debouncedHandleColumnMove, userdetails, refreshComments, refreshpage, getMainMenuItems, toggleStatus, handleChangeToggle, showCampaignLevel, removeSelectedCampaigns, moveToNextTab, accountsAccess, commentsMap }) => {
  const { theme, apiClient } = useTokenContext();
  const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';

  const [dailyData, setdailyData] = useState([]);
  const newRowDataForFilter = useRef([]);

  const [campaignStatusFilter, setcampaignStatusLabel] = useState("All");

  const [insideInput, setInsideInput] = useState("");

  const [dailyFixedFooter, setDailyFixedFooter] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedCells, setSelectedCells] = useState([]);
  const [firstSelectedCell, setFirstSelectedCell] = useState(null);

  const [isLoading1, setLoading1] = useState(true);

  const timezone = useRef();

  const gridRef1 = useRef();

  const newDailyData = useRef();

  const oneTimeFetch = useRef(true);

  const [apiStatus, setApiStatus] = useState(false);

  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [leafCampaigns, setLeafCampaigns] = useState([]);
  const [isBulkCommentModalVisible, setIsBulkCommentModalVisible] = useState(false);
  const [comment, setComment] = useState("");
  const [isBulkStatusModalVisible, setIsBulkStatusModalVisible] = useState(false);
  const [bulkStatusAction, setBulkStatusAction] = useState(null);
  const [confirmBulkLoading, setConfirmBulkLoading] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("");

  // let fbCron = useRef();

  // let revenueCron = useRef();

  // let cronStatus = useRef();

  // let accountStatus = useRef();
  const fbCron = useRef('-');
  const revenueCron = useRef('-');
  const cronStatus = useRef('-');
  const accountStatus = useRef('-');

  const memorizedColumnDef1 = useMemo(() => columnDefs.current, [columnDefs.current]);
  // console.log(memorizedColumnDef1, "1111");
  // const memorizedDailyData = useMemo(() => dailyData?.filter((each) => {
  //   const normalizedCampaign = each.campaignname.trim().toLowerCase();
  //   const normalizedInput = inputValue.trim().toLowerCase();
  //   return (
  //     normalizedCampaign.startsWith(normalizedInput) ||
  //     normalizedCampaign.includes(normalizedInput) ||
  //     normalizedCampaign.endsWith(normalizedInput)
  //   );
  // }
  // ), [dailyData, inputValue, theme]);

  const memorizedDailyData = useMemo(() => {
    let filtered = dailyData || [];

    const normalizedInput = inputValue.trim().toLowerCase();
    const normalizedInside = insideInput.trim().toLowerCase();

    // 1️⃣ FIRST FILTER → by inputValue (only adname)
    if (normalizedInput) {
      filtered = filtered.filter((each) => {
        const campaignname = (each?.campaignname || "").trim().toLowerCase();
        const accountNumber = (each?.accountNumber || "").toString().trim().toLowerCase();
        const campaignId = (each?.campaignid || "").toString().trim().toLowerCase();
        return (
          campaignname.startsWith(normalizedInput) ||
          campaignname.includes(normalizedInput) ||
          campaignname.endsWith(normalizedInput) ||
          accountNumber.includes(normalizedInput) ||
          campaignId.includes(normalizedInput)
        );
      });
    }

    // 2️⃣ SECOND FILTER → by insideInput (all fields)
    if (normalizedInside) {
      filtered = filtered.filter((each) => {
        const campaignname = (each?.campaignname || "").trim().toLowerCase();
        const accountNumber = (each?.accountNumber || "").toString().trim().toLowerCase();
        const campaignId = (each?.campaignid || "").toString().trim().toLowerCase();

        return (
          campaignname.includes(normalizedInside) ||
          accountNumber.includes(normalizedInside) ||
          campaignId.includes(normalizedInside)
        );
      });
    }

    return filtered;
  }, [dailyData, inputValue, insideInput]);

  // useEffect to show selected campaigns after clearing search
  useEffect(() => {
    const api = gridRef1.current?.api;
    if (!api) return;

    if (inputValue.trim() === '' && selectedCampaigns.length > 0) {
      const selectedIds = selectedCampaigns.map(item => item.campaignid);
      const selectedOnly = dailyData.filter(item => selectedIds.includes(item.campaignid));

      // ✅ Replace rows
      api.applyTransaction({ replace: true, data: selectedOnly });

      // ✅ Reselect those rows
      setTimeout(() => {
        api.forEachNode((node) => {
          if (selectedIds.includes(node.data?.campaignid)) {
            node.setSelected(true);
          }
        });
      }, 0);
    } else if (inputValue.trim() === '' && selectedCampaigns.length === 0) {
      api.applyTransaction({ replace: true, data: dailyData });
    }
  }, [inputValue, selectedCampaigns, dailyData]);

  const rowSelection = useMemo(() => {
    return {
      mode: 'multiple',
      groupSelects: 'descendants',
    };
  }, []);

  // const onSelectionChanged = (event) => {
  //     const selectedNodes = event.api.getSelectedNodes();
  //     const selectedData = selectedNodes.map(node => node.data);
  //     console.log("Selected Campaigns:", selectedData);
  //     showCampaignLevel(selectedData);
  // };

  const uniqueByCampaignId = (arr) => {
    const map = new Map();
    arr.forEach(obj => {
      if (!map.has(obj.campaignid)) {
        map.set(obj.campaignid, obj);
      }
    });
    return Array.from(map.values());
  };

  const onSelectionChanged = (event) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);


    setSelectedCampaigns(selectedData);


    showCampaignLevel(uniqueByCampaignId(selectedData));
    console.log(selectedData);

    const leafCampaignsData = selectedNodes
      .filter(node => !node.group && node.data)
      .map(node => ({
        campaignid: node.data.campaignid,
        campaignname: node.data.campaignname,
        accountNumber: node.data.accountNumber,
        category: node.data.category,
        fbStatus: node.data.fbStatus,
        level: "campaign",
      }))
      .filter(item => item.campaignid && item.campaignname);


    const uniqueLeafCampaigns = Array.from(
      new Map(
        leafCampaignsData.map(item => [`${item.campaignid}_${item.accountNumber}`, item])
      ).values()
    );


    setLeafCampaigns(uniqueLeafCampaigns);

    console.log(" Selected unique campaigns:", uniqueLeafCampaigns);


  };

  useEffect(() => {
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
          cpclinkclicks: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks), 0) / memorizedDailyData?.length).toFixed(2)),
          fblinkclicks: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0).toFixed(2)),
          impressions: parseFloat(memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
          ctr: parseFloat((memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / memorizedDailyData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)),
          tq: parseFloat(
            memorizedDailyData?.reduce((acc, curr) => {
              const tqValue = Number(curr?.tq);
              return acc + (isNaN(tqValue) ? 0 : tqValue);
            }, 0).toFixed(2)
          ),
        }
      ]
    );
  }, [memorizedDailyData]);

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

  //     const autoGroupColumnDef = {
  //         headerName: 'Campaign name',
  //         minWidth: 450,
  //         pinned: 'left',
  //         sortable: true,
  //         unSortIcon: true,
  //         headerClass: 'ag-center-header',

  //         comparator: (campaignA, campaignB) => {
  //             if (!campaignA) return 1;
  //             if (!campaignB) return -1;

  //             // Function to get the 'pinned' status of a campaign
  //             const getPinStatusForCampaign = (campaignName) => {
  //                 const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
  //                 return relatedComment ? relatedComment.pinned : false;
  //             };

  //             const isPinnedA = getPinStatusForCampaign(campaignA);
  //             const isPinnedB = getPinStatusForCampaign(campaignB);

  //             if (isPinnedA !== isPinnedB) {
  //                 return isPinnedA ? -1 : 1;  // Pinned campaigns should come first
  //             }

  //             // If both campaigns have the same pinned status, fallback to alphabetical sorting
  //             return campaignA.localeCompare(campaignB);
  //         },

  //         cellRendererParams: {
  //             checkbox: true,
  //             suppressCount: false,
  //             innerRenderer: (params) => {
  //                 if (params.node.footer) {
  //                     return 'Total';
  //                 }

  //                 const firstColumnValue = params.node.key;  // campaign name
  //                 const campaignName = params.node.key;

  //                 let campaignid, adsetid;

  //                 if (params.node.group && params.node.childrenAfterGroup && params.node.childrenAfterGroup.length > 0) {
  //                     const firstChild = params.node.childrenAfterGroup[0].data;
  //                     campaignid = firstChild.campaignid;
  //                     adsetid = firstChild.adsetid;
  //                 } else if (params.data) {
  //                     campaignid = params.data.campaignid;
  //                     adsetid = params.data.adsetid;
  //                 } else {
  //                     console.error('Missing campaignid or adsetid for campaign:', campaignName);
  //                     return (
  //                         <div style={{ color: 'red' }}>
  //                             Error: campaignid or adsetid missing for {campaignName}
  //                         </div>
  //                     );
  //                 }

  //                 const rowAccount = (() => {
  //                     if (params.node.group && params.node.childrenAfterGroup?.length > 0) {
  //                       return params.node.childrenAfterGroup[0]?.data?.accountNumber ?? null;
  //                     }
  //                     return params.data?.accountNumber ?? null;
  //                   })();

  //                 // 2) pick the exact comment record for this (campaign+account [+ids])
  // const rec = campaignComments.find(c =>
  //     c.campaignname === campaignName &&
  //     String(c.Account) === String(rowAccount) &&
  //     (c.campaignid ? String(c.campaignid) === String(campaignid) : true) &&
  //     (c.adsetid    ? String(c.adsetid)    === String(adsetid)    : true)
  //   );

  //   // 3) derive UI fields
  //   const relatedComment = rec?.comment ?? null;
  //   const editedRaw      = rec?.editedTime ?? rec?.editedPinTime ?? '';
  //   const editedBy       = rec?.usercommit ?? rec?.userPin ?? '';
  //   const editedPretty   = editedRaw
  //     ? moment(editedRaw, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A")
  //     : '';

  //   // pin state per account
  //   const [pinned, setPinned] = useState(!!rec?.pinned);
  //   useEffect(() => { setPinned(!!rec?.pinned); }, [rec?.pinned]);

  //   const pinEditedRaw = rec?.editedPinTime ?? '';
  // const pinEditedBy  = rec?.userPin ?? '';

  //                 const getEditedUserAndTime = (campaignName, newaccount) => {
  //                     const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
  //                     // console.log(relatedStatus, "relatedStatus");
  //                     const relatedStatusEditedTime = relatedStatus ? relatedStatus : null;
  //                     // console.log(relatedStatusTrue);
  //                     return relatedStatusEditedTime;
  //                 }

  //                 const getPinEditedUserAndTime = (campaignName, newaccount) => {
  //                     const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
  //                     return relatedStatus ? relatedStatus : null;
  //                 };

  //                 const getStatusForCampaign = (campaignName, newaccount) => {
  //                     const relatedStatus = campaignComments.find(comment => comment.campaignname === campaignName && comment.Account === newaccount);
  //                     // console.log(relatedStatus, "relatedStatus");
  //                     const relatedStatusTrue = relatedStatus !== undefined && relatedStatus.status === true ? true : relatedStatus !== undefined ? false : null;
  //                     // console.log(relatedStatusTrue);
  //                     return relatedStatusTrue;
  //                 }

  //                 const getCommentForCampaign = (campaignName) => {
  //                     const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
  //                     return relatedComment ? relatedComment.comment : null;
  //                 };

  //                 const getPinStatusForCampaign = (campaignName) => {
  //                     const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
  //                     return relatedComment ? relatedComment.pinned : false;
  //                 };

  //                 const editUserANdTime = getEditedUserAndTime(campaignName, newaccount);
  //                 const editPinUserANdTime = getPinEditedUserAndTime(campaignName, newaccount);
  //                 const relatedStatus = getStatusForCampaign(campaignName, newaccount);
  //                 // const relatedComment = getCommentForCampaign(campaignName);
  //                 // const isStarred = getStarredForCampaign(campaignName);
  //                 const valueWithCount = `${firstColumnValue}`;

  //                 const [tooltipText, setTooltipText] = useState("Click to Copy");
  //                 const [isModalVisibles, setIsModalVisibles] = useState(false);
  //                 const [isCampaignModalVisibles, setIsCampaignModalVisibles] = useState(false);
  //                 const [selectedCampaign, setSelectedCampaign] = useState(null); // store adid when switch clicked
  //                 const [switchOn, setSwitchOn] = useState(false); // control toggle state
  //                 const [nextChecked, setNextChecked] = useState(false); // what user clicked
  //                 const [comment, setComment] = useState(relatedComment || '');
  //                 // const [starred, setStarred] = useState(isStarred);
  //                 // const [pinned, setPinned] = useState(getPinStatusForCampaign(campaignName));

  //                 // add:
  // const [pendingAccount, setPendingAccount] = useState(null);

  // // initial ON/OFF from the correct account
  // useEffect(() => {
  //   const st = Camapignlevelstatus.find(s =>
  //     String(s.campaign_id) === String(campaignid) &&
  //     String(s.accountNumber) === String(rowAccount)
  //   );
  //   setSwitchOn(st ? st.status === "ACTIVE" : false);
  // }, [Camapignlevelstatus, campaignid, rowAccount]);

  // // click handler: save desired state + row account
  // const handlePauseClick = (checked) => {
  //   setSelectedCampaign(campaignid);
  //   setNextChecked(checked);
  //   setPendingAccount(rowAccount);
  //   setIsCampaignModalVisibles(true);
  // };

  // const handlePauseOk = async () => {
  //   setSwitchOn(nextChecked); // optimistic

  //   try {
  //     const token = localStorage.getItem("token");
  //     await apiClient.post(
  //       `/campaignStatusChange`,
  //       {
  //         status: nextChecked ? "ACTIVE" : "PAUSED",
  //         id: params.data?.identifier,
  //         campaign_id: campaignid,
  //         accountNumber: String(pendingAccount), // ✅ row account
  //         adset_id: adsetid,
  //         name: campaignName,
  //         email: userdetails?.email,
  //       },
  //       { headers: { Authorization: token } }
  //     );

  //     // refresh just that account
  //     functionCallForCampaigns(pendingAccount);
  //     message.success(`Campaign ${nextChecked ? 'activated' : 'paused'}`);
  //   } catch (e) {
  //     message.error("Failed to update campaign status");
  //     setSwitchOn(prev => !prev); // revert
  //   } finally {
  //     setIsCampaignModalVisibles(false);
  //     setSelectedCampaign(null);
  //     setPendingAccount(null);
  //   }
  // };

  // const handlePauseCancel = () => {
  //   setIsCampaignModalVisibles(false);
  //   setSelectedCampaign(null);
  //   setPendingAccount(null);
  // };


  //                 // useEffect(() => {
  //                 //     const campaignStatus = Camapignlevelstatus.find(
  //                 //         statusObj => statusObj.campaign_id === campaignid
  //                 //     );
  //                 //     if (campaignStatus) {
  //                 //         setSwitchOn(campaignStatus.status === "ACTIVE");
  //                 //     }
  //                 // }, [Camapignlevelstatus, campaignid]);

  //                 // const handlePauseClick = (campaignid, checked) => {
  //                 //     setSelectedCampaign(campaignid); 
  //                 //     setNextChecked(checked); // user’s toggle intent
  //                 //     setIsCampaignModalVisibles(true);
  //                 // };

  //                 // const handlePauseOk = async () => {
  //                 //     setSwitchOn(nextChecked); // update visual switch state

  //                 //     try {
  //                 //       const token = localStorage.getItem("token");

  //                 //       const response = await apiClient.post(`/campaignStatusChange`,
  //                 //         {
  //                 //           status: nextChecked ? "ACTIVE" : "PAUSED",
  //                 //           id: params.data?.identifier,
  //                 //           campaign_id: campaignid,
  //                 //           accountNumber: newaccount,
  //                 //           adset_id: adsetid,
  //                 //           name: campaignName,
  //                 //           email: userdetails?.email,
  //                 //         },
  //                 //         {
  //                 //           headers: {
  //                 //             Authorization: token
  //                 //           }
  //                 //         }
  //                 //       );

  //                 //       if (response.status === 200 || response.status === 201) {
  //                 //         functionCallForCampaigns(newaccount);
  //                 //         console.log(" Status updated on Facebook:", response.data.status, "Campaign ID:", response.data.campaign_id);
  //                 //       } else {
  //                 //         console.warn(" Backend returned unexpected status:", response.status);
  //                 //       }

  //                 //     } catch (error) {
  //                 //       console.error(" API call to /adStatusChange failed:", error?.response?.data || error.message);
  //                 //     }

  //                 //     setIsCampaignModalVisibles(false);
  //                 //     setSelectedCampaign(null);
  //                 // };

  //                 // const handlePauseCancel = () => {
  //                 //     setIsCampaignModalVisibles(false);
  //                 //     setSelectedCampaign(null);
  //                 // };

  //                 const copyToClipboard = () => {
  //                     navigator.clipboard.writeText(firstColumnValue)
  //                         .then(() => {
  //                             setTooltipText("Copied!");
  //                             setTimeout(() => setTooltipText("Click to Copy"), 2000);
  //                         })
  //                         .catch(() => {
  //                             console.error('Failed to copy to clipboard');
  //                         });
  //                 };

  //                 const handleEditClick = () => {
  //                     setIsModalVisibles(true);
  //                 };

  //                 const sendNewCommentToAPI = async (logData) => {
  //                     try {
  //                         const response = await apiClient.post('/Comments', {
  //                             commentsdatas: logData,
  //                         });
  //                         // console.log('Response from server:', response.data);
  //                     } catch (error) {
  //                         console.error('Error sending data to server:', error);
  //                     }
  //                 };

  //                 const sendEditedCommentToAPI = async (logData) => {
  //                     try {
  //                         const response = await apiClient.post('/Comments/edit', {
  //                             campaignname: logData.campaignname,
  //                             comment: logData.comment,
  //                             Account: logData.Account,
  //                             adsetid: logData.adsetid,
  //                             campaignid: logData.campaignid,
  //                             status: true
  //                         });
  //                         // console.log('Response from server (edited comment):', response.data);
  //                         return response.data;
  //                     } catch (error) {
  //                         console.error('Error sending edited comment to server:', error);
  //                         throw error;
  //                     }
  //                 };

  //                 const handleDelete = async () => {
  //                     try {
  //                         // Prepare the payload for the API call
  //                         const payload = {
  //                             campaignname: firstColumnValue,
  //                             Account: newaccount,
  //                             adsetid: adsetid,
  //                             campaignid: campaignid,
  //                         };

  //                         // Call the backend API to delete the comment
  //                         const response = await apiClient.post('/Comments/delete', payload);

  //                         if (response.status === 200 || response.status === 201) {
  //                             // Remove the comment from the local state
  //                             // const updatedComments = campaignComments.filter(
  //                             //     (comment) => comment.campaignname !== firstColumnValue
  //                             // );

  //                             // // Update the state with the updated comments
  //                             // setCampaignComments(updatedComments);
  //                             refreshComments(newaccount);

  //                             // Refresh the table or any other UI component
  //                             // changeRRefrst();

  //                             message.success('Comment deleted successfully!');
  //                             setIsModalVisibles(false); // Close the popup
  //                         } else {
  //                             message.error('Failed to delete the comment. Please try again.');
  //                         }
  //                     } catch (error) {
  //                         console.error('Error deleting the comment:', error);
  //                         message.error('Failed to delete the comment. Please try again.');
  //                     }
  //                 };

  //                 const handleOks = async () => {
  //                     try {
  //                         const logData = {
  //                             Account: newaccount,
  //                             usercommit: userdetails?.email,
  //                             campaignname: firstColumnValue,
  //                             comment: comment,
  //                             campaignid: campaignid,
  //                             adsetid: adsetid
  //                         };

  //                         if (relatedComment) {
  //                             await sendEditedCommentToAPI(logData);
  //                             refreshComments(newaccount);
  //                             message.success("Comment updated successfully!");
  //                         } else {
  //                             await sendNewCommentToAPI(logData);
  //                             refreshComments(newaccount);
  //                             message.success("New comment added successfully!");
  //                         }


  //                         setIsModalVisibles(false);
  //                     } catch (error) {
  //                         console.error('Error while submitting comment:', error);
  //                         message.error("Error while submitting the comment.");
  //                     }
  //                 };

  //                 const handleCancels = () => {
  //                     setIsModalVisibles(false);
  //                 };

  //                 const CustomTooltipContent = ({ editedTime, usercommit }) => (
  //                     <div style={{ padding: '5px', borderRadius: '5px' }}>
  //                         <p style={{ margin: 0, color: "#ffffff" }}>{usercommit}</p>
  //                         <p style={{ margin: 0, color: "#ffffff" }}>{editedTime}</p>
  //                     </div>
  //                 );

  //                 // const handlePinClick = async (campaignName, campaignid, adsetid, currentPinStatus) => {
  //                 //     const updatedPinStatus = !currentPinStatus;

  //                 //     try {
  //                 //         let response;
  //                 //         if (updatedPinStatus) {
  //                 //             response = await apiClient.post('/Pin', {
  //                 //                 campaignname: campaignName,
  //                 //                 Account: newaccount,
  //                 //                 campaignid: campaignid,
  //                 //                 adsetid: adsetid,
  //                 //                 userPin: userdetails?.email,
  //                 //                 comment: comment || ''
  //                 //             });
  //                 //             // changeRRefrst();
  //                 //             if(response.status ===200 || response.status === 201){
  //                 //                 refreshComments(newaccount);
  //                 //             }

  //                 //             message.success("Campaign pinned!");
  //                 //         } else {
  //                 //             response = await apiClient.post('/Unpin', {
  //                 //                 campaignname: campaignName,
  //                 //                 Account: newaccount,
  //                 //                 campaignid: campaignid,
  //                 //                 adsetid: adsetid
  //                 //             });
  //                 //             // changeRRefrst();
  //                 //             if(response.status ===200 || response.status === 201){
  //                 //                 refreshComments(newaccount);
  //                 //             }

  //                 //             message.success("Campaign unpinned!");
  //                 //         }

  //                 //         // Update campaignComments with the new pinned status and edited user/time
  //                 //         // const updatedComments = campaignComments.map(cmt =>
  //                 //         //     cmt.campaignname === campaignName
  //                 //         //         ? {
  //                 //         //             ...cmt,
  //                 //         //             pinned: updatedPinStatus,
  //                 //         //             editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  //                 //         //             userPin: userdetails?.email
  //                 //         //         }
  //                 //         //         : cmt
  //                 //         // );

  //                 //         // if (!campaignComments.some(cmt => cmt.campaignname === campaignName)) {
  //                 //         //     updatedComments.push({
  //                 //         //         campaignname: campaignName,
  //                 //         //         pinned: updatedPinStatus,
  //                 //         //         editedPinTime: response.data.editedPinTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  //                 //         //         userPin: userdetails?.email
  //                 //         //     });
  //                 //         // }
  //                 //         // const sortedComments = updatedComments.sort((a, b) => b.pinned - a.pinned);
  //                 //         // setCampaignComments(sortedComments);
  //                 //         setPinned(updatedPinStatus);
  //                 //     } catch (error) {
  //                 //         console.error('Error toggling pin status', error);
  //                 //         message.error('Error while updating pin status.');
  //                 //     }
  //                 // };

  //                 // const PinIcon = ({ campaignName, campaignid, adsetid, pinned }) => {
  //                 //     return (
  //                 //         <Tooltip title={pinned ? <CustomTooltipContent editedTime={editPinUserANdTime?.editedPinTime} usercommit={editPinUserANdTime?.userPin} /> : null}>
  //                 //             <button
  //                 //                 onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}
  //                 //                 style={{
  //                 //                     border: "none",
  //                 //                     background: "none",
  //                 //                     cursor: "pointer",
  //                 //                     fontSize: "16px",
  //                 //                 }}
  //                 //             >
  //                 //                 {pinned ? "📌" : "📍"}
  //                 //             </button>
  //                 //         </Tooltip>
  //                 //     );
  //                 // };

  //                 const PinIcon = ({ campaignName, campaignid, adsetid, pinned }) => (
  //                     <Tooltip
  //                       title={
  //                         pinned && (pinEditedRaw || pinEditedBy)
  //                           ? <div style={{ padding: 5 }}>
  //                               <div style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{pinEditedBy}</div>
  //                               <div style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
  //                                 {pinEditedRaw
  //                                   ? moment(pinEditedRaw, 'YYYY-MM-DD hh:mm:ss A').format('DD-MM-YYYY hh:mm:ss A')
  //                                   : ''}
  //                               </div>
  //                             </div>
  //                           : null
  //                       }
  //                       overlayInnerStyle={{
  //                         backgroundColor: theme === 'dark' ? '#111' : '#fff',
  //                         color: theme === 'dark' ? '#fff' : '#000',
  //                         border: '1px solid #ccc',   
  //                         borderRadius: 6,
  //                         // fontWeight: 500,
  //                     }}
  //                     >
  //                       <button
  //                         onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}
  //                         style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}
  //                       >
  //                         {pinned ? '📌' : '📍'}
  //                       </button>
  //                     </Tooltip>
  //                   );


  //                 const handlePinClick = async (campaignName, campaignid, adsetid, currentPinStatus) => {
  //                     const updatedPinStatus = !currentPinStatus;

  //                     try {
  //                       if (updatedPinStatus) {
  //                         // PIN
  //                         const resp = await apiClient.post('/Pin', {
  //                           campaignname: campaignName,
  //                           Account: String(rowAccount),   // ✅ use the row's account
  //                           campaignid,
  //                           adsetid,
  //                           userPin: userdetails?.email,
  //                           comment: comment || ''
  //                         });
  //                         if (resp.status === 200 || resp.status === 201) {
  //                           setPinned(true);
  //                           refreshComments(rowAccount);   // ✅ refresh only this account
  //                           message.success('Campaign pinned!');
  //                         }
  //                       } else {
  //                         // UNPIN
  //                         const resp = await apiClient.post('/Unpin', {
  //                           campaignname: campaignName,
  //                           Account: String(rowAccount),   // ✅ use the row's account
  //                           campaignid,
  //                           adsetid
  //                         });
  //                         if (resp.status === 200 || resp.status === 201) {
  //                           setPinned(false);
  //                           refreshComments(rowAccount);   // ✅ refresh only this account
  //                           message.success('Campaign unpinned!');
  //                         }
  //                       }
  //                     } catch (error) {
  //                       console.error('Error toggling pin status:', error?.response?.data || error.message);
  //                       message.error('Error while updating pin status.');
  //                     }
  //                   };


  //                 return (
  //                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
  //                          <Switch 
  //                             checked={switchOn}
  //                             // onClick={(checked) => handlePauseClick(campaignid, checked)} 
  //                             onChange={handlePauseClick} 
  //                             size="small" 
  //                             style={{
  //                               backgroundColor: switchOn ? '#91C25F' : '#d9d9d9',
  //                             }} 
  //                         />
  //                         <Modal
  //                             title="Confirm Action"
  //                             open={isCampaignModalVisibles}
  //                             className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
  //                             onOk={handlePauseOk}
  //                             onCancel={handlePauseCancel}
  //                         >
  //                             <p>
  //                                 Are you sure you want to turn {nextChecked ? "ON" : "OFF"} this campaign?
  //                             </p>
  //                             <p>campaign ID: {selectedCampaign}</p>
  //                         </Modal>
  //                         <PinIcon
  //                             campaignName={campaignName}
  //                             campaignid={campaignid}
  //                             adsetid={adsetid}
  //                             // pinned={getPinStatusForCampaign(campaignName)}
  //                             pinned={pinned}
  //                         />
  //                         {/* <div style={{ marginLeft: '2px' }}>
  //                             {(() => {
  //                                 // Find the matching campaign in the Camapignlevelstatus array
  //                                 const campaignStatus = Camapignlevelstatus.find(statusObj => statusObj.name === campaignName);

  //                                 if (campaignStatus) {
  //                                     const { status, start, end } = campaignStatus;

  //                                     // Tooltip content with start and end dates
  //                                     const tooltipContent = (
  //                                         <div>
  //                                             <p style={{ margin: 0 }}>Start: {start || 'N/A'}</p>
  //                                             <p style={{ margin: 0 }}>End: {end || 'N/A'}</p>
  //                                         </div>
  //                                     );

  //                                     if (status === 'PAUSED') {
  //                                         return (
  //                                             <Tooltip title={tooltipContent}>
  //                                                 <PauseCircleOutlined style={{ color: 'orange', fontSize: '18px' }} className='black-icon-pause' />
  //                                             </Tooltip>
  //                                         );
  //                                     } else if (status === 'ACTIVE') {
  //                                         return (
  //                                             <Tooltip title={tooltipContent}>
  //                                                 <CheckCircleOutlined style={{ color: 'green', fontSize: '18px' }} className='black-icon-active'/>
  //                                             </Tooltip>
  //                                         );
  //                                     } else {
  //                                         // Default for unknown status
  //                                         return (
  //                                             <Tooltip title={tooltipContent}>
  //                                                 <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
  //                                             </Tooltip>
  //                                         );
  //                                     }
  //                                 } else {
  //                                     // Fallback if no matching campaign is found
  //                                     return (
  //                                         <Tooltip title="No campaign data available">
  //                                             <QuestionCircleOutlined style={{ color: 'gray', fontSize: '18px' }} />
  //                                         </Tooltip>
  //                                     );
  //                                 }
  //                             })()}
  //                         </div> */}
  //                         {relatedComment ? (
  //                             <Tooltip
  //                                 // title={relatedComment || 'No comment available'}
  //                                 // title={
  //                                 //     <div>
  //                                 //       <div>{relatedComment || 'No comment available'}</div>
  //                                 //       <div>
  //                                 //         {editUserANdTime
  //                                 //           ? moment(editUserANdTime?.editedTime, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A")
  //                                 //           : ""}
  //                                 //       </div>
  //                                 //     </div>
  //                                 // }
  //                                 title={
  //                                     <div>
  //                                       <div>{relatedComment}</div>
  //                                       <div style={{ opacity: 0.85 }}>
  //                                         {editedPretty || 'N/A'}{editedBy ? ` • ${editedBy}` : ''}
  //                                       </div>
  //                                     </div>
  //                                   }
  //                                 overlayInnerStyle={{
  //                                     backgroundColor: theme === 'dark' ? '#111' : '#fff',
  //                                     color: theme === 'dark' ? '#fff' : '#000',
  //                                     border: '1px solid #ccc',   
  //                                     borderRadius: 6,
  //                                     // fontWeight: 500,
  //                                 }}
  //                             >
  //                                 <MessageOutlined
  //                                 className={theme === "dark" ? "black-icon-comment" : 'Message'}
  //                                 style={{
  //                                     cursor: 'pointer',
  //                                     marginLeft: '10px',
  //                                     marginRight: '10px',
  //                                     color: '#4CAF50'
  //                                 }}
  //                                 onClick={handleEditClick} // Open modal directly on click
  //                                 />
  //                             </Tooltip>
  //                         ) : (
  //                             <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }} />
  //                         )}
  //                         <Tooltip 
  //                             title={tooltipText}
  //                             overlayInnerStyle={{
  //                                 backgroundColor: theme === 'dark' ? '#111' : '#fff',
  //                                 color: theme === 'dark' ? '#fff' : '#000',
  //                                 border: '1px solid #ccc',   
  //                                 borderRadius: 6,
  //                                 // fontWeight: 500,
  //                             }}
  //                         >
  //                             <CopyOutlined
  //                                 onClick={copyToClipboard}
  //                                 style={{ cursor: 'pointer', marginLeft: '2px', color: "#1e1e1f", marginRight: '10px' }}
  //                             />
  //                         </Tooltip>
  //                         <LinkOutlined 
  //                             onClick={() => {
  //                                 const url = `/DailyAndCampaignHistory/CampaignHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
  //                                 window.open(url, '_blank', 'noopener,noreferrer');
  //                             }}
  //                             style={{marginRight:'5px', color: "#1e1e1f", cursor: 'pointer'}}
  //                         />
  //                         <Tooltip 
  //                             title={valueWithCount}
  //                             overlayInnerStyle={{
  //                                 backgroundColor: theme === 'dark' ? '#111' : '#fff',
  //                                 color: theme === 'dark' ? '#fff' : '#000',
  //                                 border: '1px solid #ccc',   
  //                                 borderRadius: 6,
  //                                 // fontWeight: 500,
  //                             }}
  //                         >
  //                             <span
  //                                 onClick={() => {
  //                                 // Get the rowData — for group rows or leaf rows
  //                                 const rowData = params.node.group
  //                                     ? params.node.childrenAfterGroup?.[0]?.data
  //                                     : params.node.data;

  //                                 // Get the corresponding row node from AG Grid
  //                                 const rowNode = params.api.getRowNode(params.node.id);

  //                                 // Clear existing selections (for single-select mode)
  //                                 params.api.deselectAll();

  //                                 // Set this row as selected
  //                                 if (rowNode) {
  //                                     rowNode.setSelected(true);
  //                                 }

  //                                 // Your existing logic
  //                                 showCampaignLevel([rowData]);
  //                                 moveToNextTab("2");

  //                                 // Optional debug log
  //                                 // console.log("Clicked row data:", rowData);
  //                                 }}
  //                                 style={{ cursor: 'pointer' }}
  //                             >
  //                                 {valueWithCount}
  //                             </span>
  //                         </Tooltip>
  //                         <Modal
  //                             title={firstColumnValue}
  //                             visible={isModalVisibles}
  //                             className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
  //                             onOk={handleOks} // Default Ok button functionality
  //                             onCancel={handleCancels} // Default Cancel button functionality
  //                             footer={[
  //                                 <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
  //                                     <div style={{display:'flex', flexDirection:"column"}}>
  //                                         <span key="info" style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black", }}>
  //                                             Last Edited Time:
  //                                         </span>
  //                                         <span key="info1" style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black", }}>
  //                                             {editUserANdTime ? moment(editUserANdTime?.editedTime, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A") : ""}
  //                                         </span>

  //                                     </div>
  //                                     <div>
  //                                     <Button
  //                                         key="delete"
  //                                         type="danger"
  //                                         onClick={handleDelete}
  //                                         style={{ marginRight: 'auto', border: "1px solid #e3e3da" }} // Push Delete button to the far left
  //                                     >
  //                                         Delete
  //                                     </Button>
  //                                     <Button key="cancel" onClick={handleCancels} style={{marginLeft:"4px"}}>
  //                                         Cancel
  //                                     </Button>
  //                                     <Button key="ok" onClick={handleOks} style={{marginLeft:"4px", backgroundColor:"#91C25F"}}>
  //                                         Ok
  //                                     </Button>
  //                                     </div>
  //                                 </div>
  //                             ]}
  //                         >
  //                             <Input.TextArea
  //                                 placeholder="Enter your comments here"
  //                                 value={comment}
  //                                 onChange={(e) => setComment(e.target.value)}
  //                             />
  //                         </Modal>
  //                     </div>
  //                 );
  //             }
  //         }
  //     };
  const handleBulkSmartPin = async (action) => {

    if (!leafCampaigns || leafCampaigns.length === 0) {
      message.warning("Select at least one campaign");
      return;
    }

    const data = leafCampaigns.map(item => ({
      accountNumber: item.accountNumber,
      campaignid: item.campaignid,
      campaignname: item.campaignname,
      level: item.level,
      userPin: userdetails?.email
    }));

    message.loading(`${action === "pin" ? "Pinning" : "Unpinning"} selected campaigns...`, 0);

    let apiUrl = "";

    if (action === "pin") {
      apiUrl = "/SmartPinBulk";
    } else if (action === "unpin") {
      apiUrl = "/SmartUnpinBulk";
    }

    const res = await apiClient.post(apiUrl, {
      items: data
    });

    message.destroy();
    message.success(res.data.message);

    const timeStamp = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");

    // Update local state
    setCampaignComments((prev) => {
      const arr = [...prev];

      data.forEach(item => {
        const index = arr.findIndex(
          i =>
            i.campaignid == item.campaignid &&
            i.Account == item.accountNumber &&
            i.level === item.level
        );

        if (index >= 0) {
          arr[index] = {
            ...arr[index],
            pinned: action === "pin",
            userPin: userdetails?.email,
            editedPinTime: timeStamp
          };
        } else {
          arr.push({
            campaignid: item.campaignid,
            Account: item.accountNumber,
            level: "campaign",
            pinned: action === "pin",
            userPin: userdetails?.email,
            editedPinTime: timeStamp
          });
        }

      });

      return arr;
    });
  };

  const handleBulkDeleteComments = async () => {
    try {
      message.loading({
        content: 'Deleting comments for selected campaigns...',
        key: 'bulkDelete'
      });


      const items = leafCampaigns.map(item => ({
        campaignid: item.campaignid
      }));

      const body = {
        accountNumber: leafCampaigns?.[0]?.accountNumber,
        level: 'campaign',
        items
      };

      const resp = await apiClient.post(
        '/Comments/bulkdelete',
        body
      );

      if (resp.status === 200 || resp.status === 201) {
        const timeStamp = moment()
          .tz('Asia/Kolkata')
          .format('YYYY-MM-DD hh:mm:ss A');

        setCampaignComments(prev => {
          const arr = [...prev];

          leafCampaigns.forEach(item => {
            const idx = arr.findIndex(
              i =>
                String(i.campaignid) === String(item.campaignid) &&
                String(i.Account) === String(item.accountNumber) &&
                i.level === 'campaign'
            );

            if (idx >= 0) {
              arr[idx] = {
                ...arr[idx],
                comment: "",
                usercommit: userdetails?.email,
                editedTime: timeStamp
              };
            }
          });

          return arr;
        });

        message.success({
          content: `${leafCampaigns.length} comment(s) deleted successfully`,
          key: 'bulkDelete',
          duration: 3
        });

        setIsBulkCommentModalVisible(false);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      message.error({
        content: 'Error while deleting comments for selected campaigns.',
        key: 'bulkDelete'
      });
    }
  };

  const handleSmartCommentSubmit = async () => {
    try {
      message.loading({
        content: 'Saving comments for selected campaigns...',
        key: 'bulkComment'
      });

      const items = leafCampaigns.map(item => ({
        accountNumber: item.accountNumber,
        campaignname: item.campaignname,
        campaignid: item.campaignid,
        comment,
        usercommit: userdetails?.email,
        level: item.level,
      }));

      const resp = await apiClient.post(
        '/Comments/upsertBulkNew',
        { items, usercommit: userdetails?.email }
      );

      if (resp.status === 200 || resp.status === 201) {
        const timeStamp = moment().tz('Asia/Kolkata')
          .format('YYYY-MM-DD hh:mm:ss A');

        setCampaignComments(prev => {
          const arr = [...prev];

          leafCampaigns.forEach(item => {
            const idx = arr.findIndex(
              i =>
                i.campaignid == item.campaignid &&
                i.Account == item.accountNumber &&
                i.level === 'campaign'
            );

            if (idx >= 0) {
              arr[idx] = {
                ...arr[idx],
                comment,
                usercommit: userdetails?.email,
                editedTime: timeStamp
              };
            } else {
              arr.push({
                campaignid: item.campaignid,
                Account: item.accountNumber,
                campaignname: item.campaignname,
                level: 'campaign',
                comment,
                usercommit: userdetails?.email,
                editedTime: timeStamp
              });
            }
          });

          return arr;
        });

        message.success({
          content: `${leafCampaigns.length} comment(s) saved successfully`,
          key: 'bulkComment',
          duration: 3
        });
        setIsBulkCommentModalVisible(false);
      }
    } catch (error) {
      console.error('Bulk comment error:', error);
      message.error('Error while saving comments for selected campaigns.');
    }
  };
  const handleBulkStatusSubmit = async () => {
    try {
      setConfirmBulkLoading(true);

      const token = localStorage.getItem("token");

      // const filteredItems = leafCampaigns.filter(item =>
      //   bulkStatusAction === "ACTIVE"
      //     ? item.fbStatus === "PAUSED"
      //     : item.fbStatus === "ACTIVE"
      // )
      //   .map(item => ({
      //     status: bulkStatusAction,
      //     campaign_id: item.campaignid,
      //     accountNumber: String(item.accountNumber),
      //     name: item.campaignname,
      //     email: userdetails?.email,
      //   }));

      const campaignStatusMap = new Map(
        Camapignlevelstatus.map(item => [
          String(item.campaign_id),
          item.status?.toUpperCase()
        ])
      );

      // Filter leaf campaigns that actually need status change
      const filteredItems = leafCampaigns
        .filter(item => {
          const campaignId = String(item.campaignid);
          const currentStatus =
            campaignStatusMap.get(campaignId) || "ACTIVE";

          return bulkStatusAction === "ACTIVE"
            ? currentStatus === "PAUSED"
            : currentStatus === "ACTIVE";
        })
        .map(item => ({
          status: bulkStatusAction,
          campaign_id: item.campaignid,
          accountNumber: String(item.accountNumber),
          name: item.campaignname,
          email: userdetails?.email,
        }));

      if (filteredItems.length === 0) {
        message.info("No campaigns need updating.");
        setIsBulkStatusModalVisible(false);
        setConfirmBulkLoading(false);
        return;
      }


      const resp = await apiClient.post(
        "/BulkCampaignStatusChangeMany",
        { items: filteredItems },
        { headers: { Authorization: token } }
      );


      if (resp.status === 200 || resp.status === 201) {
        const updatedCampaignLevelStatus = (() => {
          const arr = Array.isArray(Camapignlevelstatus)
            ? [...Camapignlevelstatus]
            : [];

          filteredItems.forEach(update => {
            const idx = arr.findIndex(
              c =>
                String(c.campaign_id) === String(update.campaign_id) &&
                String(c.accountNumber) === String(update.accountNumber)
            );

            if (idx !== -1) {
              arr[idx] = {
                ...arr[idx],
                status: bulkStatusAction
              };
            }
          });

          return arr;
        })();
        setCamapignlevelstatus(updatedCampaignLevelStatus);
        if (campaignStatusFilter !== "All") {
          const campaignStatusMap = new Map(
            updatedCampaignLevelStatus.map(item => [
              String(item.campaign_id),
              item.status?.toUpperCase()
            ])
          );

          const filteredRowObjects = newRowDataForFilter.current.filter(row =>
            campaignStatusMap.get(String(row.campaignid)) ===
            campaignStatusFilter?.toUpperCase()
          );

          setRowData(filteredRowObjects);
        }
        // setCamapignlevelstatus(prev => {
        //   const arr = [...prev];

        //   filteredItems.forEach(update => {
        //     const idx = arr.findIndex(
        //       c =>
        //         String(c.campaign_id) === String(update.campaign_id) &&
        //         String(c.accountNumber) === String(update.accountNumber)
        //     );

        //     if (idx !== -1) {
        //       arr[idx] = { ...arr[idx], status: bulkStatusAction };
        //     }
        //   });

        //   return arr;
        // });

        message.success(
          `${filteredItems.length} campaign(s) updated to ${bulkStatusAction.toLowerCase()}`
        );
      }

    } catch (e) {
      console.error(e);
      message.error("Bulk campaign update failed.");
    } finally {
      setIsBulkStatusModalVisible(false);
      setConfirmBulkLoading(false);
    }
  };

  const openBulkCategoryModal = () => {
    setBulkOpen(true);
    setBulkCategory("");
  };
  // const saveBulkCategory = async () => {
  //   if (!bulkCategory.trim()) {
  //     message.warning("Enter category");
  //     return;
  //   }

  //   const token = localStorage.getItem("token");
  //   const items = leafCampaigns
  //     .filter(item => !item.category || item.category.trim() === "")
  //     .map(item => ({
  //       accountNumber: item.accountNumber,
  //       campaignid: item.campaignid,
  //       level: "campaign",
  //       campaignname: item.campaignname,
  //     }));

  //   if (items.length === 0) {
  //     message.info("All selected campaigns already have a category. Nothing to update.");
  //     setBulkOpen(false);
  //     return;
  //   }

  //   try {
  //     message.loading({ content: "Updating category...", key: "bulkCategory" });

  //     await apiClient.post(
  //       "/BulkUpdateCategory",
  //       { items, category: bulkCategory },
  //       { headers: { Authorization: token } }
  //     );
  //     setCampaignComments(prev => {
  //       const arr = [...prev];
  //       setLeafCampaigns(prev =>
  //         prev.map(item =>
  //           (!item.category || item.category.trim() === "")
  //             ? { ...item, category: bulkCategory }
  //             : item
  //         )
  //       )
  //       items.forEach(item => {
  //         const idx = arr.findIndex(
  //           i =>
  //             String(i.campaignid) === String(item.campaignid) &&
  //             String(i.Account) === String(item.accountNumber) &&
  //             i.level === "campaign"
  //         );

  //         if (idx >= 0) {
  //           if (arr[idx] && arr[idx].category) {
  //             arr[idx].category = arr[idx].category;
  //           } else {
  //             arr[idx].category = bulkCategory;
  //           }

  //         } else {
  //           arr.push({
  //             campaignid: item.campaignid,
  //             Account: item.accountNumber,
  //             level: "campaign",
  //             category: bulkCategory
  //           });
  //         }
  //       });

  //       return arr;
  //     });
  //     leafCampaigns.forEach(item => {
  //       const key = `${item.campaignid}_${item.accountNumber}_campaign`;
  //       commentsMap.set(key, { category: bulkCategory });
  //     });

  //     message.success({ content: "Category updated!", key: "bulkCategory" });

  //   } catch (err) {
  //     console.error(err);
  //     message.error("Failed to update category");
  //   }

  //   setBulkOpen(false);
  // };
  const saveBulkCategory = async () => {
    if (!bulkCategory.trim()) {
      message.warning("Enter category");
      return;
    }

    const token = localStorage.getItem("token");


    const items = leafCampaigns.map(item => ({
      accountNumber: item.accountNumber,
      campaignid: item.campaignid,
      level: "campaign",
      campaignname: item.campaignname,
    }));

    if (items.length === 0) {
      message.info("No campaigns selected.");
      setBulkOpen(false);
      return;
    }

    try {
      message.loading({ content: "Updating category...", key: "bulkCategory" });

      await apiClient.post(
        "/BulkUpdateCategoryNew",
        { items, category: bulkCategory },
        { headers: { Authorization: token } }
      );


      setLeafCampaigns(prev =>
        prev.map(item => ({
          ...item,
          category: bulkCategory
        }))
      );


      setCampaignComments(prev => {
        const arr = [...prev];

        items.forEach(item => {
          const idx = arr.findIndex(
            i =>
              String(i.campaignid) === String(item.campaignid) &&
              String(i.Account) === String(item.accountNumber) &&
              i.level === "campaign"
          );

          if (idx >= 0) {
            arr[idx].category = bulkCategory;
          } else {
            arr.push({
              campaignid: item.campaignid,
              Account: item.accountNumber,
              level: "campaign",
              category: bulkCategory
            });
          }
        });

        return arr;
      });


      leafCampaigns.forEach(item => {
        const key = `${item.campaignid}_${item.accountNumber}_campaign`;
        commentsMap.set(key, { category: bulkCategory });
      });

      message.success({ content: "Category updated!", key: "bulkCategory" });
    } catch (err) {
      console.error(err);
      message.error("Failed to update category");
    }

    setBulkOpen(false);
  };
  const autoGroupColumnDef = {
    headerName: 'Campaign name',
    minWidth: 450,
    pinned: 'left',
    sortable: true,
    unSortIcon: true,
    headerClass: 'ag-center-header',
    // filter: "agTextColumnFilter",
    // filterValueGetter: (params) => {
    //   if (params.node.group) {
    //     // Use the group key (campaign name)
    //     return params.node.key;
    //   }
    //   // For leaf rows, use the campaign_name or any field
    //   return params.data?.campaignname || '';
    // },

    // comparator: (campaignA, campaignB) => {
    //   if (!campaignA) return 1;
    //   if (!campaignB) return -1;

    //   const getPinStatusForCampaign = (campaignName) => {
    //     const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
    //     return relatedComment ? relatedComment.pinned : false;
    //   };

    //   const isPinnedA = getPinStatusForCampaign(campaignA);
    //   const isPinnedB = getPinStatusForCampaign(campaignB);

    //   if (isPinnedA !== isPinnedB) {
    //     return isPinnedA ? -1 : 1;  // Pinned campaigns should come first
    //   }
    //   return campaignA.localeCompare(campaignB);
    // },
    valueFormatter: (params) => {
      // GROUP ROW
      if (params.node?.group) {
        const firstChild = params.node.childrenAfterGroup?.[0]?.data;
        return firstChild?.campaignname ?? params.node.key;
      }

      // LEAF ROW
      return params.value;
    },
    comparator: (groupKeyA, groupKeyB, nodeA, nodeB) => {

      // get first leaf row of group A
      const leafA = nodeA.allLeafChildren?.[0]?.data;
      const leafB = nodeB.allLeafChildren?.[0]?.data;

      // safety
      if (!leafA) return 1;
      if (!leafB) return -1;

      const campaignidA = leafA.campaignid;
      const accountA = leafA.accountNumber;
      const campaignidB = leafB.campaignid;
      const accountB = leafB.accountNumber;

      // find pinned record for A
      const recA = campaignComments.find(c =>
        String(c.Account) === String(accountA) &&
        String(c.campaignid) === String(campaignidA) &&
        c.level === "campaign"
      );

      const recB = campaignComments.find(c =>
        String(c.Account) === String(accountB) &&
        String(c.campaignid) === String(campaignidB) &&
        c.level === "campaign"
      );

      const pinnedA = recA?.pinned ?? false;
      const pinnedB = recB?.pinned ?? false;

      // 1️⃣ PINNED FIRST when sorting ASC
      if (pinnedA !== pinnedB) return pinnedA ? -1 : 1;

      // 2️⃣ fallback: alphabetical by group key
      return String(groupKeyA).localeCompare(String(groupKeyB));
    },

    cellRenderer: "agGroupCellRenderer",

    cellRendererParams: {
      checkbox: true,
      suppressCount: false,
      innerRenderer: (params) => {
        if (params.node.footer) return 'Total';

        const firstColumnValue = (() => {
          if (params.node.childrenAfterGroup?.length > 0) {
            return params.node.childrenAfterGroup[0]?.data?.campaignname || params.node.key;
          }
          return params.node.key; // fallback to campaignid
        })();  // campaign name
        const campaignName = firstColumnValue;

        // ids + row account
        let campaignid, adsetid, rowAccount;
        if (params.node.group && params.node.childrenAfterGroup && params.node.childrenAfterGroup.length > 0) {
          const firstChild = params.node.childrenAfterGroup[0].data;
          campaignid = firstChild?.campaignid;
          adsetid = firstChild?.adsetid;
          rowAccount = firstChild?.accountNumber ?? null;
        } else if (params.data) {
          campaignid = params.data?.campaignid;
          adsetid = params.data?.adsetid;
          rowAccount = params.data?.accountNumber ?? null;
        } else {
          console.error('Missing campaignid or adsetid for campaign:', campaignName);
          // return <div style={{ color: 'red' }}>Error: campaignid or adsetid missing for {campaignName}</div>;
        }

        // 🧰 accounts for bulk endpoints (single row -> 1 element array is fine)
        const accountsParam = rowAccount
          ? [String(rowAccount)]
          : (Array.isArray(newaccount) ? newaccount.map(String) : [String(newaccount)]);
        const authHeaders = { headers: { Authorization: localStorage.getItem("token") } };

        // 🎯 pick this row's record (campaign + account [+ids])
        const rec = campaignComments.find(c =>
          // c.campaignname === campaignName &&
          String(c.Account) === String(rowAccount) &&
          (c.campaignid ? String(c.campaignid) === String(campaignid) : true)
          && c.level === "campaign"
          // && (c.adsetid ? String(c.adsetid) === String(aid) : true)
        );

        const relatedComment = rec?.comment ?? null;

        // comment edited meta
        const editedRaw = rec?.editedTime ?? '';
        const editedBy = rec?.usercommit ?? '';
        const editedPretty = editedRaw
          ? moment(editedRaw, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A")
          : '';

        // pin meta
        const pinEditedRaw = rec?.editedPinTime ?? '';
        const pinEditedBy = rec?.userPin ?? '';

        // pin state (per row account)
        const [pinned, setPinned] = useState(!!rec?.pinned);
        useEffect(() => { setPinned(!!rec?.pinned); }, [rec?.pinned]);

        const [tooltipText, setTooltipText] = useState("Click to Copy");
        const [isModalVisibles, setIsModalVisibles] = useState(false);

        // campaign status toggle (per row account)
        const [isCampaignModalVisibles, setIsCampaignModalVisibles] = useState(false);
        const [selectedCampaign, setSelectedCampaign] = useState(null);
        // const [switchOn, setSwitchOn] = useState(false);
        const [nextChecked, setNextChecked] = useState(false);
        const [pendingAccount, setPendingAccount] = useState(null);

        const [comment, setComment] = useState(relatedComment || '');
        const [universalOject, setUniversalObject] = React.useState(null)
        const [confirmLoading, setConfirmLoading] = React.useState(false);

        // get override Map from grid context
        const overrides = params.context?.campaignStatusOverridesRef?.current; // Map

        // build a stable key per row (account + campaign)
        const statusKey = `${rowAccount}-${campaignid}`;

        // INIT: 1) prefer override Map; 2) fallback to row.data.__status; 3) one-time fallback to Camapignlevelstatus
        const [switchOn, setSwitchOn] = useState(() => {
          const fromMap = overrides?.get(statusKey); // "ACTIVE" / "PAUSED" / undefined
          if (fromMap === "ACTIVE" || fromMap === "PAUSED") return fromMap === "ACTIVE";

          if (params.data?.__status) return params.data.__status === "ACTIVE";

          const st = Camapignlevelstatus.find(
            s => String(s.campaign_id) === String(campaignid) &&
              String(s.accountNumber) === String(rowAccount)
          );
          return st ? st.status === "ACTIVE" : false;
        });

        React.useEffect(() => {
          setUniversalObject(campaignComments.find(d => d.level === "campaign" && d.campaignid === campaignid && d.Account === rowAccount));
          const rec = campaignComments.find(d => d.level === "campaign" && d.campaignid === campaignid && d.Account === rowAccount)
          setComment(rec?.comment || '');
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [campaignComments]);

        // init ON/OFF from the correct account
        // useEffect(() => {
        //   const st = Camapignlevelstatus.find(s =>
        //     String(s.campaign_id) === String(campaignid) &&
        //     String(s.accountNumber) === String(rowAccount)
        //   );
        //   setSwitchOn(st ? st.status === "ACTIVE" : false);
        // }, [Camapignlevelstatus, campaignid, rowAccount]);

        // status change click -> confirm modal
        const handlePauseClick = (checked) => {
          setSelectedCampaign(campaignid);
          setNextChecked(checked);
          setPendingAccount(rowAccount);
          setIsCampaignModalVisibles(true);
        };

        // const handlePauseOk = async () => {
        //   setSwitchOn(nextChecked); // optimistic
        //   try {
        //     const token = localStorage.getItem("token");
        //     await apiClient.post(
        //       `/BulkCampaignStatusChange`,
        //       {
        //         status: nextChecked ? "ACTIVE" : "PAUSED",
        //         id: params.data?.identifier,
        //         campaign_id: campaignid,
        //         accountNumber: String(pendingAccount), // per row account
        //         adset_id: adsetid,
        //         name: campaignName,
        //         email: userdetails?.email,
        //       },
        //       { headers: { Authorization: token } }
        //     );
        //     functionCallForCampaigns(pendingAccount);
        //     message.success(`Campaign ${nextChecked ? 'activated' : 'paused'}`);
        //   } catch (e) {
        //     message.error("Failed to update campaign status");
        //     setSwitchOn(prev => !prev); // revert
        //   } finally {
        //     setIsCampaignModalVisibles(false);
        //     setSelectedCampaign(null);
        //     setPendingAccount(null);
        //   }
        // };

        const handlePauseOk = async () => {
          const desired = nextChecked;                  // true => ACTIVE, false => PAUSED
          setIsCampaignModalVisibles(true);
          setConfirmLoading(true);
          try {
            const token = localStorage.getItem("token");
            const payload = {
              status: desired ? "ACTIVE" : "PAUSED",
              id: params.data?.identifier,
              campaign_id: campaignid,
              accountNumber: String(pendingAccount),
              adset_id: adsetid,
              name: campaignName,
              email: userdetails?.email,
            };

            const response = await apiClient.post(
              `/BulkCampaignStatusChange`,
              payload,
              { headers: { Authorization: token } }
            );

            const newStatus = desired ? "ACTIVE" : "PAUSED";

            // ✅ Persist status only in the override Map (no rowData update, no parent setState)
            // if (overrides) {
            //   overrides.set(statusKey, newStatus);
            // }

            if (response.status === 200 || response.status === 201) {
              setConfirmLoading(false);
              setSwitchOn(desired);
              const updatedCampaignLevelStatus = Camapignlevelstatus.map(item =>
                String(item.campaign_id) === String(campaignid) &&
                  String(item.accountNumber) === String(pendingAccount)
                  ? { ...item, status: newStatus } // update only this campaign
                  : item
              );
              setCamapignlevelstatus(updatedCampaignLevelStatus);
              if (campaignStatusFilter !== "All") {
                const campaignStatusMap = new Map(
                  updatedCampaignLevelStatus.map(item => [
                    String(item.campaign_id),
                    item.status?.toUpperCase()
                  ])
                );

                const filteredRowObjects = newRowDataForFilter.current.filter(row =>
                  campaignStatusMap.get(String(row.campaignid)) ===
                  campaignStatusFilter?.toUpperCase()
                );

                setdailyData(filteredRowObjects);
              }
              // setCamapignlevelstatus(prevStatus =>
              //   prevStatus.map(item =>
              //     String(item.campaign_id) === String(campaignid) &&
              //       String(item.accountNumber) === String(pendingAccount)
              //       ? { ...item, status: newStatus } // ✅ update only the status
              //       : item // keep others as is
              //   )
              // );
              setIsCampaignModalVisibles(false);
            }

            message.success(`Campaign ${newStatus.toLowerCase()}`);
          } catch (e) {
            setConfirmLoading(false);
            // revert only this switch
            setSwitchOn(prev => !prev);
            message.error("Failed to update campaign status");
          } finally {
            // setIsCampaignModalVisibles(false);
            setSelectedCampaign(null);
            setPendingAccount(null);
          }
        };
        const handleSmartCampaignStatusClick = async () => {
          const desiredStatus = nextChecked ? "ACTIVE" : "PAUSED";

          // 🌟 CASE 1 → Only one campaign selected  
          if (!leafCampaigns || leafCampaigns.length <= 1) {
            handlePauseOk();   // <-- SAME as PIN fallback
            return;
          }

          // 🌟 CASE 2 → MULTIPLE campaigns → Bulk update
          const listToUpdate = leafCampaigns.filter(item =>
            String(item.fbStatus).toUpperCase() !== desiredStatus
          );

          if (listToUpdate.length === 0) {
            message.info("All selected campaigns already have this status.");
            return;
          }

          try {
            message.loading({
              content: desiredStatus === "ACTIVE"
                ? "Activating selected campaigns..."
                : "Pausing selected campaigns...",
              key: "campaignBulk",
            });

            const token = localStorage.getItem("token");

            const results = await Promise.allSettled(
              listToUpdate.map(item =>
                apiClient.post(
                  `/BulkCampaignStatusChange`,
                  {
                    status: desiredStatus,
                    id: item.identifier,
                    campaign_id: item.campaignid,
                    accountNumber: String(item.accountNumber),
                    adset_id: "",
                    name: item.campaignname,
                    email: userdetails?.email
                  },
                  { headers: { Authorization: token } }
                )
              )
            );

            const successCount = results.filter(r => r.status === "fulfilled").length;
            const failedCount = results.length - successCount;

            // 🔥 Update UI locally — exactly like your single campaign version
            setCamapignlevelstatus(prev => {
              const arr = [...prev];
              listToUpdate.forEach(update => {
                const idx = arr.findIndex(
                  c =>
                    String(c.campaign_id) === String(update.campaignid) &&
                    String(c.accountNumber) === String(update.accountNumber)
                );

                if (idx !== -1) {
                  arr[idx] = { ...arr[idx], status: desiredStatus };
                }
              });
              return arr;
            });

            message.success({
              content: `${successCount} updated, ${failedCount} failed`,
              key: "campaignBulk",
              duration: 3,
            });

            setIsCampaignModalVisibles(false);

          } catch (e) {
            console.error("Bulk campaign status error:", e);
            message.error("Failed to update selected campaigns.");
          }
        };
        const handlePauseCancel = () => {
          setIsCampaignModalVisibles(false);
          setSelectedCampaign(null);
          setPendingAccount(null);
        };

        // copy
        const copyToClipboard = () => {
          navigator.clipboard.writeText(firstColumnValue)
            .then(() => {
              setTooltipText("Copied!");
              setTimeout(() => setTooltipText("Click to Copy"), 2000);
            })
            .catch(() => console.error('Failed to copy to clipboard'));
        };

        const handleEditClick = () => setIsModalVisibles(true);

        // 💬 BULK comment upsert (per campaign + optional adset)
        const upsertCommentBulk = async ({ text }) => {
          const newResponse = await apiClient.post(
            '/Comments/upsert',
            {
              accountNumber: rowAccount,
              campaignname: campaignName,
              campaignid,
              comment,
              usercommit: userdetails?.email,
              level: "campaign"
            },
            authHeaders
          );
          if (newResponse.status === 200 || newResponse.status === 201) {
            setCampaignComments(prev => {
              const arr = Array.isArray(prev) ? [...prev] : [];
              const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

              const match = arr.findIndex(
                i =>
                  String(i?.campaignid) === String(campaignid) &&
                  String(i?.Account) === String(rowAccount) &&
                  // String(i?.adsetid) === String(adsetid) &&
                  // String(i?.ad_id) === String(adid) &&
                  String(i?.level) === 'campaign'
              );

              if (match >= 0) {
                arr[match] = { ...arr[match], comment: comment, usercommit: userdetails?.email, editedTime: timeStamp };
              } else {
                arr.push({
                  campaignid,
                  Account: rowAccount,
                  // adsetid,
                  // ad_id: adid,
                  level: 'campaign',
                  comment: comment,
                  usercommit: userdetails?.email,
                  editedTime: timeStamp
                });
              }

              return arr;
            });
          }
        };

        // delete comment (bulk)
        const handleDelete = async () => {
          try {
            const newResponse = await apiClient.post(
              '/New/Comments/delete',
              {
                accountNumber: rowAccount,
                campaignname: campaignName,
                campaignid,
                // comment,
                usercommit: userdetails?.email,
                level: "campaign"
              },
              authHeaders
            );
            if (newResponse.status === 200 || newResponse.status === 201) {
              setCampaignComments(prev => {
                const arr = Array.isArray(prev) ? [...prev] : [];
                const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

                const match = arr.findIndex(
                  i =>
                    String(i?.campaignid) === String(campaignid) &&
                    String(i?.Account) === String(rowAccount) &&
                    // String(i?.adsetid) === String(adsetid) &&
                    // String(i?.ad_id) === String(adid) &&
                    String(i?.level) === 'campaign'
                );

                if (match >= 0) {
                  arr[match] = { ...arr[match], comment: "", usercommit: userdetails?.email, editedTime: timeStamp };
                }
                // else {
                //   arr.push({
                //     campaignid,
                //     Account: rowAccount,
                //     // adsetid,
                //     // ad_id: adid,
                //     level: 'campaign',
                //     comment: comment,
                //     usercommit: userdetails?.email,
                //     editedTime: timeStamp
                //   });
                // }

                return arr;
              });
              message.success('Comment deleted successfully!');
              setIsModalVisibles(false);
            } else {
              message.error('Failed to delete the comment. Please try again.');
            }
          } catch (error) {
            console.error('Error deleting the comment:', error);
            message.error('Failed to delete the comment. Please try again.');
          }
        };

        // OK on comment modal
        const handleOks = async () => {
          try {
            await upsertCommentBulk({ text: comment });
            // refreshComments(rowAccount || newaccount);
            message.success(relatedComment ? "Comment updated successfully!" : "New comment added successfully!");
            setIsModalVisibles(false);
          } catch (error) {
            console.error('Error while submitting comment:', error);
            message.error("Error while submitting the comment.");
          }
        };

        const handleSmartCommentSubmit = async () => {
          if (leafCampaigns && leafCampaigns.length > 1) {
            try {
              message.loading({ content: 'Saving comments for selected campaigns...', key: 'bulkComment' });

              const items = leafCampaigns.map(item => ({
                accountNumber: item.accountNumber,
                campaignname: item.campaignname,
                campaignid: item.campaignid,
                comment,
                usercommit: userdetails?.email,
                level: item.level,
              }));
              console.log('Sending items:', items);

              const resp = await apiClient.post(
                '/Comments/upsertBulk',
                { items, usercommit: userdetails?.email },
                authHeaders
              );

              if (resp.status === 200 || resp.status === 201) {
                setCampaignComments(prev => {
                  const arr = Array.isArray(prev) ? [...prev] : [];
                  const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

                  leafCampaigns.forEach(item => {
                    const match = arr.findIndex(
                      i =>
                        String(i?.campaignid) === String(item.campaignid) &&
                        String(i?.Account) === String(item.accountNumber) &&
                        String(i?.level) === 'campaign'
                    );

                    if (match >= 0) {
                      arr[match] = { ...arr[match], comment, usercommit: userdetails?.email, editedTime: timeStamp };
                    } else {
                      arr.push({
                        campaignid: item.campaignid,
                        Account: item.accountNumber,
                        level: 'campaign',
                        comment,
                        usercommit: userdetails?.email,
                        editedTime: timeStamp,
                      });
                    }
                  });

                  return arr;
                });

                message.success({
                  content: `${leafCampaigns.length} comment(s) saved successfully`,
                  key: 'bulkComment',
                  duration: 3,
                });

                setIsModalVisibles(false);
              }
            } catch (error) {
              console.error('Bulk comment error:', error);
              message.error('Error while saving comments for selected campaigns.');
            }
            return;
          }
          handleOks();
        };

        const handleCancels = () => setIsModalVisibles(false);

        //  Pin / Unpin (BULK, per campaign + optional adset)
        const handlePinClick = async (cName, cId, aId, currentPinStatus) => {
          const updatedPinStatus = !currentPinStatus;
          try {
            if (updatedPinStatus) {
              const resp = await apiClient.post(
                '/NewPinBulk',
                {
                  accountNumber: rowAccount,
                  campaignname: campaignName,
                  campaignid,
                  userPin: userdetails?.email,
                  comment: comment || '',
                  level: "campaign"
                },
                authHeaders
              );
              if (resp.status === 200 || resp.status === 201) {
                // if (newResponse.status === 200 || newResponse.status === 201) {
                setCampaignComments(prev => {
                  const arr = Array.isArray(prev) ? [...prev] : [];
                  const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

                  const match = arr.findIndex(
                    i =>
                      String(i?.campaignid) === String(campaignid) &&
                      String(i?.Account) === String(rowAccount) &&
                      //   String(i?.adsetid) === String(adsetid) &&
                      //   String(i?.ad_id) === String(adid) &&
                      String(i?.level) === 'campaign'
                  );

                  if (match >= 0) {
                    arr[match] = { ...arr[match], pinned: true, userPin: userdetails?.email, editedPinTime: timeStamp };
                  } else {
                    arr.push({
                      campaignid,
                      Account: rowAccount,
                      //   adsetid,
                      //   ad_id: adid,
                      level: 'campaign',
                      pinned: true,
                      userPin: userdetails?.email,
                      editedPinTime: timeStamp
                    });
                  }

                  return arr;
                });
                //   }

                setPinned(true);
                // refreshComments(rowAccount || newaccount);
                message.success("Campaign pinned!");
              }
            } else {
              const resp = await apiClient.post(
                '/NewUnpinBulk',
                {
                  accountNumber: rowAccount,
                  campaignname: campaignName,
                  campaignid,
                  userPin: userdetails?.email,
                  comment: comment || '',
                  level: "campaign"
                },
                authHeaders
              );
              if (resp.status === 200 || resp.status === 201) {
                // if (newResponse.status === 200 || newResponse.status === 201) {
                setCampaignComments(prev => {
                  const arr = Array.isArray(prev) ? [...prev] : [];
                  const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

                  const match = arr.findIndex(
                    i =>
                      String(i?.campaignid) === String(campaignid) &&
                      String(i?.Account) === String(rowAccount) &&
                      //   String(i?.adsetid) === String(adsetid) &&
                      //   String(i?.ad_id) === String(adid) &&
                      String(i?.level) === 'campaign'
                  );

                  if (match >= 0) {
                    arr[match] = { ...arr[match], pinned: false, userPin: userdetails?.email, editedPinTime: timeStamp };
                  } else {
                    arr.push({
                      campaignid,
                      Account: rowAccount,
                      //   adsetid,
                      //   ad_id: adid,
                      level: 'campaign',
                      pinned: false,
                      userPin: userdetails?.email,
                      editedPinTime: timeStamp
                    });
                  }

                  return arr;
                });

                setPinned(false);
                // refreshComments(rowAccount || newaccount);
                message.success("Campaign unpinned!");
              }
            }
          } catch (error) {
            console.error('Error toggling pin status:', error?.response?.data || error.message);
            message.error('Error while updating pin status.');
          }
        };
        const handleSmartPinClick = async (cName, cId, aId, currentPinStatus) => {
          const updatedPinStatus = !currentPinStatus;

          // ✅ If multiple checkboxes selected
          if (leafCampaigns && leafCampaigns.length > 1) {
            try {
              if (updatedPinStatus) {
                // 🔹 Multi-PIN flow
                message.loading({ content: 'Pinning selected campaigns...', key: 'smartPin' });

                const results = await Promise.allSettled(
                  leafCampaigns.map(item =>
                    apiClient.post(
                      '/NewPinBulk',
                      {
                        accountNumber: item.accountNumber,
                        campaignname: item.campaignname,
                        campaignid: item.campaignid,
                        userPin: userdetails?.email,
                        level: item.level,
                      },
                      authHeaders
                    )
                  )
                );

                const successCount = results.filter(r => r.status === 'fulfilled' && (r.value?.status === 200 || r.value?.status === 201)).length;
                const failureCount = results.length - successCount;

                // ✅ Update UI instantly (same as single-pin)
                setCampaignComments(prev => {
                  const arr = Array.isArray(prev) ? [...prev] : [];
                  const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

                  leafCampaigns.forEach(item => {
                    const match = arr.findIndex(
                      i =>
                        String(i?.campaignid) === String(item.campaignid) &&
                        String(i?.Account) === String(item.accountNumber) &&
                        String(i?.level) === 'campaign'
                    );

                    if (match >= 0) {
                      arr[match] = { ...arr[match], pinned: true, userPin: userdetails?.email, editedPinTime: timeStamp };
                    } else {
                      arr.push({
                        campaignid: item.campaignid,
                        Account: item.accountNumber,
                        level: 'campaign',
                        pinned: true,
                        userPin: userdetails?.email,
                        editedPinTime: timeStamp,
                      });
                    }
                  });

                  return arr;
                });

                message.success({
                  content: `${successCount} campaign(s) pinned, ${failureCount} failed`,
                  key: 'smartPin',
                  duration: 3,
                });
              } else {
                // 🔹 Multi-UNPIN flow
                message.loading({ content: 'Unpinning selected campaigns...', key: 'smartUnpin' });

                const results = await Promise.allSettled(
                  leafCampaigns.map(item =>
                    apiClient.post(
                      '/NewUnpinBulk',
                      {
                        accountNumber: item.accountNumber,
                        campaignname: item.campaignname,
                        campaignid: item.campaignid,
                        userPin: userdetails?.email,
                        level: item.level,
                      },
                      authHeaders
                    )
                  )
                );

                const successCount = results.filter(r => r.status === 'fulfilled' && (r.value?.status === 200 || r.value?.status === 201)).length;
                const failureCount = results.length - successCount;

                // ✅ Update UI instantly for unpin
                setCampaignComments(prev => {
                  const arr = Array.isArray(prev) ? [...prev] : [];
                  const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

                  leafCampaigns.forEach(item => {
                    const match = arr.findIndex(
                      i =>
                        String(i?.campaignid) === String(item.campaignid) &&
                        String(i?.Account) === String(item.accountNumber) &&
                        String(i?.level) === 'campaign'
                    );

                    if (match >= 0) {
                      arr[match] = { ...arr[match], pinned: false, userPin: userdetails?.email, editedPinTime: timeStamp };
                    } else {
                      arr.push({
                        campaignid: item.campaignid,
                        Account: item.accountNumber,
                        level: 'campaign',
                        pinned: false,
                        userPin: userdetails?.email,
                        editedPinTime: timeStamp,
                      });
                    }
                  });

                  return arr;
                });

                message.success({
                  content: `${successCount} campaign(s) unpinned, ${failureCount} failed`,
                  key: 'smartUnpin',
                  duration: 3,
                });
              }
            } catch (error) {
              console.error('Bulk Pin/Unpin Error:', error);
              message.error('Failed to update selected campaigns.');
            }
            return;
          }

          // ✅ Otherwise, use your existing single-pin logic
          handlePinClick(cName, cId, aId, currentPinStatus);
        };
        const PinIcon = ({ universalOject, campaignName, campaignid, adsetid, pinned }) => (
          <Tooltip
            title={
              pinned
                ? <div style={{ padding: 5 }}>
                  <div style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{universalOject?.userPin}</div>
                  <div style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                    {/* {pinEditedRaw
                      ? moment(pinEditedRaw, 'YYYY-MM-DD hh:mm:ss A').format('DD-MM-YYYY hh:mm:ss A')
                      : ''} */}
                    {universalOject?.editedPinTime}
                  </div>
                </div>
                : null
            }
            overlayInnerStyle={{
              backgroundColor: theme === 'dark' ? '#111' : '#fff',
              color: theme === 'dark' ? '#fff' : '#000',
              border: '1px solid #ccc',
              borderRadius: 6,
            }}
          >
            <button
              onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}
            >
              {pinned ? '📌' : '📍'}
            </button>
          </Tooltip>
        );

        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {/* Status toggle (per-account) */}
            <Switch
              checked={switchOn}
              //   onChange={handlePauseClick}
              onChange={(checked, e) => {
                e?.stopPropagation?.();
                handlePauseClick(checked);
              }}
              size="small"
              style={{ backgroundColor: switchOn ? '#91C25F' : '#d9d9d9' }}
            />
            <Modal
              title="Confirm Action"
              open={isCampaignModalVisibles}
              className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
              onOk={handlePauseOk}
              onCancel={handlePauseCancel}
            >
              {confirmLoading && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(255,255,255,0.7)", // dim background
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                    borderRadius: "8px",
                  }}
                >
                  <Spin size="large" tip="Saving..." />
                </div>
              )}
              <div>
                <p>Are you sure you want to turn {nextChecked ? "ON" : "OFF"} this campaign?</p>
                <p>Campaign ID: {selectedCampaign}</p>
                <p>Campaign Name: {campaignName}</p>
              </div>
            </Modal>

            {/* Pin / Unpin (bulk-ready) */}
            <PinIcon
              universalOject={universalOject}
              campaignName={campaignName}
              campaignid={campaignid}
              adsetid={adsetid}
              pinned={pinned}
            />

            {/* Comment icon + tooltip with edited time/user */}
            {universalOject?.comment ? (
              <Tooltip
                title={
                  <div>
                    <div>{universalOject?.comment}</div>
                    <div style={{ opacity: 0.85 }}>
                      {universalOject?.editedTime || 'N/A'}{universalOject?.usercommit ? ` • ${universalOject?.usercommit}` : ''}
                    </div>
                  </div>
                }
                overlayInnerStyle={{
                  backgroundColor: theme === 'dark' ? '#111' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#000',
                  border: '1px solid #ccc',
                  borderRadius: 6,
                }}
              >
                <MessageOutlined
                  className={theme === "dark" ? "black-icon-comment" : 'Message'}
                  style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px', color: '#4CAF50' }}
                  onClick={handleEditClick}
                />
              </Tooltip>
            ) : (
              <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '10px', marginRight: '10px' }} />
            )}

            {/* Copy, History link, label */}
            <Tooltip
              title={tooltipText}
              overlayInnerStyle={{
                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                color: theme === 'dark' ? '#fff' : '#000',
                border: '1px solid #ccc',
                borderRadius: 6,
              }}
            >
              <CopyOutlined
                onClick={copyToClipboard}
                style={{ cursor: 'pointer', marginLeft: '2px', color: "#1e1e1f", marginRight: '10px' }}
              />
            </Tooltip>

            <LinkOutlined
              onClick={() => {
                const url = `/DailyAndCampaignHistory/CampaignHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${rowAccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              style={{ marginRight: '5px', color: "#1e1e1f", cursor: 'pointer' }}
            />

            <Tooltip
              title={firstColumnValue}
              overlayInnerStyle={{
                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                color: theme === 'dark' ? '#fff' : '#000',
                border: '1px solid #ccc',
                borderRadius: 6,
              }}
            >
              <span
                onClick={() => {
                  const rowData = params.node.group
                    ? params.node.childrenAfterGroup?.[0]?.data
                    : params.node.data;
                  const rowNode = params.api.getRowNode(params.node.id);
                  params.api.deselectAll();
                  if (rowNode) rowNode.setSelected(true);
                  showCampaignLevel([rowData]);
                  moveToNextTab("2");
                }}
                style={{ cursor: 'pointer' }}
              >
                {firstColumnValue}
              </span>
            </Tooltip>

            {/* Comment modal (bulk upsert/delete) */}
            <Modal
              title={firstColumnValue}
              visible={isModalVisibles}
              className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
              onOk={handleOks}
              onCancel={handleCancels}
              footer={[
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <div style={{ display: 'flex', flexDirection: "column" }}>
                    <span style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                      Last Edited Time:
                    </span>
                    <span style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                      {universalOject?.editedTime || ""}
                    </span>
                  </div>
                  <div>
                    <Button
                      key="delete"
                      type="danger"
                      onClick={handleDelete}
                      style={{ marginRight: 'auto', border: "1px solid #e3e3da" }}
                    >
                      Delete
                    </Button>
                    <Button key="cancel" onClick={handleCancels} style={{ marginLeft: "4px" }}>
                      Cancel
                    </Button>
                    <Button key="ok" onClick={handleOks} style={{ marginLeft: "4px", backgroundColor: "#91C25F" }}>
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

  const functionCall2 = async () => {
    try {
      setLoading1(true);
      const api = newRevenuePratner === "FB_DomainActive" ? "Daily/CampaignName" : "Daily";
      const collectionName = newRevenuePratner === "FB_DomainActive" ? "Facebook_DActive_Names" : newRevenuePratner === "FB_InuvoPrism" ? "Facebook_InuvoPrismDaily" : newtworkCollections[newRevenuePratner];
      // const fetchData = await apiClient.get(`/${api}?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=${newtworkCollections[newRevenuePratner]}`);
      // const fetchData = await apiClient.get(`/CampaignLevel?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&status=Daily&network=${collectionName}`);
      // const mainData = fetchData.data;

      // ✅ Always call the multi-account endpoint (single or multiple)
      const accountsParam = Array.isArray(newaccount)
        ? newaccount.map(String)
        : [String(newaccount)];

      const resp = await apiClient.post('/CampaignLevelAccounts', {
        dateStart: startDate,
        dateEnd: endDate,
        timezone: newtime,
        status: 'Daily',            // daily mode
        network: collectionName,
        accountNumbers: accountsParam
      });
      const mainData = resp.data;

      const getValidField = (field) => {
        for (const item of mainData) {
          if (item[field] && item[field].toLowerCase() !== 'failed') {
            return item[field];
          }
        }
        return '-';
      };

      fbCron.current = getValidField('fbCron');
      revenueCron.current = getValidField('revenueCron');
      cronStatus.current = getValidField('cronStatus');
      accountStatus.current = getValidField('accountStatus');


      timezone.current = mainData.length > 0 ? mainData[0].accountTimezone : "";
      let totalSpend = 0;
      let totalRevenue = 0;
      let totalProfit = 0;
      let totalCpc = 0;
      let totalFbleads = 0;
      let totalFbclicks = 0;
      let totalFblinkclicks = 0;
      let totalImpressions = 0;
      let totalConversions = 0;
      const specifiedTimeZone = selectTimezone[newtime];
      const totalRow = mainData && mainData.length > 0 ?
        mainData.map((eachData) => {
          // console.log("TQ value from API row:", eachData.tq, typeof eachData.tq);
          const Revenue = eachData.estimated_revenue !== undefined ? (eachData.estimated_revenue) : 0;
          const profit = (Revenue - eachData.spend);
          const conversions = eachData.conversions !== undefined ? eachData.conversions : 0;
          totalRevenue += Revenue;
          totalSpend += parseFloat(eachData.spend);
          totalProfit += profit;
          totalConversions += conversions;
          totalCpc += eachData.cpc;
          totalFbclicks += eachData.fbClicks;
          totalFblinkclicks += eachData.fbLinkClicks;
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
          const fbLClicks = parseInt(eachData.fbLinkClicks, 10);
          const spend = parseFloat(eachData.spend);
          const cpcLinkClicks = isNaN(fbLClicks) || fbLClicks === 0 ? 0 : Math.round((spend / fbLClicks) * 100) / 100;
          const category = campaignComments.find(campaign => campaign.campaignname === eachData.campaign_name && campaign.Account === eachData.accountNumber);
          const campaign_date = Camapignlevelstatus.find(campaign => campaign.campaign_id === eachData.campaign_id && campaign.accountNumber === eachData.accountNumber);
          console.log(campaignComments.find(campaign => campaign.campaignname === eachData.campaign_name && campaign.Account === eachData.accountNumber), "category check");
          const campaignObjectStatus = Camapignlevelstatus
            .find(item =>
              String(item.campaign_id) === String(eachData.campaign_id) &&
              String(item.accountNumber) === String(eachData.accountNumber)
            );

          // console.log(eachData.campaign_name, "campaign_name");
          return (
            {
              campaignname: eachData.campaign_name,
              adsetname: eachData.adsetName,
              date: eachData[specifiedTimeZone],
              'fb-hour': eachData.campaign_id,
              'mnet-hour': eachData.campaign_id,
              spend: parseFloat(eachData.spend).toFixed(2),
              revenue: parseFloat(mainRvenue).toFixed(2),
              profit: parseFloat(profit),
              // margin: margin,
              fbleads: parseInt(eachData.fbLeads),
              conversions: parseInt(eachData.conversions),
              cpc: parseFloat(eachData.cpc),
              cpclinkclicks: cpcLinkClicks,
              fbclicks: parseInt(eachData.fbClicks),
              fblinkclicks: parseInt(eachData.fblinkclicks),
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
              adid: "",
              adname: "",
              actions: '...',
              from: campaign_date?.start ? campaign_date?.start : "",
              to: campaign_date?.end ? campaign_date?.end : "",
              profitloss: "",
              M_tq: "",
              D_tq: "",
              fbCron: eachData.fbCron,
              revenueCron: eachData.revenueCron,
              accountStatus: eachData.accountStatus,
              cronStatus: eachData.cronStatus,
              accountNumber: eachData.accountNumber,
              category: category?.category ? category.category : "",
              fbStatus: campaignObjectStatus?.status,
            }
          )
        }) : null;

      // if (mainData.length > 0) {
      //     fbCron.current = mainData[0].fbCron || "-";
      //     revenueCron.current = mainData[0].revenueCron || "-";
      //     cronStatus.current = mainData[0].cronStatus || "-";
      //     accountStatus.current = mainData[0].accountStatus || "-";
      // } else {
      //     fbCron.current = "-";
      //     revenueCron.current = "-";
      //     cronStatus.current = "-";
      //     accountStatus.current = "-";
      // }

      const fullData = filteredData?.length > 0 ? [...filteredData] : [];

      let newFilterData;
      if (campaignStatusFilter !== "All") {
        newFilterData = fullData.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
      }
      else {
        newFilterData = fullData;
      }

      // setRowData(newFilterData);
      newRowDataForFilter.current = fullData;

      // const filteredByStatus = campaignStatusFilter && campaignStatusFilter.toLowerCase() !== 'all'
      //   ? fullData.filter(item => {
      //     const campaign = Camapignlevelstatus.find(
      //       c => c?.campaign_id?.toString() === item?.campaignid?.toString()
      //     );

      //     return (
      //       campaign?.status?.toUpperCase() === campaignStatusFilter?.toUpperCase()
      //     );
      //   })
      //   : fullData;

      setDailyFixedFooter([
        {
          campaignName: 'Total',
          actions: '',
          spend: parseFloat(
            newFilterData.reduce((acc, curr) => acc + parseFloat(curr.spend || 0), 0).toFixed(2)
          ),
          revenue: parseFloat(
            newFilterData.reduce((acc, curr) => acc + parseFloat(curr.revenue || 0), 0).toFixed(2)
          ),
          profit: parseFloat(
            newFilterData.reduce((acc, curr) => acc + parseFloat(curr.profit || 0), 0).toFixed(2)
          ),
          margin: parseFloat(
            (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.profit || 0), 0) /
              (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.revenue || 0), 0) || 1) *
              100).toFixed(2)
          ),
          rpc: parseFloat(
            (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.rpc || 0), 0) /
              (newFilterData.length || 1)).toFixed(2)
          ),
          cpl: parseFloat(
            (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.cpl || 0), 0) /
              (newFilterData.length || 1)).toFixed(2)
          ),
          ncpl: parseFloat(
            (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.ncpl || 0), 0) /
              (newFilterData.length || 1)).toFixed(2)
          ),
          fbleads: parseFloat(
            newFilterData.reduce((acc, curr) => acc + parseFloat(curr.fbleads || 0), 0).toFixed(2)
          ),
          conversions: parseFloat(
            newFilterData.reduce((acc, curr) => acc + parseFloat(curr.conversions || 0), 0).toFixed(2)
          ),
          fmargin: parseFloat(
            (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.profit || 0), 0) /
              (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.spend || 0), 0) || 1) *
              100).toFixed(2)
          ),
          roi: parseFloat(
            ((newFilterData.reduce((acc, curr) => acc + parseFloat(curr.revenue || 0), 0) -
              newFilterData.reduce((acc, curr) => acc + parseFloat(curr.spend || 0), 0)) /
              (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.spend || 0), 0) || 1) *
              100).toFixed(2)
          ),
          cpc: parseFloat(
            (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.cpc || 0), 0) /
              (newFilterData.length || 1)).toFixed(2)
          ),
          cpclinkclicks: parseFloat(
            (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks || 0), 0) /
              (newFilterData.length || 1)).toFixed(2)
          ),
          fbclicks: parseFloat(
            newFilterData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks || 0), 0).toFixed(2)
          ),
          fblinkclicks: parseFloat(
            newFilterData.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks || 0), 0).toFixed(2)
          ),
          impressions: parseFloat(
            newFilterData.reduce((acc, curr) => acc + parseFloat(curr.impressions || 0), 0).toFixed(2)
          ),
          ctr: parseFloat(
            (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.fbclicks || 0), 0) /
              (newFilterData.reduce((acc, curr) => acc + parseFloat(curr.impressions || 0), 0) || 1) *
              100).toFixed(2)
          ),
          tq:
            newFilterData?.length
              ? Math.round(
                newFilterData.reduce(
                  (acc, curr) => acc + (curr.tq !== undefined && !isNaN(curr.tq) ? Number(curr.tq) : 0),
                  0
                ) * 100
              ) / 100
              : 0,
        },
      ]);

      setdailyData(newFilterData);

      // setDailyFixedFooter(
      //     [
      //         {
      //             campaignName: 'Total',
      //             actions: '',
      //             spend: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
      //             revenue: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
      //             profit: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
      //             margin: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
      //             rpc: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / fullData?.length).toFixed(2)),
      //             cpl: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / fullData?.length).toFixed(2)),
      //             ncpl: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / fullData?.length).toFixed(2)),
      //             fbleads: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
      //             conversions: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
      //             fmargin: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
      //             roi: parseFloat(((fullData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
      //             cpc: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / fullData?.length).toFixed(2)),
      //             cpclinkclicks: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks), 0) / fullData?.length).toFixed(2)),
      //             fbclicks: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
      //             fblinkclicks: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0).toFixed(2)),
      //             impressions: parseFloat(fullData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
      //             ctr: parseFloat((fullData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / fullData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2)),
      //             tq: fullData?.length
      //             ? Math.round(
      //                 fullData.reduce((acc, curr) =>
      //                     acc + (curr.tq !== undefined && !isNaN(curr.tq) ? Number(curr.tq) : 0), 0
      //             ) * 100) / 100
      //             : 0,
      //         }
      //     ]
      // );

      // setdailyData(fullData);

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
  //     gridRef1.current = params;

  //     params.api.applyColumnState({ 
  //         state: columnDefs || [], 
  //         applyOrder: true 
  //     });
  // };

  // // Effect to handle event listener based on toggleStatus
  // useEffect(() => {
  //     if (!gridRef1.current) return; // Ensure gridRef exists

  //     const gridApi = gridRef1.current.api;
  //     const handleDragStopped = (e) => debouncedHandleColumnMove(e, 'grid2');

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
  const gridOptions1 = useMemo(() => ({
    onColumnMoved: (params) => {
      // if (toggleStatus) {
      debouncedHandleColumnMove(params, 'grid2');
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
    new agGrid.Grid(gridDiv, gridOptions1);

    // Set column definitions separately after grid initialization
    gridOptions1.api.setColumnDefs(columnDefs);
  });
  const restoreGridState = (gridApi) => {
    const filterModel = JSON.parse(localStorage.getItem('gridFilterModel'));
    const sortModel = JSON.parse(localStorage.getItem('gridSortModel'));

    if (gridApi) {
      if (filterModel) gridApi.setFilterModel(filterModel);
      if (sortModel) gridApi.setSortModel(sortModel);
    }
  };

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



  const handleReFetchData = () => {
    functionCall2();
    setApiStatus(false);
  }

  // useEffect(() => {
  //     if(oneTimeFetch.current){
  //         functionCall2();
  //         oneTimeFetch.current = false;
  //     }
  // }, [oneTimeFetch.current]);

  useEffect(() => {
    if (campaignStatusFilter && Camapignlevelstatus.length > 0) {
      functionCall2();
    }
  }, []);

  useEffect(() => {
    // functionCall1();
    console.log(campaignStatusFilter, "campaignStatusFilter");
    if (campaignStatusFilter !== "All") {
      // const filteredByStatus = newRowDataForFilter.current.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
      // const filteredByStatus = memorizedDailyData.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
      const campaignStatusMap = new Map(
        Camapignlevelstatus.map(item => [
          String(item.campaign_id),
          item.status?.toUpperCase()
        ])
      );

      const filteredRowObjects = newRowDataForFilter.current.filter(row =>
        campaignStatusMap.get(String(row.campaignid)) ===
        campaignStatusFilter?.toUpperCase()
      );
      setdailyData(filteredRowObjects);
      // setdailyData(filteredByStatus);
    } else {
      setdailyData(newRowDataForFilter.current);
    }
  }, [campaignStatusFilter]);

  // useEffect(() => {
  //   // console.log(campaignComments, "campaignComments");
  //   const mainData = newRowDataForFilter.current;
  //   const filterData = mainData && mainData.length > 0 ?
  //     mainData.map((eachData) => {
  //       const adsetObjectStatus = Camapignlevelstatus
  //         .find(item =>
  //           String(item.campaign_id) === String(eachData.campaignid) &&
  //           String(item.accountNumber) === String(eachData.accountNumber)
  //         );
  //       return (
  //         {
  //           ...eachData,
  //           fbStatus: adsetObjectStatus?.status || "ACTIVE",
  //         }
  //       )
  //     }) : null;
  //   newRowDataForFilter.current = filterData;
  //   let newFilterData;
  //   if (campaignStatusFilter !== "All") {
  //     console.log("testing 4444");
  //     newFilterData = filterData?.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
  //   }
  //   else {
  //     newFilterData = filterData;
  //   }

  //   setdailyData(newFilterData);
  //   // newRowDataForFilter.current = filteredData;
  //   console.log("testing 4444");
  // }
  //   , [Camapignlevelstatus]);

  useEffect(() => {
    if (refreshpage === "Refresh21") {
      handleReFetchData();
      showCampaignLevel([]);
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

  useEffect(() => {
    if (removeSelectedCampaigns === "Remove") {
      if (gridRef1.current) {
        gridRef1.current.api.deselectAll(); // ✅ clears selection in grid
        // showCampaignLevel([]);             // ✅ manually clears selection data
      }
    }
  }, [removeSelectedCampaigns]);

  // normalize to array
  const ids = Array.isArray(newaccount)
    ? newaccount
    : (newaccount ? [newaccount] : []);

  return (
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
          ) : newRowDataForFilter.current?.length > 0 ? (
            <div>
              <Row className="header-row" style={{ width: '100%', height: "8%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap', backgroundColor: theme === "dark" && "#4d4d4d", }}>
                <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                  <Space align="center" className='daily-contaier'>
                    <div className="blinking-circle"></div>
                    <Text style={{ paddingLeft: '3px', fontSize: '15px', color: theme === "dark" && "white" }}>Daily</Text>
                  </Space>
                </Col>
                {leafCampaigns?.length > 1 && (
                  <Col>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "6px 0",
                      }}
                    >
                      {/* active & pause */}
                      <Tooltip
                        title={
                          <div style={{ display: "flex", gap: "14px" }}>
                            <span
                              style={{ cursor: "pointer", fontSize: "18px", color: "green" }}
                              onClick={() => {
                                setBulkStatusAction("ACTIVE");
                                setIsBulkStatusModalVisible(true);
                              }}
                            >
                              ▶️
                            </span>
                            <span
                              style={{ cursor: "pointer", fontSize: "18px", color: "red" }}
                              onClick={() => {
                                setBulkStatusAction("PAUSED");
                                setIsBulkStatusModalVisible(true);
                              }}
                            >
                              ⏸️
                            </span>
                          </div>
                        }
                        overlayInnerStyle={{
                          backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                          color: theme === "dark" ? "#ffffff" : "#000000",
                          borderRadius: 6,
                          padding: "6px 10px",
                          fontSize: "14px",
                        }}
                      >
                        <RxSwitch size={20} style={{ color: theme === "dark" ? "white" : "black" }} />

                      </Tooltip>

                      <Modal
                        title="Confirm Bulk Status Change"
                        open={isBulkStatusModalVisible}
                        onCancel={() => setIsBulkStatusModalVisible(false)}
                        confirmLoading={confirmBulkLoading}
                        onOk={handleBulkStatusSubmit}
                        className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                      >
                        {confirmBulkLoading && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: "rgba(255,255,255,0.7)",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              zIndex: 1000,
                              borderRadius: "8px",
                            }}
                          >
                            <Spin size="large" tip="Saving..." />
                          </div>
                        )}

                        <p>
                          Are you sure you want to set status to{" "}
                          <b style={{ color: bulkStatusAction === "ACTIVE" ? "green" : "red" }}>
                            {bulkStatusAction}
                          </b>{" "}
                          for <b>{leafCampaigns.length}</b> campaigns?
                        </p>
                      </Modal>
                      {/* pin & unpin */}
                      <Tooltip
                        title={
                          <div style={{ display: "flex", gap: "14px" }}>
                            <span
                              style={{ cursor: "pointer", fontSize: "18px" }}
                              onClick={() => handleBulkSmartPin("pin")}
                            >
                              📌
                            </span>
                            <span
                              style={{ cursor: "pointer", fontSize: "18px" }}
                              onClick={() => handleBulkSmartPin("unpin")}
                            >
                              📍
                            </span>
                          </div>
                        }
                        overlayInnerStyle={{
                          backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                          color: theme === "dark" ? "#ffffff" : "#000000",
                          borderRadius: 6,
                          padding: "6px 10px",
                          fontSize: "14px",
                        }}
                      >
                        <button
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontSize: "18px",
                          }}
                        >
                          <PushpinOutlined size={20} style={{ color: theme === "dark" ? "white" : "black" }} />
                        </button>
                      </Tooltip>
                      {/*  comment */}
                      <Tooltip title="Bulk comment" overlayInnerStyle={{
                        backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                        color: theme === "dark" ? "#ffffff" : "#000000",
                        borderRadius: 6,
                        padding: "6px 10px",
                        fontSize: "14px",
                      }}>
                        <EditOutlined
                          onClick={() => setIsBulkCommentModalVisible(true)}
                          style={{
                            fontSize: "15px",
                            cursor: "pointer",
                            color: theme === "dark" ? "white" : "black"
                          }}
                        />
                      </Tooltip>
                      <Modal
                        title="Bulk comment"
                        open={isBulkCommentModalVisible}
                        onCancel={() => setIsBulkCommentModalVisible(false)}
                        className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                        footer={[
                          <Button key="Delete" onClick={handleBulkDeleteComments}>
                            Delete
                          </Button>,
                          <Button key="cancel" onClick={() => setIsBulkCommentModalVisible(false)}>
                            Cancel
                          </Button>,
                          <Button
                            key="ok"
                            style={{ backgroundColor: "#91C25F" }}
                            onClick={() => {
                              handleSmartCommentSubmit();
                              setIsBulkCommentModalVisible(false);
                            }}
                          >
                            Ok
                          </Button>
                        ]}
                      >
                        <Input.TextArea
                          placeholder="Enter comments"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={4}
                        />
                      </Modal>

                      {/* Category */}
                      <Tooltip title="Bulk add category" overlayInnerStyle={{
                        backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                        color: theme === "dark" ? "#ffffff" : "#000000",
                        borderRadius: 6,
                        padding: "6px 10px",
                        fontSize: "14px",
                      }}>
                        <PlusOutlined
                          onClick={openBulkCategoryModal}
                          style={{
                            fontSize: "15px",
                            cursor: "pointer",
                            marginLeft: '5px',
                            color: theme === "dark" ? "white" : "black"
                          }}
                        />
                      </Tooltip>
                      <Modal
                        open={bulkOpen}
                        title="Edit Category"
                        onOk={saveBulkCategory}
                        onCancel={() => setBulkOpen(false)}
                        className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                      >
                        <Input
                          placeholder="Enter category"
                          value={bulkCategory}
                          onChange={e => setBulkCategory(e.target.value)}
                        />
                      </Modal>
                    </div>
                  </Col>
                )}

                {/* <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ color: theme === "dark" && "white" }}>Id: {newaccount}</Text>
                                        </Col> */}
                <Col xs={24} sm={24} md={8} style={{ flex: "1 1 auto" }}>
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
                                color: theme === "dark" ? "#ddd" : "#333"
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
                            color: theme === "dark" ? "#9ad" : "grey"
                          }}
                        />
                      </Badge>
                    </Tooltip>
                  )}
                </Col>
                {/* <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ color: theme === "dark" && "white" }}>Name: {newAccountName}</Text>
                                        </Col>
                                        <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                            <Text style={{ color: theme === "dark" && "white" }}>Time zone: {timezone.current}</Text>
                                        </Col> */}


                <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                  {ids.length <= 1 && (
                    <Text style={{ color: theme === "dark" ? "white" : undefined }}>
                      Name: {newAccountName ?? "-"}
                    </Text>
                  )
                  }
                </Col>


                <Col xs={24} sm={24} md={8} style={{ flex: "1 1 auto" }}>
                  {ids.length <= 1 ? (
                    // Single → plain text
                    <Text style={{ color: theme === "dark" ? "white" : undefined }}>
                      Time zone: {ids[0] ? `${timezone.current ?? "-"}` : "-"}
                    </Text>
                  ) : (
                    // Multiple → icon with tooltip of selected account ids + timezones
                    <Tooltip
                      title={
                        <div style={{ maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
                          {ids.map((id, i) => {
                            const acc = accountsAccess.find(a => a.accountNumber === id);
                            console.log("timezones:", accountsAccess);
                            const tz = acc?.timeZone ?? "-";
                            return (
                              <div
                                key={`${id}-${i}`}
                                style={{
                                  padding: "4px 6px",
                                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                                  fontSize: 12,
                                  color: theme === "dark" ? "#ddd" : "#333"
                                }}
                              >
                                {id} - {tz}
                              </div>
                            );
                          })}
                        </div>
                      }
                      overlayInnerStyle={{
                        maxWidth: 320,
                        background: theme === "dark" ? "#1f1f1f" : "#fff",
                        color: theme === "dark" ? "#fff" : "#000"
                      }}
                    >
                      <Badge count={ids.length} size="small" offset={[0, 2]}>
                        <GlobalOutlined
                          style={{
                            fontSize: 18,
                            cursor: "pointer",
                            color: theme === "dark" ? "#9ad" : "grey"
                          }}
                        />
                      </Badge>
                    </Tooltip>
                  )}
                </Col>

                {/* <Col xs={24} sm={24} md={4} lg={2} style={{ flex: "0.2 0 auto" }}>
                                            <Tooltip
                                                title={
                                                    <>
                                                        <div>FbAcc Status: {`${fbCron.current}`}</div>
                                                        <div>RevAcc Status: {`${revenueCron.current}`}</div>
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
                                        </Col> */}
                <Col>
                  <Input
                    placeholder="Search..."
                    // prefix={<SearchOutlined />}
                    onChange={(value) => setInsideInput(value.target.value)}
                    // onBlur={handleBlur}
                    value={insideInput}
                    allowClear
                    className={theme === 'dark' ? 'inputatInsideTable custom-input-dark' : 'inputatInsideTable custom-input-light'}
                    style={{
                      borderRadius: 8,
                      border: '1px solid #91C25F',
                      // background: theme === 'dark' ? '#2a2a2a' : '#fff',
                      // border: `1px solid ${theme === 'dark' ? '#444' : '#d9d9d9'}`,
                      color: theme === 'dark' ? '#fff' : '#000',
                      fontWeight: 500,
                      width: 120,
                      marginRight: '8px'
                    }}
                  />
                </Col>

                <Col>
                  <Dropdown
                    overlay={
                      <Menu
                        onClick={({ key }) =>
                          // onStatusFilterChange && 
                          // onStatusFilterChange(key)
                          setcampaignStatusLabel(key)
                        } // <-- Add this line
                        items={[
                          {
                            key: 'All',
                            label: (
                              <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                                <span
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: '#122F6E',
                                    marginRight: '6px',
                                  }}
                                ></span>
                                All
                              </span>
                            ),
                          },
                          {
                            key: 'Active',
                            label: <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: 'green',
                                  marginRight: '6px',
                                }}
                              ></span>
                              Active

                            </span>
                          },
                          {
                            key: 'Paused', label: <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: 'red',
                                  marginRight: '6px',
                                }}
                              ></span>
                              Paused

                            </span>
                          },
                          {
                            key: 'Archived', label: <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: 'orange',
                                  marginRight: '6px',
                                }}
                              ></span>
                              Archived

                            </span>
                          },
                        ]}
                      />
                    }
                    trigger={['click']}
                  >
                    <Button
                      type="default"
                      style={{
                        borderRadius: 8,
                        background: theme === 'dark' ? 'rgba(82,196,26,0.12)' : '#f6ffed',
                        border: '1px solid #4CAF50',
                        color: theme === 'dark' ? '#95de64' : '#389e0d',
                        fontWeight: 500,
                        marginRight: '5px'
                      }}
                    >
                      <Space size={2}>
                        <FilterOutlined />
                        {campaignStatusFilter}
                        <DownOutlined style={{ fontSize: 10 }} />
                      </Space>
                    </Button>
                  </Dropdown>
                </Col>

                <Col xs={24} sm={24} md={4} lg={2} style={{ flex: "0.2 0 auto" }}>
                  <Tooltip
                    title={
                      <div style={{ fontSize: '13px' }}>
                        {fbCron.current !== '-' && <div>Fb status: {fbCron.current?.toLowerCase()}</div>}
                        {revenueCron.current !== '-' && <div>Rev status: {revenueCron.current?.toLowerCase()}</div>}
                        {(cronStatus.current !== '-' || accountStatus.current !== '-') && (
                          <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                            Cron status: {cronStatus.current?.toLowerCase()}
                          </Text>
                        )}
                        {accountStatus.current && <div>
                          Account:  <span
                            style={{
                              marginLeft: '3px',
                              color:
                                accountStatus.current === 'Active'
                                  ? '#91C25F'
                                  : accountStatus.current === 'Inactive'
                                    ? '#EC7117'
                                    : 'gray',
                              // fontWeight: 'bold',
                            }}
                          >
                            {accountStatus.current}
                          </span>
                        </div>}
                      </div>
                    }
                    overlayInnerStyle={{
                      backgroundColor: theme === 'dark' ? '#111' : '#fff',
                      color: theme === 'dark' ? '#fff' : '#000',
                      border: '1px solid #ccc',
                      borderRadius: 6,
                      // fontWeight: 500,
                    }}
                  >

                    <InfoCircleOutlined
                      style={{
                        fontSize: '18px',
                        cursor: 'pointer',
                        marginRight: '10px',
                        color: "#91C25F",
                      }}
                      className="black-icon-info"
                    />
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
                  {/* <Tooltip title="Export to CSV"> */}
                  <Button type="primary" style={{ backgroundColor: '#91C25F', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined className="black-icon" />} onClick={() => onBtExport(gridRef1, "Daily")} />
                  {/* </Tooltip> */}
                </Col>
              </Row>
              {dailyData?.length > 0 ? (
                <div
                  className={`ag-theme-alpine ag-container ${gridThemeClass}`}
                >

                  <div className='table-container'>
                    <AgGridReact
                      ref={gridRef1}
                      context={context}
                      className='custom-grid'
                      rowHeight={30}
                      suppressReactUi={true}
                      // rowSelection="multiple"
                      groupSelectsChildren={true} // ✅ Selects all children when a group is selected
                      suppressRowClickSelection={true} // ✅ Prevents selection on row click, only via checkbox
                      rowSelection="multiple"
                      rowData={memorizedDailyData}
                      // immutableData={true}
                      // getRowId={params => params.data.id}
                      columnDefs={memorizedColumnDef1}
                      onCellClicked={onCellClicked}
                      pagination={true}
                      paginationPageSize={200}
                      paginationPageSizeSelector={[20, 40, 60, 80, 100, 150, 200]}
                      groupDisplayType='multipleColumns'
                      suppressAggFuncInHeader={true}
                      groupSuppressBlankHeader={true}
                      defaultColDef={{ ...defaultColDef, suppressMenu: true }}
                      // groupIncludeFooter={true}
                      // groupIncludeTotalFooter={true}
                      autoGroupColumnDef={autoGroupColumnDef}
                      onSelectionChanged={onSelectionChanged}
                      useValueFormatterForExport={true}
                      // onGridReady={(params) => {
                      //   gridRef1.current = params.api; // Store grid API
                      //   restoreGridState(gridRef1.current); // Restore state when grid is ready
                      //   onGridReady(params, 'grid2', gridRef1);
                      //   if (params.columnApi) {
                      //     params.columnApi.autoSizeAllColumns();
                      //   }
                      // }}
                      onGridReady={(params) => onGridReady(params, 'grid1', gridRef1)}
                      gridOptions={{
                        ...gridOptions1,
                        ensureDomOrder: false,
                        enableCharts: true,
                        suppressRowClickSelection: true,
                        suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                        enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                        groupSelectsChildren: true, // ✅ Enables Shift + Arrow for selection
                      }}
                      getMainMenuItems={getMainMenuItems}
                      pinnedBottomRowData={dailyFixedFooter}

                      // onRangeSelectionChanged={onRangeSelectionChanged} // ✅ Captures range selection
                      onCellKeyDown={onCellKeyDown}
                      getRowStyle={params => {
                        if (params.node.rowPinned) {
                          return {
                            // fontWeight: 'bold',
                            backgroundColor: theme === "dark" ? '#000' : '#fff', // Dark mode background should be dark, light mode should be light
                            color: theme === "dark" ? '#fff' : '#000',
                            height: '30px'         // Text color should contrast with the background
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
                            cpclinkclicks: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpclinkclicks), 0) / filteredData.length).toFixed(2)),
                            fbclicks: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0).toFixed(2)),
                            fblinkclicks: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fblinkclicks), 0).toFixed(2)),
                            impressions: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0).toFixed(2)),
                            ctr: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0) * 100).toFixed(2)),
                            tq: parseFloat(
                              filteredData.reduce((acc, curr) => {
                                const tqValue = Number(curr?.tq);
                                return acc + (isNaN(tqValue) ? 0 : tqValue);
                              }, 0).toFixed(2)
                            ),
                          },
                        ];

                        setDailyFixedFooter(updatedFooter);
                      }}
                    />
                  </div>
                </div>
              ) : <div style={{ backgroundColor: theme === "dark" && "#333" }}>
                <div
                  className={`ag-theme-alpine ag-container ${gridThemeClass}`}
                >

                  <div className='table-container'>
                    <AgGridReact
                      ref={gridRef1}
                      context={context}
                      className='custom-grid'
                      rowHeight={30}
                      suppressReactUi={true}
                      // rowSelection="multiple"
                      groupSelectsChildren={true} // ✅ Selects all children when a group is selected
                      suppressRowClickSelection={true} // ✅ Prevents selection on row click, only via checkbox
                      rowSelection="multiple"
                      rowData={[]}
                      columnDefs={memorizedColumnDef1}
                      onCellClicked={onCellClicked}
                      pagination={true}
                      paginationPageSize={200}
                      paginationPageSizeSelector={[20, 40, 60, 80, 100, 150, 200]}
                      groupDisplayType='multipleColumns'
                      suppressAggFuncInHeader={true}
                      groupSuppressBlankHeader={true}
                      defaultColDef={{ ...defaultColDef, suppressMenu: true }}
                      // groupIncludeFooter={true}
                      // groupIncludeTotalFooter={true}
                      autoGroupColumnDef={autoGroupColumnDef}
                      onSelectionChanged={onSelectionChanged}
                      // onGridReady={(params) => {
                      //   gridRef1.current = params.api; // Store grid API
                      //   restoreGridState(gridRef1.current); // Restore state when grid is ready
                      //   onGridReady(params, 'grid2', gridRef1);
                      //   if (params.columnApi) {
                      //     params.columnApi.autoSizeAllColumns();
                      //   }
                      // }}
                      onGridReady={(params) => onGridReady(params, 'grid1', gridRef1)}
                      gridOptions={{
                        ...gridOptions1,
                        ensureDomOrder: false,
                        enableCharts: true,
                        suppressRowClickSelection: true,
                        suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                        enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                        groupSelectsChildren: true, // ✅ Enables Shift + Arrow for selection
                      }}
                      getMainMenuItems={getMainMenuItems}
                      pinnedBottomRowData={dailyFixedFooter}

                      // onRangeSelectionChanged={onRangeSelectionChanged} // ✅ Captures range selection
                      onCellKeyDown={onCellKeyDown}
                      getRowStyle={params => {
                        if (params.node.rowPinned) {
                          return {
                            // fontWeight: 'bold',
                            backgroundColor: theme === "dark" ? '#000' : '#fff', // Dark mode background should be dark, light mode should be light
                            color: theme === "dark" ? '#fff' : '#000',
                            height: '30px'         // Text color should contrast with the background
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
                            cpclinkclicks: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.cpclinkclicks), 0) / filteredData.length).toFixed(2)),
                            fbclicks: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0).toFixed(2)),
                            fblinkclicks: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fblinkclicks), 0).toFixed(2)),
                            impressions: parseFloat(filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0).toFixed(2)),
                            ctr: parseFloat((filteredData.reduce((acc, curr) => acc + parseFloat(curr?.fbclicks), 0) / filteredData.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0) * 100).toFixed(2)),
                            tq: parseFloat(
                              filteredData.reduce((acc, curr) => {
                                const tqValue = Number(curr?.tq);
                                return acc + (isNaN(tqValue) ? 0 : tqValue);
                              }, 0).toFixed(2)
                            ),
                          },
                        ];

                        setDailyFixedFooter(updatedFooter);
                      }}
                    />
                  </div>
                </div>
              </div>}

            </div>
          ) : <div style={{ backgroundColor: theme === "dark" && "#333" }}>
            <Result
              className={theme === 'dark' ? 'dark-result' : 'light-result'}
              icon={<SmileOutlined />}
              title={`No DailyData for ${newaccount} from ${startDate} to ${endDate}`}
            // extra={<Button type="primary">Next</Button>}
            />
          </div>}
      </div>
    </div>
  );
};

export default Daily;