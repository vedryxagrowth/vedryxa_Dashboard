import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Audio } from 'react-loader-spinner';
import React from 'react';
import moment from 'moment-timezone';
import { Input, Button, Row, Col, Typography, Result, Modal, message, Switch, Tabs, Spin, Badge, Space, Tooltip, Menu, Dropdown } from 'antd';
import { NumberOutlined, GlobalOutlined, InfoCircleOutlined, DownloadOutlined, SmileOutlined, CopyOutlined, EditOutlined, MessageOutlined, PauseCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined, LinkOutlined, PushpinOutlined, FilterOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import { RxSwitch } from "react-icons/rx";
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
  "FB_Mnet": "Facebook_Mnet_AD",
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
  "FB_TonicRsoc": "Facebook_Mnet_AD",
  "FB_InuvoPrism": "Facebook_InuvoPrism",
  "FB_CodeFuel": "Facebook_Mnet_AD"
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

const AdLevelReports = ({ context, functionCallForCommnets, activeTab, startDate, endDate, newaccount, newtime, newRevenuePratner, inputValue, newAccountName, columnDefs, campaignComments, setCampaignComments, Camapignlevelstatus, changeRRefrst, debouncedHandleColumnMove, userdetails, refreshComments, refreshpage, getMainMenuItems, toggleStatus, handleChangeToggle, tabStatus, selectedCampaigns, selectedAdsets, accountsAccess, commentsMap, showAdLevel, removeSelectedAds }) => {
  // console.log(columnDefs, "columnDefs");
  // console.log(accountsAccess)
  console.log(campaignComments);
  const { theme, apiClient } = useTokenContext();
  const gridThemeClass = theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
  const getRowStyleTheme = theme === 'dark' ? { backgroundColor: '#1e1e1f', color: '#ffffff' } : { backgroundColor: '#ffffff', color: '#000000' };
  const [rowData, setRowData] = useState([]);

  const newRowDataForFilter = useRef([]);

  const [campaignStatusFilter, setcampaignStatusLabel] = useState("All");

  const [insideInput, setInsideInput] = useState("");

  const [liveFixedFooter, setLiveFixedFooter] = useState([]);

  const [isLoading, setLoading] = useState(true);

  const [apiStatus, setApiStatus] = useState(false);


  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedCells, setSelectedCells] = useState([]); // Store selected cell positions
  const [firstSelectedCell, setFirstSelectedCell] = useState(null); // Store the first selected cell
  // const [activeTab, setActiveTab] = useState("1");

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
  // const memorizedRowData = useMemo(() => rowData ? rowData?.filter((each) => {
  //   const normalizedCampaign = each.adname.trim().toLowerCase();
  //   const normalizedInput = inputValue.trim().toLowerCase();
  //   return (
  //     normalizedCampaign.startsWith(normalizedInput) ||
  //     normalizedCampaign.includes(normalizedInput) ||
  //     normalizedCampaign.endsWith(normalizedInput)
  //   );
  // }
  // ) : [], [rowData, inputValue, theme]);
  // console.log(memorizedRowData, "memorizedRowData");
  // console.log(rowData, "rowData");

  const memorizedRowData = useMemo(() => {
    let filtered = rowData || [];

    const normalizedInput = inputValue.trim().toLowerCase();
    const normalizedInside = insideInput.trim().toLowerCase();

    // 1️⃣ FIRST FILTER → by inputValue (only adname)
    if (normalizedInput) {
      filtered = filtered.filter((each) => {
        const adname = (each?.adname || "").trim().toLowerCase();
        const accountNumber = (each?.accountNumber || "").toString().trim().toLowerCase();
        const campaignId = (each?.campaignid || "").toString().trim().toLowerCase();
        const adsetId = (each?.adsetid || "").toString().trim().toLowerCase();
        const adId = (each?.adid || "").toString().trim().toLowerCase();
        return (
          adname.startsWith(normalizedInput) ||
          adname.includes(normalizedInput) ||
          adname.endsWith(normalizedInput) ||
          accountNumber.includes(normalizedInput) ||
          campaignId.includes(normalizedInput) ||
          adsetId.includes(normalizedInput) ||
          adId.includes(normalizedInput)
        );
      });
    }

    // 2️⃣ SECOND FILTER → by insideInput (all fields)
    if (normalizedInside) {
      filtered = filtered.filter((each) => {
        const adname = (each?.adname || "").trim().toLowerCase();
        const accountNumber = (each?.accountNumber || "").toString().trim().toLowerCase();
        const campaignId = (each?.campaignid || "").toString().trim().toLowerCase();
        const adsetId = (each?.adsetid || "").toString().trim().toLowerCase();
        const adId = (each?.adid || "").toString().trim().toLowerCase();

        return (
          adname.includes(normalizedInside) ||
          accountNumber.includes(normalizedInside) ||
          campaignId.includes(normalizedInside) ||
          adsetId.includes(normalizedInside) ||
          adId.includes(normalizedInside)
        );
      });
    }

    return filtered;
  }, [rowData, inputValue, insideInput]);

  const [selectedAd, setSelectedAd] = useState([]);
  const [leafCampaigns, setLeafCampaigns] = useState([]);
  const [isBulkCommentModalVisible, setIsBulkCommentModalVisible] = useState(false);
  const [comment, setComment] = useState("");
  const [isBulkStatusModalVisible, setIsBulkStatusModalVisible] = useState(false);
  const [bulkStatusAction, setBulkStatusAction] = useState(null);
  const [confirmBulkLoading, setConfirmBulkLoading] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("");
  useEffect(() => {
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
  }, [memorizedRowData]);

  const onBtExport1 = () => {
    console.log(gridRef.current.api, "in")
    const Details = {
      network: newRevenuePratner,
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
    const updateDetails = async () => {
      await apiClient.post('/UserExportActivities/', { Details });
    }
    updateDetails();

  };

  const uniqueByAdId = (arr) => {
    const map = new Map();
    arr.forEach(obj => {
      if (!map.has(obj.adid)) {
        map.set(obj.adid, obj);
      }
    });
    return Array.from(map.values());
  };
  const onSelectionChanged = (event) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);

    setSelectedAd(selectedData);
    showAdLevel(uniqueByAdId(selectedData));
    const leafCampaignsData = selectedNodes
      .filter(node => !node.group && node.data)
      .map(node => ({
        campaignid: node.data.campaignid,
        campaignname: node.data.campaignname,
        accountNumber: node.data.accountNumber,
        category: node.data.category,
        adsetid: node.data.adsetid,
        adsetname: node.data.adsetname,
        adid: node.data.adid,
        adName: node.data.adname,
        fbStatus: node.data.fbStatus,
        level: "ad",
      }))
      .filter(item => item.adid && item.adName);
    const uniqueLeafCampaigns = Array.from(
      new Map(
        leafCampaignsData.map(item => [`${item.adid}_${item.accountNumber}`, item])
      ).values()
    );

    setLeafCampaigns(uniqueLeafCampaigns);
    console.log("Selected unique Ads:", uniqueLeafCampaigns);
  };
  const handleBulkSmartPinAd = async (action) => {
    if (!leafCampaigns || leafCampaigns.length === 0) {
      message.warning("Select at least one ad");
      return;
    }

    // Convert adid → ad_id for backend
    const data = leafCampaigns.map(item => ({
      accountNumber: item.accountNumber,
      campaignid: item.campaignid,
      adsetid: item.adsetid,
      ad_id: item.adid,
      level: "ad",
      userPin: userdetails?.email
    }));

    message.loading(
      `${action === "pin" ? "Pinning" : "Unpinning"} selected ads...`,
      0
    );

    const apiUrl =
      action === "pin"
        ? "/SmartPinBulk"
        : "/SmartUnpinBulk";

    const res = await apiClient.post(apiUrl, { items: data });

    message.destroy();
    message.success(res.data.message);

    const timeStamp = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");

    setCampaignComments(prev => {
      const arr = Array.isArray(prev) ? [...prev] : [];

      data.forEach(item => {
        const idx = arr.findIndex(
          i =>
            String(i.campaignid) === String(item.campaignid) &&
            String(i.Account) === String(item.accountNumber) &&
            String(i.adsetid) === String(item.adsetid) &&
            String(i.ad_id) === String(item.ad_id) &&   // 👈 MUST MATCH ad_id
            i.level === "ad"
        );

        if (idx >= 0) {
          arr[idx] = {
            ...arr[idx],
            pinned: action === "pin",
            userPin: userdetails?.email,
            editedPinTime: timeStamp
          };
        } else {
          arr.push({
            campaignid: item.campaignid,
            Account: item.accountNumber,
            adsetid: item.adsetid,
            ad_id: item.ad_id,
            level: "ad",
            pinned: action === "pin",
            userPin: userdetails?.email,
            editedPinTime: timeStamp
          });

        }
      });

      return arr;
    });
  };

  // const handleBulkCommentSubmitAd = async () => {
  //   try {
  //     message.loading({ content: "Saving comments for ads...", key: "bulkCommentAd" });
  //     const items = leafCampaigns.map(item => ({
  //       accountNumber: item.accountNumber,
  //       campaignid: item.campaignid,
  //       adsetid: item.adsetid,
  //       ad_id: item.adid,
  //       comment,
  //       usercommit: userdetails?.email,
  //       level: "ad"
  //     }));

  //     const resp = await apiClient.post(
  //       "/Comments/upsertBulkNew",
  //       { items }
  //     );

  //     if (resp.status === 200 || resp.status === 201) {
  //       const timeStamp = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");

  //       setCampaignComments(prev => {
  //         const arr = [...prev];

  //         items.forEach(item => {
  //           const idx = arr.findIndex(
  //             i =>
  //               String(i.campaignid) === String(item.campaignid) &&
  //               String(i.Account) === String(item.accountNumber) &&
  //               String(i.adsetid) === String(item.adsetid) &&
  //               String(i.ad_id) === String(item.ad_id) &&
  //               i.level === "ad"
  //           );

  //           if (idx >= 0) {
  //             arr[idx] = {
  //               ...arr[idx],
  //               comment,
  //               usercommit: userdetails?.email,
  //               editedTime: timeStamp
  //             };
  //           } else {
  //             arr.push({
  //               ...item,
  //               editedTime: timeStamp
  //             });
  //           }
  //         });

  //         return arr;
  //       });

  //       message.success({
  //         content: `${items.length} ads updated`,
  //         key: "bulkCommentAd",
  //         duration: 3
  //       });

  //       setIsBulkCommentModalVisible(false);
  //     }

  //   } catch (err) {
  //     console.error(err);
  //     message.error("Bulk ad comment failed");
  //   }
  // };

  const handleBulkCommentSubmitAd = async () => {
    try {
      message.loading({
        content: 'Saving comments for selected adsets...',
        key: 'bulkCommentAdset'
      });

      const items = leafCampaigns.map(item => ({
        accountNumber: item.accountNumber,
        campaignid: item.campaignid,
        adsetid: item.adsetid,
        ad_id: item.adid,
        comment,
        campaignname: item.adName,
        usercommit: userdetails?.email,
        level: "ad"
      }));

      const resp = await apiClient.post(
        '/Comments/upsertBulkNew',
        { items, usercommit: userdetails?.email, }
      );

      if (resp.status === 200 || resp.status === 201) {
        const timeStamp = moment().tz('Asia/Kolkata')
          .format('YYYY-MM-DD hh:mm:ss A');

        setCampaignComments(prev => {
          const arr = [...prev];

          leafCampaigns.forEach(item => {
            const idx = arr.findIndex(
              i =>
                String(i.campaignid) === String(item.campaignid) &&
                String(i.Account) === String(item.accountNumber) &&
                String(i.adsetid) === String(item.adsetid) &&
                String(i.ad_id) === String(item.adid) &&
                i.level === 'ad'
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
                adsetid: item.adsetid,
                ad_id: item.adid,
                campaignname: item.adName,
                level: 'ad',
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
          key: 'bulkCommentAdset',
          duration: 3
        });

        setIsBulkCommentModalVisible(false);
      }

    } catch (error) {
      console.error('Bulk adset comment error:', error);
      message.error('Error while saving comments for selected adsets.');
    }
  };

  const handleBulkAdStatusSubmit = async () => {
    try {
      setConfirmBulkLoading(true);

      const token = localStorage.getItem("token");

      const filteredItems = leafCampaigns
        .filter(item =>
          bulkStatusAction === "ACTIVE"
            ? item.fbStatus === "PAUSED"
            : item.fbStatus === "ACTIVE"
        )
        .map(item => ({
          status: bulkStatusAction,
          campaign_id: item.campaignid,
          adset_id: item.adsetid,
          ad_id: item.adid,
          accountNumber: String(item.accountNumber),
          name: item.adName,
          email: userdetails?.email
        }));

      if (filteredItems.length === 0) {
        message.info("No ads need updating.");
        setIsBulkStatusModalVisible(false);
        setConfirmBulkLoading(false);
        return;
      }

      const resp = await apiClient.post(
        "/BulkAdStatusChangeMany",
        { items: filteredItems },
        { headers: { Authorization: token } }
      );

      if (resp.status === 200 || resp.status === 201) {

        const now = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");

        // 🔥 UPDATE UI — SAME AS SINGLE UPDATE
        setCampaignComments(prev => {
          let arr = Array.isArray(prev) ? [...prev] : [];

          filteredItems.forEach(update => {
            const { campaign_id, adset_id, ad_id, accountNumber, status } = update;

            const idx = arr.findIndex(i =>
              String(i.campaignid) === String(campaign_id) &&
              String(i.Account) === String(accountNumber) &&
              String(i.adsetid) === String(adset_id) &&
              String(i.ad_id) === String(ad_id) &&
              i.level === "ad"
            );

            if (idx >= 0) {
              arr[idx] = {
                ...arr[idx],
                fbStatus: status,
                editedTime: now
              };
            } else {
              arr.push({
                campaignid: campaign_id,
                Account: accountNumber,
                adsetid: adset_id,
                ad_id: ad_id,
                level: "ad",
                fbStatus: status,
                comment: "",
                usercommit: userdetails?.email,
                editedTime: now
              });
            }
          });

          return arr;
        });

        message.success(`${filteredItems.length} ad(s) updated.`);
      }

    } catch (err) {
      console.error(err);
      message.error("Bulk ad update failed");
    } finally {
      setIsBulkStatusModalVisible(false);
      setConfirmBulkLoading(false);
    }
  };
  const openBulkCategoryModal = () => {
    setBulkOpen(true);
    setBulkCategory("");
  };
  const saveBulkCategory = async () => {
    if (!bulkCategory.trim()) {
      message.warning("Enter category");
      return;
    }

    const token = localStorage.getItem("token");
    const items = leafCampaigns
      .filter(item => !item.category || item.category.trim() === "")
      .map(item => ({
        accountNumber: item.accountNumber,
        campaignid: item.campaignid,
        level: "campaign",
        campaignname: item.campaignname,
      }));

    if (items.length === 0) {
      message.info("All selected campaigns already have a category. Nothing to update.");
      setBulkOpen(false);
      return;
    }

    try {
      message.loading({ content: "Updating category...", key: "bulkCategory" });

      await apiClient.post(
        "/BulkUpdateCategory",
        { items, category: bulkCategory },
        { headers: { Authorization: token } }
      );
      setCampaignComments(prev => {
        const arr = [...prev];
        setLeafCampaigns(prev =>
          prev.map(item =>
            (!item.category || item.category.trim() === "")
              ? { ...item, category: bulkCategory }
              : item
          )
        )
        items.forEach(item => {
          const idx = arr.findIndex(
            i =>
              String(i.campaignid) === String(item.campaignid) &&
              String(i.Account) === String(item.accountNumber) &&
              i.level === "campaign"
          );

          if (idx >= 0) {
            if (arr[idx] && arr[idx].category) {
              arr[idx].category = arr[idx].category;
            } else {
              arr[idx].category = bulkCategory;
            }

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
  const autoGroupColumnDefLive = {
    headerName: 'Ad name',
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
    //   return params.data?.adname || '';
    // },

    // 🔁 Comparator now respects pin overrides so rows re-order immediately
    // comparator: (campaignA, campaignB, nodeA, nodeB) => {
    //   // build a helper that can read overrides + server fallback
    //   const pickPinned = (node) => {
    //     const d = node?.allLeafChildren?.[0]?.data || node?.data || {};
    //     const nameKey = d?.adname || d?.campaignname || '';
    //     const acc = d?.accountNumber ? String(d.accountNumber) : '';
    //     const pinKey = d?.adid ? `ad:${d.adid}` : `name:${nameKey}__acc:${acc}`;

    //     // 1) override map from parent context (persists across tabs)
    //     const override = context?.adPinOverridesRef?.current?.get(pinKey);
    //     if (override !== undefined) return override;

    //     // 2) server fallback
    //     const rel = campaignComments.find(c =>
    //       c.campaignname === nameKey &&
    //       c.Account === acc &&
    //       (!d?.adid || !c.ad_id || c.ad_id === d.adid)
    //     );
    //     return !!rel?.pinned;
    //   };

    //   if (!campaignA) return 1;
    //   if (!campaignB) return -1;

    //   const aPinned = pickPinned(nodeA);
    //   const bPinned = pickPinned(nodeB);

    //   if (aPinned !== bPinned) return aPinned ? -1 : 1;
    //   return String(campaignA).localeCompare(String(campaignB));
    // },

    // comparator: (a, b, nodeA, nodeB) => {
    //   const pickPinned = (node) => {
    //     const d = node?.group && node.childrenAfterGroup?.length
    //       ? node.childrenAfterGroup[0]?.data
    //       : node?.data;
    //     if (!d) return false;
    //     if (typeof d.__adPinned === 'boolean') return d.__adPinned; // local cache
    //     return !!d.pinned; // server fallback
    //   };
    //   const pa = pickPinned(nodeA);
    //   const pb = pickPinned(nodeB);
    //   if (pa !== pb) return pa ? -1 : 1;
    //   return String(a || '').localeCompare(String(b || ''));
    // },
    comparator: (groupKeyA, groupKeyB, nodeA, nodeB) => {

      // get first leaf row of group A
      const leafA = nodeA.allLeafChildren?.[0]?.data;
      const leafB = nodeB.allLeafChildren?.[0]?.data;
      // const leafA = nodeA?.allLeafChildren?.[0]?.data ?? nodeA?.data ?? null;
      // const leafB = nodeB?.allLeafChildren?.[0]?.data ?? nodeB?.data ?? null;

      // safety
      if (!leafA) return 1;
      if (!leafB) return -1;

      const campaignidA = leafA.campaignid;
      const accountA = leafA.accountNumber;
      const adsetidA = leafA.adsetid;
      const adidA = leafA.adid;
      const adidB = leafB.adid;
      const campaignidB = leafB.campaignid;
      const accountB = leafB.accountNumber;
      const adsetidB = leafB.adsetid;

      // find pinned record for A
      const recA = campaignComments.find(c =>
        String(c.Account) === String(accountA) &&
        String(c.campaignid) === String(campaignidA) &&
        String(c.adsetid) === String(adsetidA) &&
        String(c.ad_id) === String(adidA) &&
        c.level === "ad"
      );

      const recB = campaignComments.find(c =>
        String(c.Account) === String(accountB) &&
        String(c.campaignid) === String(campaignidB) &&
        String(c.adsetid) === String(adsetidB) &&
        String(c.ad_id) === String(adidB) &&
        c.level === "ad"
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

        // group key rendered in the cell
        const firstColumnValue = params.node.allLeafChildren?.[0]?.data?.adname || "";
        const campaignName = params.node.allLeafChildren?.[0]?.data?.campaignname || "";
        const adName = params.node.allLeafChildren?.[0]?.data?.adname || "";

        let campaignid, adsetid, adid, rowAccount;

        if (params.node.group && Array.isArray(params.node.childrenAfterGroup) && params.node.childrenAfterGroup.length > 0) {
          const firstChild = params.node.childrenAfterGroup[0]?.data;
          if (firstChild) {
            campaignid = firstChild.campaignid ?? null;
            adsetid = firstChild.adsetid ?? null;
            adid = firstChild.adid ?? null;
            rowAccount = firstChild.accountNumber ?? null;
          }
        } else if (params.data) {
          campaignid = params.data.campaignid ?? null;
          adsetid = params.data.adsetid ?? null;
          adid = params.data.adid ?? null;
          rowAccount = params.data.accountNumber ?? null;
        } else {
          console.error('Missing campaignid or adsetid for campaign:', campaignName);
          // return <div style={{ color: 'red' }}>Error: campaignid or adsetid missing for {campaignName}</div>;
        }

        // ✅ unified key (ad name preferred)
        const nameKeyForComments = adName || campaignName;

        // // accounts param
        // const accountsParam = rowAccount
        //   ? [String(rowAccount)]
        //   : (Array.isArray(newaccount) ? newaccount.map(String) : [String(newaccount)]);

        const authHeaders = { headers: { Authorization: localStorage.getItem("token") } };

        // ----- helpers (account + ad aware) -----
        const byAdScope = (c, name, acc, aid) =>
          c.campaignname === name &&
          c.Account === acc &&
          (!aid || !c.ad_id || c.ad_id === aid);

        const getEditedUserAndTime = (cName, acc) =>
          campaignComments.find(c => c.Account === rowAccount && c.campaignid === campaignid && c.adsetid === adsetid && c.ad_id === adid && c.level === "ad") || null;

        const getPinEditedUserAndTime = (cName, acc) =>
          campaignComments.find(c => c.Account === rowAccount && c.campaignid === campaignid && c.adsetid === adsetid && c.ad_id === adid && c.level === "ad") || null;

        const getStatusForCampaign = () => {
          const relatedStatus = campaignComments.find(c => c.Account === rowAccount && c.campaignid === campaignid && c.adsetid === adsetid && c.ad_id === adid && c.level === "ad");
          return relatedStatus?.fbStatus
        };

        const getCommentForCampaign = (name, acc) => {
          const c = campaignComments.find(d => d.level === "ad" && d.campaignid === campaignid && d.adsetid === adsetid && d.ad_id === adid && d.Account === rowAccount);
          return c ? c.comment : null;
        };

        const getPinStatusForCampaignAcc = (name, acc) => {
          const c = campaignComments.find(c => c.Account === rowAccount && c.campaignid === campaignid && c.adsetid === adsetid && c.ad_id === adid && c.level === "ad");
          return c ? !!c.pinned : false;
        };

        // stable account key for this row
        const accKey = String(
          rowAccount ?? (Array.isArray(newaccount) ? newaccount[0] : newaccount) ?? ''
        );
        const accountsParam = [accKey];

        // 🔄 same nameKeyForComments for all lookups
        // const accKey = rowAccount || newaccount;
        const editUserANdTime = getEditedUserAndTime(nameKeyForComments, accKey);
        const editPinUserANdTime = getPinEditedUserAndTime(nameKeyForComments, accKey);
        const relatedStatus = getStatusForCampaign();
        const relatedComment = getCommentForCampaign(nameKeyForComments, accKey);
        const valueWithCount = `${firstColumnValue}`;

        const [tooltipText, setTooltipText] = React.useState("Click to Copy");
        const [isModalVisibles, setIsModalVisibles] = React.useState(false);

        const [isAdidModalVisibles, setIsAdidModalVisibles] = React.useState(false);
        const [selectedAdid, setSelectedAdid] = React.useState(null);
        const [switchStates, setSwitchStates] = React.useState({});
        const [nextChecked, setNextChecked] = React.useState(false);
        const [universalOject, setUniversalObject] = React.useState(null)
        const [confirmLoading, setConfirmLoading] = React.useState(false);

        // comment state will be initialized on open from the UI value
        const [comment, setComment] = React.useState(relatedComment || '');

        // 🔗 pull override refs from parent context
        const { adPinOverridesRef, adStatusOverridesRef, adCommentOverridesRef } = params?.context || {};

        React.useEffect(() => {
          setUniversalObject(campaignComments.find(d => d.level === "ad" && d.campaignid === campaignid && d.adsetid === adsetid && d.ad_id === adid && d.Account === rowAccount));
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [campaignComments]);



        // patch only this leaf row (so comparators/other cells can see updates)
        const leafNode = params.node.group ? params.node.childrenAfterGroup?.[0] : params.node;
        const updateLeaf = (patch) => {
          if (!leafNode?.data) return;
          const nextData = { ...leafNode.data, ...patch };
          if (leafNode.updateData) leafNode.updateData(nextData);
          else params.api.applyTransaction({ update: [nextData] });
        };

        // quick targeted refresh  resort just this cell
        const refreshThisCell = () => {
          params.api.refreshCells({ rowNodes: [params.node], columns: [params.column.getColId()], force: true });
          params.api.refreshClientSideRowModel('sort');
        };


        // 🔑 stable keys for this ad
        const buildAdKeys = ({ adid, nameKey, account }) => {
          const acc = account ? String(account) : "";
          const fallback = `name:${nameKey || ""}__acc:${acc}`;
          const idKey = adid ? `ad:${adid}` : fallback;
          return { pinKey: idKey, statusKey: idKey, commentKey: idKey };
        };
        const { pinKey, statusKey, commentKey } = buildAdKeys({
          adid,
          nameKey: nameKeyForComments,
          account: rowAccount || (Array.isArray(newaccount) ? newaccount[0] : newaccount),
        });

        // 🧠 derive UI from overrides first, fallback to server
        const overridePinned = adPinOverridesRef?.current?.get(pinKey);
        const overrideStatus = adStatusOverridesRef?.current?.get(statusKey);     // "ACTIVE" | "PAUSED"
        const overrideComment = adCommentOverridesRef?.current?.get(commentKey);   // { text, editedBy, editedAt }

        const pinnedUI = (overridePinned !== undefined) ? overridePinned : getPinStatusForCampaignAcc(nameKeyForComments, accKey);
        const commentUI = (relatedComment ?? '') || '';
        const hasComment = commentUI.trim().length > 0;

        // apply overrides to the row so comparator / other cells see them immediately
        React.useEffect(() => {
          if (overrideStatus) updateLeaf({ __adStatus: overrideStatus });
          if (typeof overridePinned === 'boolean') updateLeaf({ __adPinned: overridePinned });
          if (overrideComment) updateLeaf({ __adComment: overrideComment.text || '' });
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);


        // 🟢 initialise switch state from AdLevel (assume ACTIVE if none)
        React.useEffect(() => {
          if (!adid) return;
          const matchedComment = campaignComments.find(
            (item) =>
              item.campaignid === campaignid &&
              Array.isArray(item.AdLevel) &&
              item.AdLevel.some(ad => ad.ad_id === adid)
          );
          const adEntry = matchedComment?.AdLevel?.find(ad => ad.ad_id === adid);
          const isActive = adEntry?.status === "ACTIVE";

          setSwitchStates(prev => ({
            ...prev,
            [adid]: matchedComment && adEntry ? isActive : true
          }));
        }, [campaignComments, campaignid, adsetid, adid]);

        // ====== ACTIVE/PAUSE ======
        const handlePauseClick = (aid, checked) => {
          setSelectedAdid(aid);
          setNextChecked(checked);
          setIsAdidModalVisibles(true);
        };

        const handlePauseOk = async () => {
          if (!selectedAdid) return;
          setIsAdidModalVisibles(true);
          setConfirmLoading(true);

          // optimistic UI via override
          // adStatusOverridesRef?.current?.set(statusKey, nextChecked ? "ACTIVE" : "PAUSED");
          // setSwitchStates(prev => ({ ...prev, [selectedAdid]: nextChecked }));
          // //   params.api.refreshCells({ rowNodes: [params.node], columns: [params.column.getColId()], force: true });
          // updateLeaf({ __adStatus: nextChecked ? 'ACTIVE' : 'PAUSED' });
          // refreshThisCell();

          try {
            const response = await apiClient.post(
              `/NewAdStatusChange`,
              {
                status: nextChecked ? "ACTIVE" : "PAUSED",
                ad_id: adid,
                name: adName,
                accountNumber: rowAccount,
                campaign_id: campaignid,
                adset_id: adsetid,
                email: userdetails?.email,
                level: "ad"
              },
              authHeaders
            );
            if (response.status === 200 || response.status === 201) {
              setConfirmLoading(false);
              setCampaignComments(prev => {
                const arr = Array.isArray(prev) ? [...prev] : [];

                const match = arr.findIndex(
                  i =>
                    String(i?.campaignid) === String(campaignid) &&
                    String(i?.Account) === String(rowAccount) &&
                    String(i?.adsetid) === String(adsetid) &&
                    String(i?.ad_id) === String(adid) &&
                    String(i?.level) === 'ad'
                );

                if (match >= 0) {
                  arr[match] = { ...arr[match], fbStatus: nextChecked ? "ACTIVE" : "PAUSED" };
                } else {
                  arr.push({
                    campaignid,
                    Account: rowAccount,
                    adsetid,
                    ad_id: adid,
                    level: 'ad',
                    comment: "",
                    usercommit: "",
                    fbStatus: nextChecked ? "ACTIVE" : "PAUSED",
                  });
                }

                return arr;
              });
              setIsAdidModalVisibles(false);
            }

            if (!(response.status === 200 || response.status === 201)) {
              throw new Error(`Unexpected status ${response.status}`);
            }
          } catch (error) {
            setConfirmLoading(false);
            // revert optimistic UI
            adStatusOverridesRef?.current?.set(statusKey, nextChecked ? "PAUSED" : "ACTIVE");
            setSwitchStates(prev => ({ ...prev, [selectedAdid]: !nextChecked }));
            // params.api.refreshCells({ rowNodes: [params.node], columns: [params.column.getColId()], force: true });
            updateLeaf({ __adStatus: nextChecked ? 'PAUSED' : 'ACTIVE' });
            refreshThisCell();
            message.error('Failed to update status.');
          } finally {
            setIsAdidModalVisibles(false);
            setSelectedAdid(null);
          }
        };
        const handleSmartAdStatusClick = async () => {
          const desired = nextChecked ? "ACTIVE" : "PAUSED";


          if (!leafCampaigns || leafCampaigns.length <= 1) {
            handlePauseOk();
            return;
          }


          const listToUpdate = leafCampaigns.filter(item =>
            String(item.fbStatus).toUpperCase() !== desired
          );

          if (listToUpdate.length === 0) {
            message.info("All selected ads already have this status.");
            return;
          }

          try {
            message.loading({
              content: desired === "ACTIVE"
                ? "Activating selected ads..."
                : "Pausing selected ads...",
              key: "bulkAdStatus"
            });

            const results = await Promise.allSettled(
              listToUpdate.map(item =>
                apiClient.post("/NewAdStatusChange", {
                  status: desired,
                  name: item.adName,
                  campaign_id: item.campaignid,
                  adset_id: item.adsetid,
                  ad_id: item.adid,
                  accountNumber: item.accountNumber,
                  email: userdetails?.email
                })
              )
            );

            const successCount = results.filter(r => r.status === "fulfilled").length;
            const failedCount = results.length - successCount;

            const now = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

            // 🌟 Update UI state for all ads
            setCampaignComments(prev => {
              const arr = [...prev];

              listToUpdate.forEach(update => {
                const idx = arr.findIndex(
                  i =>
                    String(i.campaignid) === String(update.campaignid) &&
                    String(i.Account) === String(update.accountNumber) &&
                    String(i.adsetid) === String(update.adsetid) &&
                    String(i.ad_id) === String(update.adid) &&
                    String(i.level) === "ad"
                );

                if (idx >= 0) {
                  arr[idx] = {
                    ...arr[idx],
                    fbStatus: desired,
                    statusUpdatedAt: now,
                    statusUpdatedBy: userdetails?.email
                  };
                } else {
                  arr.push({
                    campaignid: update.campaignid,
                    Account: update.accountNumber,
                    adsetid: update.adsetid,
                    ad_id: update.adid,
                    level: "ad",
                    fbStatus: desired,
                    statusUpdatedAt: now,
                    statusUpdatedBy: userdetails?.email
                  });
                }
              });

              return arr;
            });

            message.success({
              content: `${successCount} ads updated, ${failedCount} failed`,
              key: "bulkAdStatus",
              duration: 3
            });

            setIsAdidModalVisibles(false);

          } catch (err) {
            console.error("Bulk Ad Status Error:", err);
            message.error("Failed to update selected ads.");
          }
        };
        const handlePauseCancel = () => {
          setIsAdidModalVisibles(false);
          setSelectedAdid(null);
        };

        // ====== COMMENT ======
        const handleEditClick = () => {
          // initialise editor with the CURRENT UI value (override or server)
          setComment(commentUI);
          setIsModalVisibles(true);
        };

        const upsertCommentBulk = async ({ text }) => {
          const newResponse = await apiClient.post(
            '/Comments/upsert',
            {
              accountNumber: rowAccount,
              campaignname: adName,
              campaignid,
              adsetid,
              ad_id: adid,
              comment: text,
              usercommit: userdetails?.email,
              level: "ad"
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
                  String(i?.adsetid) === String(adsetid) &&
                  String(i?.ad_id) === String(adid) &&
                  String(i?.level) === 'ad'
              );

              if (match >= 0) {
                arr[match] = { ...arr[match], comment: text, usercommit: userdetails?.email, editedTime: timeStamp };
              } else {
                arr.push({
                  campaignid,
                  Account: rowAccount,
                  adsetid,
                  ad_id: adid,
                  level: 'ad',
                  comment: text,
                  usercommit: userdetails?.email,
                  editedTime: timeStamp
                });
              }

              return arr;
            });
          }
        };

        const handleDelete = async () => {
          try {
            const response = await apiClient.post(
              '/New/Comments/delete',
              {
                accountNumber: rowAccount,
                campaignname: adName,
                campaignid,
                adsetid,
                ad_id: adid,
                // comment: text,
                usercommit: userdetails?.email,
                level: "ad"
              },
              authHeaders
            );

            if (response.status === 200 || response.status === 201) {
              // optimistic clear
              //   adCommentOverridesRef?.current?.delete(commentKey);
              //   params.api.refreshCells({ rowNodes: [params.node], columns: [params.column.getColId()], force: true });
              // tombstone so UI won't fall back to stale server text
              // adCommentOverridesRef?.current?.set(commentKey, {
              //   text: '',
              //   editedBy: userdetails?.email,
              //   editedAt: new Date().toISOString(),
              //   deleted: true,
              // });
              // updateLeaf({ __adComment: '' });
              // refreshThisCell();
              setCampaignComments(prev => {
                const arr = Array.isArray(prev) ? [...prev] : [];
                const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

                const match = arr.findIndex(
                  i =>
                    String(i?.campaignid) === String(campaignid) &&
                    String(i?.Account) === String(rowAccount) &&
                    String(i?.adsetid) === String(adsetid) &&
                    String(i?.ad_id) === String(adid) &&
                    String(i?.level) === 'ad'
                );

                if (match >= 0) {
                  arr[match] = { ...arr[match], comment: "", usercommit: userdetails?.email, editedTime: timeStamp };
                }
                // else {
                //   arr.push({
                //     campaignid,
                //     Account: rowAccount,
                //     adsetid,
                //     ad_id: adid,
                //     level: 'ad',
                //     comment: text,
                //     usercommit: userdetails?.email,
                //     editedTime: timeStamp
                //   });
                // }

                return arr;
              });

              message.success('Comment deleted successfully!');
              setIsModalVisibles(false);
              // optional: refreshComments(accKey);
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
            await upsertCommentBulk({ text: comment });

            // optimistic override for instant UI
            // adCommentOverridesRef?.current?.set(commentKey, {
            //   text: comment,
            //   editedBy: userdetails?.email,
            //   editedAt: new Date().toISOString(),
            // });
            // // params.api.refreshCells({ rowNodes: [params.node], columns: [params.column.getColId()], force: true });
            // updateLeaf({ __adComment: comment });
            // refreshThisCell();

            // optional: refreshComments(accKey);
            message.success(relatedComment ? "Comment updated successfully!" : "New comment added successfully!");
            setIsModalVisibles(false);
          } catch (error) {
            console.error('Error while submitting comment:', error);
            message.error("Error while submitting the comment.");
          }
        };
        const handleSmartAdCommentSubmit = async () => {
          // MULTIPLE ads selected
          if (leafCampaigns && leafCampaigns.length > 1) {
            try {
              message.loading({
                content: 'Saving comments for selected ads...',
                key: 'bulkAdComment'
              });

              // Build bulk items list
              const items = leafCampaigns.map(item => ({
                accountNumber: item.accountNumber,
                campaignname: item.adName,
                campaignid: item.campaignid,
                adsetid: item.adsetid,
                ad_id: item.adid,
                comment,
                usercommit: userdetails?.email,
                level: "ad",
              }));

              console.log("Sending AD items:", items);

              // Call bulk API
              const resp = await apiClient.post(
                '/Comments/upsertBulk',
                { items, usercommit: userdetails?.email }
              );

              if (resp.status === 200 || resp.status === 201) {
                // Update UI state instantly
                setCampaignComments(prev => {
                  const arr = Array.isArray(prev) ? [...prev] : [];
                  const timeStamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

                  leafCampaigns.forEach(item => {
                    const match = arr.findIndex(
                      i =>
                        String(i?.campaignid) === String(item.campaignid) &&
                        String(i?.Account) === String(item.accountNumber) &&
                        String(i?.adsetid) === String(item.adsetid) &&
                        String(i?.ad_id) === String(item.adid) &&
                        String(i?.level) === 'ad'
                    );

                    if (match >= 0) {
                      arr[match] = {
                        ...arr[match],
                        comment,
                        usercommit: userdetails?.email,
                        editedTime: timeStamp
                      };
                    } else {
                      arr.push({
                        campaignid: item.campaignid,
                        Account: item.accountNumber,
                        adsetid: item.adsetid,
                        ad_id: item.adid,
                        level: 'ad',
                        comment,
                        usercommit: userdetails?.email,
                        editedTime: timeStamp,
                      });
                    }
                  });

                  return arr;
                });

                message.success({
                  content: `${leafCampaigns.length} ad comment(s) saved successfully`,
                  key: 'bulkAdComment',
                  duration: 3,
                });

                setIsModalVisibles(false);
              }
            } catch (err) {
              console.error(" Bulk Ad Comment Error:", err);
              message.error("Error while saving comments for selected ads.");
            }
            return;
          }

          handleOks();
        };
        const handleCancels = () => setIsModalVisibles(false);

        // ====== PIN / UNPIN ======
        const CustomTooltipContent = ({ editedTime, usercommit }) => (
          <div style={{ padding: '5px', borderRadius: '5px' }}>
            <p style={{ margin: 0, color: theme === 'dark' ? "#fff" : "#000" }}>{usercommit}</p>
            <p style={{ margin: 0, color: theme === 'dark' ? "#fff" : "#000" }}>{editedTime}</p>
          </div>
        );

        const handlePinClick = async (campName, campid, asetid, currentPinStatus) => {
          const updatedPinStatus = !currentPinStatus;

          // // optimistic override so UI flips  persists across tabs
          // adPinOverridesRef?.current?.set(pinKey, updatedPinStatus);

          // // flip icon and resort immediately
          // updateLeaf({ __adPinned: updatedPinStatus });
          // refreshThisCell();

          try {
            if (updatedPinStatus) {
              const newResponse = await apiClient.post(
                '/NewPinBulk',
                {
                  accountNumber: rowAccount,
                  campaignname: campaignName,
                  campaignid,
                  adsetid,
                  ad_id: adid,
                  userPin: userdetails?.email,
                  comment: comment || '',
                  level: "ad"
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
                      String(i?.adsetid) === String(adsetid) &&
                      String(i?.ad_id) === String(adid) &&
                      String(i?.level) === 'ad'
                  );

                  if (match >= 0) {
                    arr[match] = { ...arr[match], pinned: true, userPin: userdetails?.email, editedPinTime: timeStamp };
                  } else {
                    arr.push({
                      campaignid,
                      Account: rowAccount,
                      adsetid,
                      ad_id: adid,
                      level: 'ad',
                      pinned: true,
                      userPin: userdetails?.email,
                      editedPinTime: timeStamp
                    });
                  }

                  return arr;
                });
              }
              message.success("pinned!");
            } else {
              const newResponse = await apiClient.post(
                '/NewUnpinBulk',
                {
                  accountNumber: rowAccount,
                  campaignname: campaignName,
                  campaignid,
                  adsetid,
                  ad_id: adid,
                  userPin: userdetails?.email,
                  comment: comment || '',
                  level: "ad"
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
                      String(i?.adsetid) === String(adsetid) &&
                      String(i?.ad_id) === String(adid) &&
                      String(i?.level) === 'ad'
                  );

                  if (match >= 0) {
                    arr[match] = { ...arr[match], pinned: false, userPin: userdetails?.email, editedPinTime: timeStamp };
                  } else {
                    arr.push({
                      campaignid,
                      Account: rowAccount,
                      adsetid,
                      ad_id: adid,
                      level: 'ad',
                      pinned: false,
                      userPin: userdetails?.email,
                      editedPinTime: timeStamp
                    });
                  }

                  return arr;
                });
              }
              message.success("unpinned!");
            }
            // optional: refreshComments(accKey);
          } catch (error) {
            // revert on error
            // adPinOverridesRef?.current?.set(pinKey, currentPinStatus);
            // // params.api.refreshCells({ rowNodes: [params.node], columns: [params.column.getColId()], force: true });
            // // params.api.refreshClientSideRowModel('sort');
            // updateLeaf({ __adPinned: currentPinStatus });
            // refreshThisCell();
            console.error('Error toggling pin status:', error);
            message.error('Error while updating pin status.');
          }
        };
        const handleSmartAdPinClick = async (_campName, campid, asetid, current) => {
          const next = !current;

          // If multiple ads selected
          if (leafCampaigns && leafCampaigns.length > 1) {
            try {
              message.loading({
                content: next ? "Pinning selected ads..." : "Unpinning selected ads...",
                key: "adPin"
              });

              const endpoint = next ? "/NewPinBulk" : "/NewUnpinBulk";

              // Make bulk API calls
              const results = await Promise.allSettled(
                leafCampaigns.map(item =>
                  apiClient.post(
                    endpoint,
                    {
                      accountNumber: item.accountNumber,
                      campaignname: item.adName,
                      campaignid: item.campaignid,
                      adsetid: item.adsetid,
                      ad_id: item.adid,
                      userPin: userdetails?.email,
                      level: "ad"
                    },
                    authHeaders
                  )
                )
              );

              const successCount = results.filter(
                r => r.status === "fulfilled" && (r.value?.status === 200 || r.value?.status === 201)
              ).length;

              const failureCount = results.length - successCount;

              // Update UI (same structure as your single pin logic)
              setCampaignComments(prev => {
                const list = Array.isArray(prev) ? [...prev] : [];
                const ts = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");

                leafCampaigns.forEach(item => {
                  const index = list.findIndex(
                    i =>
                      String(i?.campaignid) === String(item.campaignid) &&
                      String(i?.Account) === String(item.accountNumber) &&
                      String(i?.adsetid) === String(item.adsetid) &&
                      String(i?.ad_id) === String(item.adid) &&
                      String(i?.level) === "ad"
                  );

                  if (index >= 0) {
                    list[index] = {
                      ...list[index],
                      pinned: next,
                      userPin: userdetails?.email,
                      editedPinTime: ts
                    };
                  } else {
                    list.push({
                      campaignid: item.campaignid,
                      Account: item.accountNumber,
                      adsetid: item.adsetid,
                      ad_id: item.adid,
                      level: "ad",
                      pinned: next,
                      userPin: userdetails?.email,
                      editedPinTime: ts
                    });
                  }
                });

                return list;
              });

              message.success({
                content: `${successCount} ad(s) ${next ? "pinned" : "unpinned"}, ${failureCount} failed`,
                key: "adPin",
                duration: 3
              });

            } catch (error) {
              console.error(" Ad Bulk Pin Error:", error);
              message.error("Failed to update selected ads.");
            }

            return; // Important: Stop here
          }

          // If only 1 ad selected → use your existing single logic
          handlePinClick(_campName, campid, asetid, current);
        };
        const PinIcon = ({ campaignName, campaignid, adsetid, pinned, universalOject }) => {
          const pinTimeDisplay =
            editPinUserANdTime?.editedPinTime
              ? moment(editPinUserANdTime.editedPinTime, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A")
              : "";

          return (
            <Tooltip
              title={
                pinned ? (
                  <div style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                    <CustomTooltipContent
                      editedTime={universalOject?.editedPinTime}
                      usercommit={universalOject?.userPin}
                    />
                  </div>
                ) : null
              }
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#111" : "#fff",
                color: theme === "dark" ? "#fff" : "#000",
                border: "1px solid #ccc",
                borderRadius: 6,
              }}
            >
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: "16px" }}
              >
                {pinned ? "📌" : "📍"}
              </button>
            </Tooltip>
          );
        };

        // formatted edited time for comment hover (guard against undefined)
        const editedTimeDisplay =
          editUserANdTime?.editedTime
            ? moment(editUserANdTime.editedTime, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A")
            : "";

        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {/* ACTIVE/PAUSE */}
            <Switch
              //   checked={overrideStatus ? overrideStatus === "ACTIVE" : !!switchStates[adid]}
              //   onClick={(checked) => handlePauseClick(adid, checked)}
              checked={universalOject?.fbStatus ? universalOject?.fbStatus === "ACTIVE" : true}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(checked, e) => { e?.stopPropagation?.(); handlePauseClick(adid, checked); }}
              size="small"
              style={{ backgroundColor: (universalOject?.fbStatus ? universalOject?.fbStatus === "ACTIVE" : true) ? '#91C25F' : '#d9d9d9' }}
            />
            <Modal
              title="Confirm Action"
              open={isAdidModalVisibles}
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
                <p>Are you sure you want to turn {nextChecked ? "ON" : "OFF"} this ad?</p>
                <p>Ad ID: {selectedAdid}</p>
                <p>Ad Name: {adName}</p>
              </div>
            </Modal>

            {/* PIN */}
            <PinIcon
              campaignName={nameKeyForComments}
              campaignid={campaignid}
              adsetid={adsetid}
              pinned={pinnedUI}
              universalOject={universalOject}
            />

            {/* COMMENT ICONS */}
            {hasComment ? (
              <Tooltip
                title={
                  <div>
                    <div>{universalOject?.comment}</div>
                    <div>{universalOject?.editedTime}</div>
                    <div>{universalOject?.usercommit}</div>
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
              <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginLeft: '8px', marginRight: '10px' }} />
            )}

            {/* COPY + LINK + LABEL */}
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
                onClick={() => {
                  navigator.clipboard.writeText(firstColumnValue)
                    .then(() => {
                      setTooltipText("Copied!");
                      setTimeout(() => setTooltipText("Click to Copy"), 2000);
                    })
                    .catch(() => console.error('Failed to copy to clipboard'));
                }}
                style={{ cursor: 'pointer', marginLeft: '0px', color: "#1e1e1f", marginRight: '10px' }}
              />
            </Tooltip>

            <LinkOutlined
              onClick={() => {
                const url = `/LiveHistory/LiveAdHistory/${params.value.replace(/\//g, "*").replace(/-/g, "^")}-${rowAccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              style={{ cursor: 'pointer', marginLeft: '0px', color: "#1e1e1f", marginRight: '5px' }}
            />

            <Tooltip
              title={valueWithCount}
              overlayInnerStyle={{
                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                color: theme === 'dark' ? '#fff' : '#000',
                border: '1px solid #ccc',
                borderRadius: 6,
              }}
            >
              <span>{valueWithCount}</span>
            </Tooltip>

            {/* COMMENT MODAL (AntD v5: use `open`) */}
            <Modal
              title={firstColumnValue}
              className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
              open={isModalVisibles}
              onOk={handleOks}
              onCancel={handleCancels}
              footer={[
                <div key="f" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <div style={{ display: 'flex', flexDirection: "column" }}>
                    <span style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                      Last Edited Time:
                    </span>
                    <span style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                      {editedTimeDisplay}
                    </span>
                  </div>
                  <div>
                    <Button key="delete" type="danger" onClick={handleDelete} style={{ marginRight: 'auto', border: "1px solid #e3e3da" }}>
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
                style={{ color: theme === "dark" ? "white" : "black" }}
              />
            </Modal>
          </div>
        );
      }
    },

    processCellForClipboard: (params) => {
      if (params.node.group) {
        if (!params.node.parent || !params.node.parent.childrenAfterGroup) {
          return params.node.key;
        }
        return params.node.rowIndex === params.node.parent.childrenAfterGroup[0]?.rowIndex
          ? params.node.key
          : "";
      }
      return params.value;
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

  const adStatusMap = useMemo(() => {
    const map = new Map();

    campaignComments.forEach(doc => {
      if (!doc?.campaignid) return;

      const processAdset = (adset) => {
        if (!adset?.adset_id) return;

        const adLevelList = Array.isArray(doc.AdLevel)
          ? doc.AdLevel
          : doc.AdLevel && typeof doc.AdLevel === 'object'
            ? [doc.AdLevel]
            : [];

        adLevelList.forEach(ad => {
          if (!ad?.ad_id || ad.adset_id !== adset.adset_id) return;
          const key = `${doc.campaignid}_${ad.adset_id}_${ad.ad_id}`;
          map.set(key, (ad.status || '').toUpperCase());
        });
      };

      if (Array.isArray(doc.AdsetLevel)) {
        doc.AdsetLevel.forEach(processAdset);
      } else if (doc.AdsetLevel && typeof doc.AdsetLevel === 'object') {
        processAdset(doc.AdsetLevel);
      }
    });

    return map;
  }, [campaignComments]);


  const getAdStatus = (campaignId, adsetId, adId) => {
    const key = `${campaignId}_${adsetId}_${adId}`;
    return adStatusMap.get(key); // returns "ACTIVE" | "PAUSED" | undefined
  };

  const functionCall1 = async () => {
    try {
      // console.log(newRevenuePratner);
      setLoading(true);
      const adsets = selectedAdsets.length > 0
        ? [...new Set(selectedAdsets.map(adset => adset.adsetid))]
        : [];
      const campaigns = selectedCampaigns.length > 0
        ? [...new Set(selectedCampaigns.map(campaign => campaign.campaignid))]
        : [];
      const collectionName = newRevenuePratner === "FB_DomainActive" ? "Facebook_DActive_Names" : newtworkCollections[newRevenuePratner];
      // const fetchData = await apiClient.get(`/Live?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&network=${collectionName}`);
      // const fetchData = await apiClient.post(`/AdLevel?dateStart=${startDate}&dateEnd=${endDate}&accountNumber=${newaccount}&timezone=${newtime}&status=${tabStatus}&network=Facebook_Mnet_AD`, { adsetids : adsets, campaignids : campaigns });

      // ✅ multi-account param (array of strings)
      const accountsParam = Array.isArray(newaccount)
        ? newaccount.map(String)
        : [String(newaccount)];

      // ✅ call the new multi-account endpoint
      const fetchData = await apiClient.post(
        `/AdLevelAccounts`,
        {
          dateStart: startDate,
          dateEnd: endDate,
          accountNumbers: accountsParam,
          timezone: newtime,
          status: tabStatus,                  // "Daily" | "Live"
          network: "Facebook_Mnet_AD",        // keep your original value
          adsetids: adsets,
          campaignids: campaigns
        }
      );
      const mainData1 = fetchData.data || [];
      const mainData = tabStatus === "Live" ? mainData1.filter(obj => !("ad_clicks" in obj)) : mainData;
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
          const category = campaignComments.find(campaign => campaign.campaignname === eachData.campaign_name && campaign.Account === eachData.accountNumber);
          const fbLClicks = parseInt(eachData.fbLinkClicks, 10);
          const spend = parseFloat(eachData.spend);
          const cpcLinkClicks = isNaN(fbLClicks) || fbLClicks === 0 ? 0 : Math.round((spend / fbLClicks) * 100) / 100;
          const campaign_date = Camapignlevelstatus.find(campaign => campaign.campaign_id === eachData.campaign_id && campaign.accountNumber === eachData.accountNumber);
          const getFbStatusKey = campaignComments.find(ad => ad.campaignid === eachData.campaign_id && ad.Account === eachData.accountNumber && ad.adsetid === eachData.adset_id && ad.ad_id === eachData.ad_id && ad.level === 'ad');
          return (

            {
              // ✅ include accountNumber so actions (pin/comment/status) can be per-account
              accountNumber: String(eachData.accountNumber),
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
              adid: eachData.ad_id,
              adname: eachData.adName,
              actions: '...',
              from: "",
              profitloss: "",
              M_tq: "",
              D_tq: "",
              keyword: eachData.keyword,
              category: category?.category || "",
              from: campaign_date?.start ? campaign_date?.start : "",
              to: campaign_date?.end ? campaign_date?.end : "",
              fbStatus: getFbStatusKey?.fbStatus ?? "ACTIVE",
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

      let newFilterData;
      if (campaignStatusFilter !== "All") {
        newFilterData = filteredData.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
      }
      else {
        newFilterData = filteredData;
      }

      setRowData(newFilterData);
      newRowDataForFilter.current = filteredData;

      // const filteredByStatus =
      //   !campaignStatusFilter || campaignStatusFilter.toUpperCase() === 'ALL'
      //     ? filteredData
      //     : filteredData.filter(item => {
      //       const raw = getAdStatus(item.campaignid, item.adsetid, item.adid);
      //       const status = (raw || 'ACTIVE').toUpperCase();
      //       return status === campaignStatusFilter.toUpperCase();
      //     });

      // setRowData(filteredByStatus); // or setAdLevelData if you use a different state


      setLiveFixedFooter([
        {
          campaignName: 'Total',
          actions: "",
          spend: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
          revenue: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
          profit: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
          margin: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
          rpc: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / newFilterData?.length).toFixed(2)),
          cpl: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / newFilterData?.length).toFixed(2)),
          ncpl: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / newFilterData?.length).toFixed(2)),
          fbleads: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
          conversions: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
          fmargin: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
          roi: parseFloat(((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
          cpc: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / newFilterData?.length).toFixed(2)),
          cpclinkclicks: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks), 0) / newFilterData?.length).toFixed(2)),
          fbclicks: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
          fblinkclicks: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0).toFixed(2)),
          impressions: parseFloat(newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
          ctr: parseFloat((newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / newFilterData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
        }
      ]);

      // setLiveFixedFooter([
      //     {
      //         campaignName: 'Total',
      //         actions: "",
      //         spend: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0).toFixed(2)),
      //         revenue: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0).toFixed(2)),
      //         profit: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0).toFixed(2)),
      //         margin: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
      //         rpc: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.rpc), 0) / filteredData?.length).toFixed(2)),
      //         cpl: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpl), 0) / filteredData?.length).toFixed(2)),
      //         ncpl: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.ncpl), 0) / filteredData?.length).toFixed(2)),
      //         fbleads: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbleads), 0).toFixed(2)),
      //         conversions: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.conversions), 0).toFixed(2)),
      //         fmargin: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.profit), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
      //         roi: parseFloat(((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) - filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0)) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.spend), 0) * 100).toFixed(2)),
      //         cpc: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpc), 0) / filteredData?.length).toFixed(2)),
      //         cpclinkclicks: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.cpclinkclicks), 0) / filteredData?.length).toFixed(2)),
      //         fbclicks: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0).toFixed(2)),
      //         fblinkclicks: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fblinkclicks), 0).toFixed(2)),
      //         impressions: parseFloat(filteredData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0).toFixed(2)),
      //         ctr: parseFloat((filteredData?.reduce((acc, curr) => acc + parseFloat(curr.fbclicks), 0) / filteredData?.reduce((acc, curr) => acc + parseFloat(curr.impressions), 0) * 100).toFixed(2))
      //     }
      // ]);
      // setRowData(filteredData);

      console.log(filteredData, "filteredData");
      newRowData.current = filteredData;
      fetchData.status === 200 && console.log("Success");
      fetchData.status === 200 && setApiStatus(false);
      // setInitialRowData(filteredData);
      // setTrue(false);
      setLoading(false);
    }
    catch (error) {
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

    if (event.colDef.field === "adname") {
      const value = event.value;
      if (value !== undefined) {
        const url = `/LiveHistory/LiveAdHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${newaccount}-${newtime}-${newtworkCollections[newRevenuePratner]}`;
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
  // useEffect(() => {
  //   if (activeTab === "3") {
  //     functionCall1();
  //   }
  //   // if(selectedAdsets){
  //   // console.log("test2");
  //   // functionCall1();
  //   // oneTimeFetch.current = false;
  //   // }
  // }, [selectedAdsets, selectedCampaigns, activeTab]);
  const ranOnce = useRef(false);
  const prevAdsets = useRef(null);
  const prevCampaigns = useRef(null);

  useEffect(() => {
    if (activeTab !== "3") return; // only care when tab 3 is active

    const adsetsStr = JSON.stringify(selectedAdsets);
    const campsStr = JSON.stringify(selectedCampaigns);

    const changed =
      !ranOnce.current ||
      prevAdsets.current !== adsetsStr ||
      prevCampaigns.current !== campsStr;

    if (changed) {
      functionCall1();

      // mark current values as seen
      ranOnce.current = true;
      prevAdsets.current = adsetsStr;
      prevCampaigns.current = campsStr;
    }
  }, [activeTab, selectedAdsets, selectedCampaigns]);

  useEffect(() => {
    // functionCall1();
    console.log(campaignStatusFilter, "campaignStatusFilter");
    if (campaignStatusFilter !== "All") {
      const filteredByStatus = newRowDataForFilter.current.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
      setRowData(filteredByStatus);
    } else {
      setRowData(newRowDataForFilter.current);
    }
  }, [campaignStatusFilter]);

  useEffect(() => {
    // console.log(campaignComments, "campaignComments");
    // console.log(campaignStatusFilter, "campaignStatusFilter");
    // console.log(campaignComments.filter(ad => ad.level === 'ad'), "campaignComments.filter(ad => ad.level === 'ad')");
    const mainData = newRowDataForFilter.current;
    // console.log(mainData, "mainData");
    const filterData = mainData && mainData.length > 0 ?
      mainData.map((eachData) => {
        const getFbStatusKey = campaignComments.find(ad => ad.campaignid === eachData.campaignid && ad.Account === eachData.accountNumber && ad.adsetid === eachData.adsetid && ad.ad_id === eachData.adid && ad.level === 'ad');
        // console.log(getFbStatusKey, "getFbStatusKey");
        // console.log(eachData?.adName, "eachData");
        return (
          {
            ...eachData,
            fbStatus: getFbStatusKey?.fbStatus ?? "ACTIVE",
          }
        )
      }) : null;
    newRowDataForFilter.current = filterData;
    let newFilterData;
    if (campaignStatusFilter !== "All") {
      newFilterData = filterData?.filter(item => item.fbStatus?.toUpperCase() === campaignStatusFilter?.toUpperCase());
    }
    else {
      newFilterData = filterData;
    }

    setRowData(newFilterData);
    // newRowDataForFilter.current = filteredData;
  }
    , [campaignComments]);
  // useEffect(() => {
  //   // console.log("test1");
  //   functionCall1();
  // }, [campaignStatusFilter]);

  useEffect(() => {
    if (refreshpage === "Refresh13") {
      // console.log("test3");
      handleReFetchData();

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

  // const handleTabChange = (key) => {
  //   console.log("Switched to Tab:", key); // Debugging log
  //   setActiveTab(key);
  // };

  const items = [
    { key: '1', label: 'Campaigns', content: 'Content for Campaign data' },
    { key: '2', label: 'Adset', content: 'Content for Adset data' },
    { key: '3', label: 'Ad', content: 'Content for Ad data' }
  ];

  // const handleCarouselChange = (index) => {
  //   setActiveTab(index);
  //   // console.log(index);
  //   // console.log(parseInt(index)-1);
  //   // carouselRef.current.goTo(parseInt(index))
  //   // localStorage.setItem("activeTab", index);

  // };

  // const renderCarouselNav = () => (
  //   <StickyBox offsetTop={64} offsetBottom={20} style={{ zIndex: 1, padding: '0px', margin: '0px', paddingLeft: '12px', paddingTop: '15px' }}>
  //     <Tabs
  //       activeKey={activeTab}
  //       onChange={handleCarouselChange}
  //       items={items.map((item) => ({
  //         key: item.key,
  //         label: item.label,
  //       }))}
  //       className={`custom-tabs ${theme === 'dark' ? 'dark-mode-tabs' : 'light-mode-tabs'}`}
  //       style={{
  //         backgroundColor: 'transparent',
  //         padding: '0',
  //         marginBottom: '0',
  //       }}
  //       tabBarStyle={{
  //         fontSize: '12px',
  //         padding: '0',
  //         height: '30px',
  //         lineHeight: '30px',
  //         marginBottom: '-1px',
  //         borderBottom: 'none',
  //       }}
  //     />
  //   </StickyBox>
  // );



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

  // normalize to array
  useEffect(() => {
    if (removeSelectedAds === "Remove") {
      // if (gridRef.current) {
      //   gridRef.current.api.deselectAll();


      // }
      const api = gridRef.current.api;
      api.deselectAll();
      api.forEachNode((node) => {
        node.selectThisNode(false);
      });
    }
  }, [removeSelectedAds]);
  const ids = Array.isArray(newaccount)
    ? newaccount
    : (newaccount ? [newaccount] : []);

  return (
    <div>
      <div style={{ height: "100%", marginBottom: '20px', overflow: "visible" }}>
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
          ) : newRowDataForFilter.current?.length > 0 ? (
            <div>
              <Row className="header-row" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'nowrap', backgroundColor: theme === "dark" && "#4d4d4d" }}>
                <Col xs={24} sm={24} md={8} style={{ flex: '0.2 1 auto' }}>
                  <Space align="center">
                    <div className="blinking-circle-1"></div>
                    <Text style={{ paddingLeft: '3px', fontSize: '15px', color: theme === "dark" && "white" }}>Live</Text>
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
                        onOk={handleBulkAdStatusSubmit}
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
                              onClick={() => handleBulkSmartPinAd("pin")}
                            >
                              📌
                            </span>
                            <span
                              style={{ cursor: "pointer", fontSize: "18px" }}
                              onClick={() => handleBulkSmartPinAd("unpin")}
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
                      <Tooltip title="Bulk Comment" overlayInnerStyle={{
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
                        title="Bulk Comment"
                        open={isBulkCommentModalVisible}
                        className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                        onCancel={() => setIsBulkCommentModalVisible(false)}
                        footer={[
                          <Button key="cancel" onClick={() => setIsBulkCommentModalVisible(false)}>
                            Cancel
                          </Button>,
                          <Button
                            key="ok"
                            style={{ backgroundColor: "#91C25F" }}
                            onClick={() => {
                              handleBulkCommentSubmitAd();
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
                        className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                        onCancel={() => setBulkOpen(false)}
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
                {/* {ids.length === 0 && <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                        <Text style={{ color: theme === "dark" && "white" }}>Name: {newAccountName}</Text>
                                    </Col>}
                                    <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                                        <Text style={{ color: theme === "dark" && "white" }}>Time zone: {timezone.current}</Text>
                                    </Col> */}
                <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                  <Text style={{ color: theme === "dark" && "white" }}>F/N Hour: {maxHour.current}:00 / {maxNetworkHour.current}:00</Text>
                </Col>

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
                      <div style={{ fontSize: '13px' }}>
                        <div>Fb status: {`${fbCron.current?.toLowerCase()}`}</div>
                        <div>Rev status: {`${revenueCron.current?.toLowerCase()}`}</div>
                        <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                          Cron status: {cronStatus.current?.toLowerCase()}
                          {/* <span style={{ color: accountStatus.current === 'Active' ? '#91C25F' : '#EC7117', }}>
                                                        {accountStatus.current}
                                                    </span> */}
                        </Text>
                        <div>Account:
                          <span style={{ marginLeft: '3px', color: accountStatus.current === 'Active' ? '#91C25F' : '#EC7117', }}>
                            {accountStatus.current}
                          </span>
                        </div>
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
                    <InfoCircleOutlined style={{ fontSize: '18px', cursor: 'pointer', marginRight: '10px', color: "#91C25F" }} className="black-icon-info" />
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
                  <Button type="primary" style={{ backgroundColor: '#91C25F', border: 'solid 0px', color: 'black' }} icon={<DownloadOutlined className="black-icon" />} onClick={onBtExport1} />
                  {/* </Tooltip> */}
                </Col>
              </Row>
              {rowData?.length > 0 ?
                <div
                  className={`ag-theme-alpine ag-container ${gridThemeClass}`}
                >


                  <div className='table-container'>
                    <AgGridReact
                      ref={gridRef}
                      rowHeight={30}
                      className='custom-grid'
                      rowData={memorizedRowData}
                      rowSelection='multiple'
                      columnDefs={memorizedColumnDef}
                      defaultColDef={{ ...defaultColDef, suppressMenu: true }}
                      // onCellClicked={onCellClickedLive}
                      onSelectionChanged={onSelectionChanged}
                      groupSelectsChildren={true} // ✅ Selects all children when a group is selected
                      suppressRowClickSelection={true}
                      context={context}
                      pagination={true}
                      paginationPageSize={200}
                      paginationPageSizeSelector={[20, 40, 60, 80, 100, 150, 200]}
                      suppressAggFuncInHeader={true}
                      getMainMenuItems={getMainMenuItems}
                      getRowId={(params) => String(params.data.adid)}


                      // onRangeSelectionChanged={onRangeSelectionChanged} // ✅ Captures range selection
                      // onCellKeyDown={onCellKeyDown}
                      // domLayout="normal"
                      // groupIncludeTotalFooter={rowData.length > 0 ? true : false}
                      // groupIncludeFooter={rowData.length > 0 ? true : false}
                      autoGroupColumnDef={autoGroupColumnDefLive}
                      onGridReady={(params) => onGridReady(params, 'grid1', gridRef)}
                      gridOptions={{
                        ...gridOptions,
                        ensureDomOrder: false,
                        enableCharts: true,
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
                            height: '30px'
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


                </div>
                :
                <div
                  className={`ag-theme-alpine ag-container ${gridThemeClass}`}
                >
                  <div className='table-container'>
                    <AgGridReact
                      ref={gridRef}
                      rowHeight={30}
                      className='custom-grid'
                      rowData={[]}
                      rowSelection='multiple'
                      columnDefs={memorizedColumnDef}
                      defaultColDef={{ ...defaultColDef, suppressMenu: true }}
                      // onCellClicked={onCellClickedLive}
                      onSelectionChanged={onSelectionChanged}
                      groupSelectsChildren={true} // ✅ Selects all children when a group is selected
                      suppressRowClickSelection={true}
                      context={context}
                      pagination={true}
                      paginationPageSize={200}
                      paginationPageSizeSelector={[20, 40, 60, 80, 100, 150, 200]}
                      suppressAggFuncInHeader={true}
                      getMainMenuItems={getMainMenuItems}
                      getRowId={(params) => params.data.adid}

                      // onRangeSelectionChanged={onRangeSelectionChanged} // ✅ Captures range selection
                      // onCellKeyDown={onCellKeyDown}
                      // domLayout="normal"
                      // groupIncludeTotalFooter={rowData.length > 0 ? true : false}
                      // groupIncludeFooter={rowData.length > 0 ? true : false}
                      autoGroupColumnDef={autoGroupColumnDefLive}
                      onGridReady={(params) => onGridReady(params, 'grid1', gridRef)}
                      gridOptions={{
                        ...gridOptions,
                        ensureDomOrder: false,
                        enableCharts: true,
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
                            height: '30px'
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


                </div>
              }
            </div>
          ) : <div style={{ backgroundColor: theme === "dark" && "#333" }}>
            <Result
              className={theme === 'dark' ? 'dark-result' : 'light-result'}
              icon={<SmileOutlined />}
              title={`No LiveData for ${newaccount} from ${startDate} to ${endDate}`}
            // extra={<Button type="primary">Next</Button>}
            />
          </div>}
        </div>
      </div>

    </div>
  );

};

export default AdLevelReports;